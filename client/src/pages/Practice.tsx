import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Problem, Attempt, SolutionData, ClassDefinition, InterfaceDefinition, Relationship, MethodDefinition } from '../types';
import { ClassEditor } from '../components/ClassEditor';
import { InterfaceEditor } from '../components/InterfaceEditor';
import { RelationshipEditor } from '../components/RelationshipEditor';
import { MethodEditor } from '../components/MethodEditor';
import { PatternSelector } from '../components/PatternSelector';
import {
  Save,
  Send,
  Box,
  Cpu,
  GitFork,
  Terminal,
  Layers,
  FileText,
  Code2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const Practice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [, setAttempt] = useState<Attempt | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showReqs, setShowReqs] = useState(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'interfaces' | 'relationships' | 'methods' | 'patterns' | 'explanation' | 'code'>('classes');

  // Solution State
  const [classes, setClasses] = useState<ClassDefinition[]>([]);
  const [interfaces, setInterfaces] = useState<InterfaceDefinition[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [methods, setMethods] = useState<MethodDefinition[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [optionalCode, setOptionalCode] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const att = await api.getAttempt(id);
        setAttempt(att);
        const prob = await api.getProblem(att.problemId);
        setProblem(prob);

        if (att.solution) {
          setClasses(att.solution.classes || []);
          setInterfaces(att.solution.interfaces || []);
          setRelationships(att.solution.relationships || []);
          setMethods(att.solution.methods || []);
          setPatterns(att.solution.patterns || []);
          setExplanation(att.solution.explanation || '');
          setOptionalCode(att.solution.optionalCode || '');
        }
      } catch (err) {
        console.error('Failed to load attempt workspace:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const currentSolution: SolutionData = useMemo(() => ({
    classes,
    interfaces,
    relationships,
    methods,
    patterns,
    explanation,
    optionalCode,
  }), [classes, interfaces, relationships, methods, patterns, explanation, optionalCode]);

  const allEntityNames = useMemo(() => {
    const classNames = classes.map((c) => c.name.trim()).filter(Boolean);
    const ifaceNames = interfaces.map((i) => i.name.trim()).filter(Boolean);
    return [...classNames, ...ifaceNames];
  }, [classes, interfaces]);

  const availableClassNames = useMemo(() => {
    return classes.map((c) => c.name.trim()).filter(Boolean);
  }, [classes]);

  // Live client-side structural validation warnings
  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];

    // Check duplicate classes
    const names = allEntityNames.map((n) => n.toLowerCase());
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    if (duplicates.length > 0) {
      warnings.push(`Duplicate entity name: "${duplicates[0]}". Class and interface names must be unique.`);
    }

    // Check dangling relationships
    const entitySet = new Set(names);
    for (const rel of relationships) {
      if (rel.fromEntity && !entitySet.has(rel.fromEntity.toLowerCase().trim())) {
        warnings.push(`Relationship refers to undefined entity "${rel.fromEntity}".`);
        break;
      }
      if (rel.toEntity && !entitySet.has(rel.toEntity.toLowerCase().trim())) {
        warnings.push(`Relationship refers to undefined entity "${rel.toEntity}".`);
        break;
      }
    }

    return warnings;
  }, [allEntityNames, relationships]);

  const handleSaveDraft = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.saveDraft(id, currentSolution);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (classes.length === 0 && interfaces.length === 0) {
      alert('Please define at least one class or interface before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitAttempt(id, currentSolution);
      navigate(`/attempt/${id}/feedback`);
    } catch (err: any) {
      console.error('Failed to submit attempt:', err);
      alert(`Submission evaluation failed: ${err?.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Preset loaders for quick evaluation testing
  const loadStrongParkingLotSolution = () => {
    setClasses([
      {
        name: 'ParkingLot',
        responsibility: 'Coordinates multi-floor operations and manages entrance/exit gates.',
        attributes: ['id: string', 'floors: ParkingFloor[]', 'entranceGates: EntranceGate[]', 'exitGates: ExitGate[]'],
      },
      {
        name: 'ParkingFloor',
        responsibility: 'Encapsulates spot management for an individual level and queries availability.',
        attributes: ['floorNumber: int', 'spots: ParkingSpot[]'],
      },
      {
        name: 'ParkingSpot',
        responsibility: 'Represents a parking space with size profile and occupancy state.',
        attributes: ['spotId: string', 'type: SpotType', 'isOccupied: boolean', 'parkedVehicle: Vehicle'],
      },
      {
        name: 'Vehicle',
        responsibility: 'Base vehicle representation encapsulating license plate and size profile.',
        attributes: ['licensePlate: string', 'vehicleType: VehicleType'],
      },
      {
        name: 'ParkingTicket',
        responsibility: 'Session receipt issued at entrance tracking entry timestamp and assigned spot.',
        attributes: ['ticketId: string', 'issuedAt: Date', 'assignedSpot: ParkingSpot', 'vehiclePlate: string'],
      },
      {
        name: 'EntranceGate',
        responsibility: 'Reads incoming vehicle, queries available spot, and issues new ParkingTicket.',
        attributes: ['gateId: string'],
      },
      {
        name: 'ExitGate',
        responsibility: 'Scans ticket, delegates fee calculation to PricingStrategy, and processes payment.',
        attributes: ['gateId: string', 'pricingStrategy: PricingStrategy'],
      },
    ]);

    setInterfaces([
      {
        name: 'PricingStrategy',
        responsibility: 'Pluggable algorithm contract to compute parking fee based on duration and vehicle type.',
        methods: ['calculateFee(ticket: ParkingTicket, vehicle: Vehicle): Money'],
      },
      {
        name: 'ParkingAssignmentStrategy',
        responsibility: 'Strategy contract for allocating optimal spots across floors.',
        methods: ['findSpot(floors: ParkingFloor[], vehicle: Vehicle): ParkingSpot'],
      },
    ]);

    setRelationships([
      { fromEntity: 'ParkingLot', type: 'COMPOSITION', toEntity: 'ParkingFloor' },
      { fromEntity: 'ParkingFloor', type: 'COMPOSITION', toEntity: 'ParkingSpot' },
      { fromEntity: 'ParkingLot', type: 'AGGREGATION', toEntity: 'EntranceGate' },
      { fromEntity: 'ParkingLot', type: 'AGGREGATION', toEntity: 'ExitGate' },
      { fromEntity: 'ExitGate', type: 'DEPENDENCY', toEntity: 'PricingStrategy' },
      { fromEntity: 'ParkingTicket', type: 'ASSOCIATION', toEntity: 'ParkingSpot' },
      { fromEntity: 'ParkingSpot', type: 'ASSOCIATION', toEntity: 'Vehicle' },
    ]);

    setMethods([
      {
        name: 'assignSpot',
        ownerClass: 'EntranceGate',
        purpose: 'Dispatches assignment strategy to reserve spot and issue ticket.',
        inputs: ['vehicle: Vehicle'],
        output: 'ParkingTicket',
      },
      {
        name: 'processExit',
        ownerClass: 'ExitGate',
        purpose: 'Settles payment using active PricingStrategy and vacates spot.',
        inputs: ['ticket: ParkingTicket'],
        output: 'Receipt',
      },
    ]);

    setPatterns(['Strategy', 'Factory', 'Composition over Inheritance']);
    setExplanation(
      'Employed Strategy Pattern for PricingStrategy and ParkingAssignmentStrategy to comply with the Open/Closed Principle. If weekend discounts or VIP rates are introduced, new strategies can be plugged in without mutating ParkingLot or ExitGate. Composition is used between ParkingLot, ParkingFloor, and ParkingSpot to avoid fragile inheritance.'
    );
    setOptionalCode(`public interface PricingStrategy {
    Money calculateFee(ParkingTicket ticket, Vehicle vehicle);
}

public class HourlyPricingStrategy implements PricingStrategy {
    @Override
    public Money calculateFee(ParkingTicket ticket, Vehicle vehicle) {
        long hours = Duration.between(ticket.getIssuedAt(), Instant.now()).toHours();
        double baseRate = vehicle.getType() == VehicleType.TRUCK ? 40.0 : 20.0;
        return new Money(Math.max(1, hours) * baseRate);
    }
}`);
  };

  const loadGodClassParkingLotSolution = () => {
    setClasses([
      {
        name: 'ParkingLot',
        responsibility: 'Handles vehicle check-in, checks spot availability, prints tickets, calculates fees directly using hardcoded rates, processes credit card payments, and opens gates.',
        attributes: ['spots: string[]', 'revenue: double', 'currentCars: string[]'],
      },
    ]);

    setInterfaces([]);
    setRelationships([]);
    setMethods([
      {
        name: 'calculateFee',
        ownerClass: 'ParkingLot',
        purpose: 'Calculates fee directly using hardcoded conditional logic.',
        inputs: ['hours: int', 'type: string'],
        output: 'double',
      },
      {
        name: 'processPayment',
        ownerClass: 'ParkingLot',
        purpose: 'Calls payment gateway directly.',
        inputs: ['amount: double'],
        output: 'boolean',
      },
    ]);
    setPatterns(['Singleton']);
    setExplanation('Put everything inside a central ParkingLot singleton so it is simple to call from anywhere.');
    setOptionalCode('');
  };

  const clearSolution = () => {
    setClasses([]);
    setInterfaces([]);
    setRelationships([]);
    setMethods([]);
    setPatterns([]);
    setExplanation('');
    setOptionalCode('');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-[#64748B]">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-6 bg-[#E2E8F0] rounded w-1/4" />
          <div className="h-48 bg-[#E2E8F0] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Link to="/" className="hover:text-[#0F172A]">Problems</Link>
            <span>/</span>
            <Link to={`/problems/${problem?.slug || problem?.id}`} className="hover:text-[#0F172A]">
              {problem?.title || 'Problem'}
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] font-medium">Workspace</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              {problem?.title}
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
              {problem?.difficulty}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {lastSaved && (
            <span className="text-xs text-[#64748B] mr-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Saved at {lastSaved}
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5 text-[#64748B]" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>
        </div>
      </div>

      {/* Preset Solutions Bar (Subtle Developer Utilities) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white border border-[#E2E8F0] shadow-sm text-xs">
        <div className="flex items-center gap-2 text-[#475569]">
          <Sliders className="h-4 w-4 text-[#64748B]" />
          <span className="font-medium text-[#0F172A]">Sample Solutions:</span>
          <span className="text-[#64748B] hidden sm:inline">(Populate reference designs to test evaluation)</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadStrongParkingLotSolution}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] font-medium transition-colors"
            title="Populate decoupled design adhering to SOLID principles"
          >
            Load Decoupled Design
          </button>
          <button
            type="button"
            onClick={loadGodClassParkingLotSolution}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#F8FAFC] text-[#B91C1C] border border-[#FECACA] font-medium transition-colors"
            title="Populate monolithic God Class design"
          >
            Load Monolithic Design
          </button>
          <button
            type="button"
            onClick={clearSolution}
            className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0]"
            title="Reset Workspace"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Requirements Drawer */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowReqs(!showReqs)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        >
          <span className="flex items-center gap-2 text-[#0F172A] font-semibold">
            <FileText className="h-3.5 w-3.5 text-[#64748B]" />
            Problem Specifications & Constraints Reference
          </span>
          {showReqs ? <ChevronUp className="h-4 w-4 text-[#64748B]" /> : <ChevronDown className="h-4 w-4 text-[#64748B]" />}
        </button>

        {showReqs && problem && (
          <div className="p-4 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#F8FAFC]">
            <div>
              <div className="font-semibold text-[#0F172A] mb-1">Functional Requirements:</div>
              <ul className="space-y-1 text-[#475569] list-disc list-inside">
                {problem.functionalRequirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[#0F172A] mb-1">Expected Domain Entities:</div>
              <div className="flex flex-wrap gap-1">
                {problem.expectedEntities.map((e, i) => (
                  <span key={i} className="font-mono bg-white px-2 py-0.5 rounded border border-[#CBD5E1] text-[#0F172A]">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Structural Warnings Banner */}
      {validationWarnings.length > 0 && (
        <div className="p-3 rounded-md bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{validationWarnings.join(' ')}</span>
        </div>
      )}

      {/* Workspace Tabs & Panels */}
      <div className="space-y-3">
        {/* Tab Strip */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#E2E8F0] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'classes'
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            1. Classes ({classes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interfaces')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'interfaces'
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            2. Interfaces ({interfaces.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('relationships')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'relationships'
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <GitFork className="h-3.5 w-3.5" />
            3. Relationships ({relationships.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('methods')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'methods'
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            4. Methods ({methods.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('patterns')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'patterns'
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            5. Patterns ({patterns.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explanation')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'explanation'
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            6. Explanation
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'code'
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            7. Code Snippet
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm min-h-[440px]">
          {activeTab === 'classes' && (
            <ClassEditor classes={classes} onChange={setClasses} />
          )}

          {activeTab === 'interfaces' && (
            <InterfaceEditor interfaces={interfaces} onChange={setInterfaces} />
          )}

          {activeTab === 'relationships' && (
            <RelationshipEditor
              relationships={relationships}
              availableEntities={allEntityNames}
              onChange={setRelationships}
            />
          )}

          {activeTab === 'methods' && (
            <MethodEditor
              methods={methods}
              availableClasses={availableClassNames}
              onChange={setMethods}
            />
          )}

          {activeTab === 'patterns' && (
            <PatternSelector
              selectedPatterns={patterns}
              onChange={setPatterns}
            />
          )}

          {activeTab === 'explanation' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#475569]" />
                  Design Rationale & Trade-offs
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Explain why this architecture was chosen, key extensibility decisions, and trade-offs.
                </p>
              </div>

              <textarea
                rows={10}
                placeholder="Detail your design rationale:
1. Why were specific abstractions chosen?
2. How does the design support future extensions?
3. What trade-offs were made between simplicity and extensibility?"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md p-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none leading-relaxed font-sans"
              />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#475569]" />
                  Implementation Code Snippet (Optional)
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Demonstrate critical class/interface skeletons or strategy method implementations.
                </p>
              </div>

              <textarea
                rows={12}
                placeholder="// Write code demonstrating critical method signatures or strategies
public interface PricingStrategy {
    Money calculateFee(ParkingTicket ticket);
}"
                value={optionalCode}
                onChange={(e) => setOptionalCode(e.target.value)}
                className="w-full text-xs font-mono bg-[#0F172A] border border-[#1E293B] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md p-3 text-emerald-400 placeholder:text-[#64748B] focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
