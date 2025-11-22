// test-game-engine.ts
import dotenv from "dotenv";
import { GameEngine } from "./game/main-engine"; 
import { StartStateModel } from "./game/models/start-state-model";
import { GoalModel } from "./game/models/goal-model";

// Load environment variables (for API keys if engines use them)
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
    
    // 1. Setup: High Income Scenario
    const goalPrice = 4000000; // Increased goal to make credit relevant
    
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

        // --- NEW: CREDIT CHECK OUTPUT ---
        if (currentState.creditWorthiness) {
            console.log(`   🏦 CREDIT STATUS: APPROVED ✅`);
            if (currentState.loanConditions) {
                console.log(`      -> Loan Amount: €${currentState.loanConditions.loanAmount.toLocaleString()}`);
                console.log(`      -> Duration: ${currentState.loanConditions.durationInYears} Years`);
                console.log(`      -> Rate: ${currentState.loanConditions.interestRateInPercent}%`);
                console.log(`      -> Monthly Payment: €${currentState.loanConditions.monthlyPayment}`);
            }
        } else {
            console.log(`   🏦 CREDIT STATUS: REJECTED ❌ (Income too low or gap too big)`);
            if (currentState.loanConditions) {
                 console.log(`      -> Gap to cover: €${currentState.loanConditions.loanAmount.toLocaleString()}`);
            }
        }
        // --------------------------------

        // --- CHECK FOR TERMINATION (Goal Reached) ---
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

        // Handle random events automatically
        const generatedEvent = (engine as any).currentEventResult;
        if (generatedEvent) {
            console.log(`   ⚡ Event: ${generatedEvent.eventDescription}`);
            engine.decideEvent(true); 
        }
    }

    if (!goalReached) {
        console.log("\n❌ Simulation ended without reaching full cash payment.");
    }
}

runTestSimulation().catch(console.error);