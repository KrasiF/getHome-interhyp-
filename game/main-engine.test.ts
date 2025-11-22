import { GameEngine } from "./main-engine";
import { EventEngine } from "./engines/event-engine";
import { JobEngine } from "./engines/job-engine";
import { SatisfactionEngine } from "./engines/satisfaction-engine";
import { InvestmentEngine } from "./engines/investment-engine";
import { HomeEngine } from "./engines/home-engine";
import { StateModel } from "./models/state-model";
import { StartStateModel } from "./models/start-state-model";
import { EventModel } from "./models/event-model";
import { OccupationModel } from "./models/occupation-model";
import { LivingModel } from "./models/living-model";
import { PortfolioModel } from "./models/portfolio-model";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Helper to create mock engines
function createMockEventEngine(): Partial<EventEngine> {
  return {
    randomlyGenerateEvent: async (probability, history, goals, eventHistory) => {
      return {
        impact: {
          changeInOccupancyModel: null,
          newPortfolioModel: null,
          changeInLivingModel: null,
          changeInSavingsRateInPercent: 10,
          changeInAmountOfChildren: 1,
          newEducationLevel: null,
          changeInLifeSatisfactionFrom1To100: 5,
          newMarried: true,
        },
        alternativeImpact: {
          changeInOccupancyModel: null,
          newPortfolioModel: null,
          changeInLivingModel: null,
          changeInSavingsRateInPercent: null,
          changeInAmountOfChildren: null,
          newEducationLevel: null,
          changeInLifeSatisfactionFrom1To100: -2,
          newMarried: null,
        },
        eventDescription: "Test event",
        eventQuestion: "Accept the event?",
      } as EventModel;
    },
  };
}

function createMockJobEngine(): Partial<JobEngine> {
  return {
    handleNewJobWish: async (description) => ({
      occupationTitle: "Software Engineer",
      occupationDescription: description,
      yearlySalaryInEuro: 80000,
      stressLevelFrom0To100: 60,
    } as OccupationModel),
  };
}

function createMockSatisfactionEngine(): Partial<SatisfactionEngine> {
  return {
    handleSatisfaction: (state) => 75,
  };
}

function createMockInvestmentEngine(): Partial<InvestmentEngine> {
  return {
    handleReturnOnInvestment: (portfolio) => ({
      ...portfolio,
      cashInEuro: portfolio.cashInEuro * 1.05,
    }),
  };
}

function createMockHomeEngine(): Partial<HomeEngine> {
  return {
    handleNewHomeWish: async (description) => [
      {
        yearlyRentInEuro: 14400,
        zip: "80331",
        sizeInSquareMeter: 80,
      } as LivingModel,
    ],
  };
}

