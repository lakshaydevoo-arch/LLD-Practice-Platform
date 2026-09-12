import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = createApp(prisma);

describe('REST API Endpoints', () => {
  let createdAttemptId: string;
  let problemId: string;

  beforeAll(async () => {
    // Ensure test problem exists
    const problem = await prisma.problem.findFirst();
    if (problem) {
      problemId = problem.id;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('lld-practice-platform');
  });

  it('GET /api/problems returns seeded problems', async () => {
    const res = await request(app).get('/api/problems');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const parkingLot = res.body.data.find((p: any) => p.slug === 'parking-lot');
    expect(parkingLot).toBeDefined();
    expect(parkingLot.title).toContain('Parking Lot');
  });

  it('GET /api/problems/:id returns problem details', async () => {
    const res = await request(app).get(`/api/problems/${problemId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(problemId);
  });

  it('POST /api/attempts creates a new attempt', async () => {
    const res = await request(app)
      .post('/api/attempts')
      .send({
        problemId,
        userId: 'demo-learner-001',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('DRAFT');
    createdAttemptId = res.body.data.id;
  });

  it('PUT /api/attempts/:id saves a draft solution', async () => {
    const draftSolution = {
      classes: [
        { name: 'ParkingLot', responsibility: 'Draft lot manager', attributes: ['id'] },
      ],
      interfaces: [],
      relationships: [],
      methods: [],
      patterns: [],
      explanation: 'Draft work in progress',
    };

    const res = await request(app)
      .put(`/api/attempts/${createdAttemptId}`)
      .send(draftSolution);

    expect(res.status).toBe(200);
    expect(res.body.data.classes.length).toBe(1);
    expect(res.body.data.explanation).toBe('Draft work in progress');
  });

  it('POST /api/attempts/:id/submit evaluates solution and persists evaluation', async () => {
    const fullSolution = {
      classes: [
        { name: 'ParkingLot', responsibility: 'Coordinates floor allocation and entrance gates.', attributes: ['floors', 'entranceGates'] },
        { name: 'ParkingFloor', responsibility: 'Tracks spot occupancy per floor.', attributes: ['floorNumber', 'spots'] },
        { name: 'ParkingSpot', responsibility: 'Physical parking spot.', attributes: ['spotId', 'type'] },
        { name: 'Vehicle', responsibility: 'Vehicle model.', attributes: ['licensePlate', 'type'] },
        { name: 'ParkingTicket', responsibility: 'Session ticket with issue time.', attributes: ['ticketId', 'issuedAt'] },
      ],
      interfaces: [
        { name: 'PricingStrategy', responsibility: 'Fee calculation contract.', methods: ['calculateFee(ticket): Money'] },
      ],
      relationships: [
        { fromEntity: 'ParkingLot', type: 'COMPOSITION', toEntity: 'ParkingFloor' },
        { fromEntity: 'ParkingFloor', type: 'COMPOSITION', toEntity: 'ParkingSpot' },
        { fromEntity: 'ParkingTicket', type: 'ASSOCIATION', toEntity: 'ParkingSpot' },
      ],
      methods: [
        { name: 'assignSpot', ownerClass: 'ParkingLot', purpose: 'Finds vacant spot', inputs: ['Vehicle'], output: 'ParkingSpot' },
      ],
      patterns: ['Strategy', 'Factory'],
      explanation: 'Decoupled pricing strategy using Strategy pattern.',
    };

    const res = await request(app)
      .post(`/api/attempts/${createdAttemptId}/submit`)
      .send(fullSolution);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('EVALUATED');
    expect(res.body.data.evaluation).toBeDefined();
    expect(res.body.data.evaluation.overallScore).toBeGreaterThan(6);
    expect(res.body.data.evaluation.dimensions.length).toBe(6);
  });

  it('GET /api/attempts/:id/evaluation retrieves evaluated feedback', async () => {
    const res = await request(app).get(`/api/attempts/${createdAttemptId}/evaluation`);
    expect(res.status).toBe(200);
    expect(res.body.data.overallScore).toBeDefined();
    expect(Array.isArray(res.body.data.feedbackItems)).toBe(true);
  });

  it('Retry creates a new attempt rather than overwriting existing attempt', async () => {
    // Check initial count of attempts for problem
    const initialList = await request(app).get(`/api/attempts?problemId=${problemId}`);
    const initialCount = initialList.body.data.length;

    // Learner retries problem -> creates new attempt
    const newAttemptRes = await request(app)
      .post('/api/attempts')
      .send({
        problemId,
        userId: 'demo-learner-001',
      });

    expect(newAttemptRes.status).toBe(201);
    const newAttemptId = newAttemptRes.body.data.id;
    expect(newAttemptId).not.toBe(createdAttemptId);

    // List attempts again -> count incremented and historical attempt remains untouched
    const updatedList = await request(app).get(`/api/attempts?problemId=${problemId}`);
    expect(updatedList.body.data.length).toBe(initialCount + 1);

    const oldAttempt = updatedList.body.data.find((a: any) => a.id === createdAttemptId);
    const newAttempt = updatedList.body.data.find((a: any) => a.id === newAttemptId);

    expect(oldAttempt.status).toBe('EVALUATED');
    expect(newAttempt.status).toBe('DRAFT');
  });
});
