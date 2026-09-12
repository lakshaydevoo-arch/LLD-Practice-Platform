import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'learner@lldarena.dev' },
    update: {},
    create: {
      id: 'demo-learner-001',
      email: 'learner@lldarena.dev',
      name: 'Alex Rivera (Staff Engineer Trainee)',
    },
  });
  console.log(`Seeded user: ${demoUser.name} (${demoUser.id})`);

  // 2. Seed Problems
  const problems = [
    {
      id: 'prob-parking-lot',
      slug: 'parking-lot',
      title: 'Parking Lot Management System',
      difficulty: 'MEDIUM',
      timeEstimate: '20–25 min',
      shortDescription: 'Design an automated multi-floor parking lot supporting various vehicle types, dynamic fee calculations, and spot allocation strategies.',
      requirements: JSON.stringify([
        'Manage multiple floors, each with designated parking spots categorized by size/type (Compact, Large, Handicapped, Motorcycle, Electric).',
        'Support multiple vehicle types (Motorcycle, Car, SUV, Bus/Truck, Electric Vehicle) with strict spot assignment rules.',
        'Issue a timestamped Parking Ticket at entrance gates with a unique identifier and assigned spot.',
        'Calculate parking fees upon exit based on duration, vehicle category, and configurable pricing strategies (e.g. hourly, flat rate, peak surge).',
        'Support real-time querying of spot availability per floor and vehicle type.',
        'Process exit payments and mark parking spots as vacant immediately upon departure.',
      ]),
      functionalRequirements: JSON.stringify([
        'Entrance Gate: Read vehicle dimensions/type, query parking strategy for best available spot, issue ticket.',
        'Exit Gate: Scan ticket, calculate fee using PricingStrategy, accept payment, release spot.',
        'Display Board: Reflect live count of open spots per level.',
        'Extensibility: Allow new pricing rules (e.g., weekend discounts, EV charging surcharge) without modifying core lot logic.',
      ]),
      expectedEntities: JSON.stringify([
        'ParkingLot',
        'ParkingFloor',
        'ParkingSpot',
        'Vehicle',
        'ParkingTicket',
        'PricingStrategy',
        'Payment',
        'EntranceGate',
        'ExitGate',
      ]),
      expectedBehaviours: JSON.stringify([
        'assignSpot(vehicle): ParkingSpot',
        'issueTicket(vehicle, spot): ParkingTicket',
        'calculateFee(ticket): Money',
        'processPayment(ticket, paymentMethod): boolean',
        'vacateSpot(spotId): void',
        'getAvailableSpots(floorId, spotType): int',
      ]),
      constraints: JSON.stringify([
        'Single Responsibility: ParkingLot must not directly compute pricing mathematics or handle credit card gateway protocols.',
        'Open/Closed: New vehicle types or pricing schemes should be added via inheritance/strategy, not switch-case sprawl.',
        'Thread-safety considerations: Multiple entrance gates can attempt concurrent spot allocation.',
      ]),
      concepts: JSON.stringify([
        'Strategy Pattern (for Parking Allocation & Dynamic Fee Calculation)',
        'Factory Pattern (for Vehicle & Spot creation)',
        'Observer Pattern (for Floor display boards updating upon spot status change)',
        'Composition over Inheritance (Floor has Spots, ParkingLot has Floors)',
      ]),
    },
    {
      id: 'prob-vending-machine',
      slug: 'vending-machine',
      title: 'State-Driven Vending Machine',
      difficulty: 'MEDIUM',
      timeEstimate: '15–20 min',
      shortDescription: 'Design a robust vending machine handling state transitions, coin/note validations, inventory management, and refund transactions.',
      requirements: JSON.stringify([
        'Accept multiple denominations of cash and coins (e.g., 1, 5, 10, 20 dollars).',
        'Maintain a catalog of products (Soda, Chips, Candy) with price and inventory count.',
        'Handle state machine transitions: Idle, HasMoney, Dispensing, SoldOut.',
        'Allow user to cancel transaction and return exact deposited money before dispensing.',
        'Calculate and dispense exact change if excess money is inserted.',
        'Gracefully prevent dispensing if product is sold out or machine has insufficient change.',
      ]),
      functionalRequirements: JSON.stringify([
        'insertMoney(amount): transitions from Idle to HasMoney.',
        'selectProduct(code): checks balance and inventory.',
        'dispense(): delivers product, calculates change, transitions to Idle.',
        'cancel(): returns inserted funds, returns to Idle.',
      ]),
      expectedEntities: JSON.stringify([
        'VendingMachine',
        'VendingState',
        'IdleState',
        'HasMoneyState',
        'DispensingState',
        'SoldOutState',
        'Product',
        'Inventory',
        'CoinTray',
      ]),
      expectedBehaviours: JSON.stringify([
        'insertCoin(coin): void',
        'pressProductButton(code): void',
        'dispenseItem(): Product',
        'refund(): List<Coin>',
        'restock(product, quantity): void',
      ]),
      constraints: JSON.stringify([
        'Avoid massive nested if-else / switch condition blocks inside VendingMachine.',
        'State-specific actions must be delegated to dedicated State classes (State Pattern).',
      ]),
      concepts: JSON.stringify([
        'State Pattern (Encapsulating state-dependent behavior)',
        'Inventory Aggregate',
        'Command / Strategy for payment processing',
      ]),
    },
    {
      id: 'prob-elevator-system',
      slug: 'elevator-system',
      title: 'Elevator Dispatch & Scheduling System',
      difficulty: 'HARD',
      timeEstimate: '25–30 min',
      shortDescription: 'Architect an elevator bank dispatch controller with multiple cars, directional requests, and pluggable scheduling algorithms.',
      requirements: JSON.stringify([
        'Manage a bank of N elevator cars servicing M floors in a commercial building.',
        'Handle external hall calls (Up/Down button on a floor) and internal car calls (destination floor button inside car).',
        'Implement dynamic dispatching strategy to assign the optimal car for an external hall call (e.g., SCAN, LOOK, nearest car).',
        'Track elevator status: Direction (UP, DOWN, IDLE), CurrentFloor, DoorState (OPEN, CLOSED), WeightLoad.',
        'Handle capacity constraints and emergency stop overrides.',
      ]),
      functionalRequirements: JSON.stringify([
        'pressHallButton(floor, direction): submits dispatch request.',
        'pressInternalButton(carId, destinationFloor): queues destination in car route.',
        'stepSimulation(): moves cars, opens/closes doors, dispatches pending requests.',
      ]),
      expectedEntities: JSON.stringify([
        'ElevatorController',
        'ElevatorCar',
        'HallButton',
        'InternalPanel',
        'DispatchStrategy',
        'SCANStrategy',
        'Door',
        'Request',
      ]),
      expectedBehaviours: JSON.stringify([
        'dispatchCar(request): ElevatorCar',
        'moveNext(): void',
        'openDoor(): void',
        'closeDoor(): void',
        'addStop(floor): void',
      ]),
      constraints: JSON.stringify([
        'Pluggable scheduling algorithm via Strategy pattern.',
        'Car must decouple door mechanics and motor motion from request dispatching logic.',
      ]),
      concepts: JSON.stringify([
        'Strategy Pattern (Dispatching algorithms)',
        'Observer Pattern (Car notifying controller and display of floor changes)',
        'State Pattern (Idle, MovingUp, MovingDown, Maintenance)',
      ]),
    },
    {
      id: 'prob-splitwise',
      slug: 'splitwise',
      title: 'Expense Sharing App (Splitwise)',
      difficulty: 'MEDIUM',
      timeEstimate: '20–25 min',
      shortDescription: 'Design a scalable expense sharing service supporting unequal splits, user groups, and debt graph simplification.',
      requirements: JSON.stringify([
        'Users can register, create groups, and add friends.',
        'Add expenses with multiple participants and different split mechanisms: EQUAL, EXACT amounts, or PERCENTAGES.',
        'Ensure split shares sum exactly to 100% or total expense amount.',
        'Track user balances across groups and individual one-on-one relationships.',
        'Provide a settlement mechanism for recording payments between users.',
        'Support optional debt minimization algorithm to reduce total number of cash transfers.',
      ]),
      functionalRequirements: JSON.stringify([
        'createExpense(payer, amount, participants, splitType, splitValues): Expense',
        'getUserBalances(userId): Map<User, Balance>',
        'settleDebt(debtor, creditor, amount): Transaction',
        'simplifyDebts(groupId): List<Transaction>',
      ]),
      expectedEntities: JSON.stringify([
        'ExpenseService',
        'User',
        'Group',
        'Expense',
        'SplitStrategy',
        'EqualSplitStrategy',
        'ExactSplitStrategy',
        'PercentageSplitStrategy',
        'Split',
        'BalanceSheet',
      ]),
      expectedBehaviours: JSON.stringify([
        'validateSplit(amount, splits): boolean',
        'addExpense(expense): void',
        'calculateNetBalances(): Map<String, Double>',
        'simplifyGraph(): List<Transaction>',
      ]),
      constraints: JSON.stringify([
        'Split validation logic must be open for extension without modifying Expense class.',
        'Support high precision financial amounts (avoid floating point rounding drift).',
      ]),
      concepts: JSON.stringify([
        'Strategy Pattern (Split calculation and validation)',
        'Factory Pattern (Expense creation by split type)',
        'Composite Pattern (Individual vs Group balances)',
      ]),
    },
    {
      id: 'prob-coffee-machine',
      slug: 'coffee-machine',
      title: 'Customizable Coffee Maker (Decorator Pattern)',
      difficulty: 'EASY',
      timeEstimate: '15–20 min',
      shortDescription: 'Model a modern espresso bar coffee maker supporting base beverage choices, layered condiments, and ingredient inventory depletion.',
      requirements: JSON.stringify([
        'Support base coffee types: Espresso, Americano, Latte, Cappuccino.',
        'Allow customer to dynamically wrap beverage with multiple condiments: Milk, Sugar, Oat Milk, Vanilla Syrup, Whipped Cream.',
        'Calculate total price and nutritional info dynamically based on accumulated decorators.',
        'Deduct required ingredients (Coffee beans, Water, Milk ml) from machine inventory.',
        'Warn when ingredients are depleted and prevent brewing.',
      ]),
      functionalRequirements: JSON.stringify([
        'orderCoffee(baseType, List<Condiment>): Beverage',
        'brew(beverage): boolean',
        'checkInventory(): Map<Ingredient, Integer>',
      ]),
      expectedEntities: JSON.stringify([
        'CoffeeMachine',
        'Beverage',
        'Espresso',
        'Americano',
        'CondimentDecorator',
        'MilkDecorator',
        'SyrupDecorator',
        'Inventory',
      ]),
      expectedBehaviours: JSON.stringify([
        'getCost(): double',
        'getDescription(): String',
        'checkAndDeductIngredients(): boolean',
      ]),
      constraints: JSON.stringify([
        'Avoid class explosion (do not create EspressoWithMilkAndSugar class).',
        'Use classic Decorator Pattern for beverage composition.',
      ]),
      concepts: JSON.stringify([
        'Decorator Pattern (Dynamic beverage decoration)',
        'Factory Pattern (Creating base drinks)',
        'Single Responsibility (Inventory vs Brewing vs Billing)',
      ]),
    },
  ];

  for (const prob of problems) {
    await prisma.problem.upsert({
      where: { slug: prob.slug },
      update: prob,
      create: prob,
    });
    console.log(`Seeded problem: ${prob.title} (${prob.slug})`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
