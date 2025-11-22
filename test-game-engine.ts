// test-game-engine.ts
import dotenv from "dotenv";
import { GameEngine } from "./game/main-engine"; 
import { StartStateModel } from "./game/models/start-state-model";
import { GoalModel } from "./game/models/goal-model";
// NEW: Import the RecommendationEngine
import { RecommendationEngine } from "./game/engines/recommendation-engine";

// Load environment variables
dotenv.config({ path: '.env.local' });

// Debug Block for .env
const result = dotenv.config({ path: '.env.local' });
if (result.error) {
  console.error("❌ Error loading file:", result.error);
} else {
  console.log("✅ File found. Keys loaded:", Object.keys(result.parsed || {}));
}

async function runTestSimulation() {
    console.log("🎮 Initializing Game Engine...");
    const engine = new GameEngine();
    // NEW: Initialize Recommendation Engine
    const recommendationEngine = new RecommendationEngine();
    
    // 1. Setup: High Income Scenario
    const goalPrice = 400000; 
    
    const startState: StartStateModel = {
        age: 30,
        occupation: {
            occupationTitle: "Senior Developer",
            occupationDescription: "Coding",
            yearlySalaryInEuro: 90000, 
            stressLevelFrom0To100: 60
        },
        portfolio: {
            cashInEuro: 50000, 
            cryptoInEuro: 0,
            etfInEuro: 0
        },
        living: {
            yearlyRentInEuro: 12000,
            zip: "10115",
            sizeInSquareMeter: 60
        },
        savingsRateInPercent: 30, 
        amountOfChildren: 0,
        married: false
    };

    const goal: GoalModel = {
        buyingPrice: goalPrice,
        rooms: 3,
        squareMeter: 80,
        zip: "10115",
        numberWishedChildren: 0,
        estateType: "APPARTMENTBUY"
    };

    console.log(`🚀 Starting Game... Goal Price: €${goalPrice.toLocaleString()}`);
    engine.startGame(startState, goal);

    // 2. Run Simulation Loop
    const maxYears = 10;
    let goalReached = false;

    for (let i = 1; i <= maxYears; i++) {
        const currentState = engine.getState();
        const totalWealth = currentState.portfolio.cashInEuro + currentState.portfolio.cryptoInEuro + currentState.portfolio.etfInEuro;
        
        console.log(`\n--- YEAR ${i} (Age: ${currentState.age}) ---`);
        console.log(`   💰 Wealth: €${totalWealth.toLocaleString()} / €${goalPrice.toLocaleString()}`);

        // Credit Check Output
        if (currentState.creditWorthiness) {
            console.log(`   🏦 CREDIT STATUS: APPROVED ✅`);
        } else {
            console.log(`   🏦 CREDIT STATUS: REJECTED ❌`);
        }

        // Check for termination
        if ((currentState as any).terminated) {
            console.log("\n🎉🎉🎉 GAME OVER - GOAL REACHED (Cash Payment)! 🎉🎉🎉");
            console.log(`   You bought the house at age ${currentState.age}!`);
            goalReached = true;
            break; 
        }

        // Advance year
        engine.decideActions({
            newSavingsRateInPercent: 30, 
            newOccupationModel: undefined,
            newLivingModel: undefined,
            newPortfolioModel: undefined
        });

        // Handle events
        const generatedEvent = (engine as any).currentEventResult;
        if (generatedEvent) {
            console.log(`   ⚡ Event: ${generatedEvent.eventDescription}`);
            engine.decideEvent(true); 
        }
    }

    if (!goalReached) {
        console.log("\n❌ Simulation ended without reaching full cash payment.");
    }

    // --- NEW: GENERATE AI FEEDBACK ---
    console.log("\n🔮 Generating AI Feedback from your life choices...");
    try {
        const feedback = await recommendationEngine.generateFeedback(
            engine.getHistory(),
            engine.getEventHistory(),
            engine.getGoals()
        );
        console.log("\n--- 🤖 AI LIFE COACH REPORT ---");
        console.log(feedback);
        console.log("-------------------------------");
    } catch (e) {
        console.error("Failed to generate feedback:", e);
    }
}

runTestSimulation().catch(console.error);