// Test suite
async function runTests() {
  console.log("🧪 Running GameEngine Tests\n");

  // Test 1: Starting a game
  console.log("Test 1: Start Game");
  const mockStartState: StartStateModel = {
    age: 25,
    occupation: {
      occupationTitle: "Junior Developer",
      occupationDescription: "Entry level developer",
      yearlySalaryInEuro: 50000,
      stressLevelFrom0To100: 50,
    },
    portfolio: {
      cashInEuro: 10000,
      cryptoInEuro: 1000,
      etfInEuro: 5000,
    },
    living: {
      yearlyRentInEuro: 9600,
      zip: "10115",
      sizeInSquareMeter: 50,
    },
    savingsRateInPercent: 20,
    amountOfChildren: 0,
    married: false,
  };

  const engine = new GameEngine();
  const state = engine.startGame(mockStartState);
  
  console.log("✓ Game started successfully");
  console.log(`  Age: ${state.age}, Year: ${state.year}`);
  console.log(`  History length: ${engine.getHistory().length}\n`);

  // Test 2: Running the game loop with mocked event
  console.log("Test 2: Run Loop with Event");
  const mockEventEngine = createMockEventEngine();
  const engine2 = new GameEngine(
    mockEventEngine as EventEngine,
    undefined,
    undefined,
    undefined,
    undefined
  );
  engine2.startGame(mockStartState);
  
  const event = await engine2.runLoop();
  console.log("✓ Event generated");
  console.log(`  Event description: ${event.eventDescription || "N/A"}\n`);

  // Test 3: Deciding on an event (accept)
  console.log("Test 3: Decide Event (Accept)");
  const engine3 = new GameEngine(mockEventEngine as EventEngine);
  engine3.startGame(mockStartState);
  await engine3.runLoop();
  
  const stateBefore = engine3.getState();
  const marriedBefore = stateBefore.married;
  const satisfactionBefore = stateBefore.lifeSatisfactionFrom1To100;
  
  const stateAfter = engine3.decideEvent(true);
  
  console.log("✓ Event accepted and applied");
  console.log(`  Married: ${marriedBefore} → ${stateAfter.married}`);
  console.log(`  Satisfaction: ${satisfactionBefore} → ${stateAfter.lifeSatisfactionFrom1To100}`);
  console.log(`  Event history length: ${engine3.getEventHistory().length}\n`);

  // Test 4: Deciding on an event (reject)
  console.log("Test 4: Decide Event (Reject)");
  const engine4 = new GameEngine(mockEventEngine as EventEngine);
  engine4.startGame(mockStartState);
  await engine4.runLoop();
  
  const stateBefore4 = engine4.getState();
  const satisfactionBefore4 = stateBefore4.lifeSatisfactionFrom1To100;
  
  const stateAfter4 = engine4.decideEvent(false);
  
  console.log("✓ Event rejected and alternative impact applied");
  console.log(`  Satisfaction change: ${satisfactionBefore4} → ${stateAfter4.lifeSatisfactionFrom1To100}\n`);

  // Test 5: User actions
  console.log("Test 5: Decide Actions");
  const mockSatisfactionEngine = createMockSatisfactionEngine();
  const mockInvestmentEngine = createMockInvestmentEngine();
  
  const engine5 = new GameEngine(
    undefined,
    undefined,
    mockSatisfactionEngine as SatisfactionEngine,
    mockInvestmentEngine as InvestmentEngine,
    undefined
  );
  
  const initialState = engine5.startGame(mockStartState);
  const yearBefore = initialState.year;
  const ageBefore = initialState.age;
  
  const newState = engine5.decideActions({
    newOccupationModel: null,
    newLivingModel: null,
    newPortfolioModel: null,
    newSavingsRateInPercent: 25,
  });
  
  console.log("✓ User actions processed");
  console.log(`  Year: ${yearBefore} → ${newState.year}`);
  console.log(`  Age: ${ageBefore} → ${newState.age}`);
  console.log(`  Savings rate: 20% → ${newState.savingsRateInPercent}%`);
  console.log(`  Satisfaction: ${mockSatisfactionEngine.handleSatisfaction!(initialState)}\n`);

  // Test 6: Request new occupation
  console.log("Test 6: Request New Occupation");
  const mockJobEngine = createMockJobEngine();
  const engine6 = new GameEngine(undefined, mockJobEngine as JobEngine);
  
  const newOccupation = await engine6.requestNewOccupation("I want to be a data scientist");
  console.log("✓ New occupation requested");
  console.log(`  Title: ${newOccupation.occupationTitle}`);
  console.log(`  Salary: €${newOccupation.yearlySalaryInEuro}\n`);

  // Test 7: Request new homes
  console.log("Test 7: Request New Homes");
  const mockHomeEngine = createMockHomeEngine();
  const engine7 = new GameEngine(undefined, undefined, undefined, undefined, mockHomeEngine as HomeEngine);
  
  const homes = await engine7.requestNewHomes("I want a house in Munich");
  console.log("✓ New homes requested");
  console.log(`  Options: ${homes.length}`);
  console.log(`  First option: ZIP ${homes[0]?.zip}, €${homes[0]?.yearlyRentInEuro}/year, ${homes[0]?.sizeInSquareMeter}m²\n`);

  // Test 8: Reset game
  console.log("Test 8: Reset Game");
  const engine8 = new GameEngine();
  engine8.startGame(mockStartState);
  engine8.reset();
  
  console.log("✓ Game reset");
  console.log(`  History cleared: ${engine8.getHistory().length === 0}`);
  console.log(`  Events cleared: ${engine8.getEventHistory().length === 0}\n`);

  console.log("✅ All tests completed successfully!");
}

// Run tests
runTests().catch(console.error);
