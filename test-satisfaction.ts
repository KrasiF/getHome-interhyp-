// test-satisfaction.ts
import { SatisfactionEngine } from "./game/engines/satisfaction-engine";
import { StateModel } from "./game/models/state-model"; 

// Helper to create a dummy state quickly
function createMockState(
    salary: number, 
    rent: number, 
    stress: number,
    wealth: number,
    married: boolean,
    kids: number,
    sqm: number
): StateModel {
    return {
        age: 30,
        occupation: {
            occupationTitle: "Test Job",
            occupationDescription: "Test",
            yearlySalaryInEuro: salary,
            stressLevelFrom0To100: stress
        },
        portfolio: {
            cashInEuro: wealth,
            cryptoInEuro: 0,
            etfInEuro: 0
        },
        living: {
            yearlyRentInEuro: rent,
            zip: "12345",
            sizeInSquareMeter: sqm
        },
        savingsRateInPercent: 10,
        amountOfChildren: kids,
        educationLevel: "Master",
        lifeSatisfactionFrom1To100: 50, // This will be updated
        married: married,
        year: 2025
    };
}

function main() {
    console.log("😊 Starting SatisfactionEngine Test...\n");
    const engine = new SatisfactionEngine();

    // --- SCENARIO 1: The Average Joe ---
    // 50k Income, Moderate Rent, Some Stress, Single, No Kids
    const joe = createMockState(50000, 12000, 40, 10000, false, 0, 50);
    const scoreJoe = engine.handleSatisfaction(joe, []);
    console.log(`Average Joe Score: ${scoreJoe}/100 (Expected: ~50-60)`);


    // --- SCENARIO 2: The High Performer (Burnout Risk) ---
    // 150k Income, High Wealth, BUT Extreme Stress (90) and High Rent
    const richStressed = createMockState(150000, 40000, 90, 200000, false, 0, 80);
    const scoreRich = engine.handleSatisfaction(richStressed, []);
    console.log(`Rich & Stressed Score: ${scoreRich}/100 (Money helps, but stress kills)`);


    // --- SCENARIO 3: The Struggling Student ---
    // Low Income, Rent Burden, Tiny Apartment, Stress
    const poor = createMockState(12000, 8000, 60, 500, false, 0, 15);
    const scorePoor = engine.handleSatisfaction(poor, []);
    console.log(`Struggling Student Score: ${scorePoor}/100 (Expected: Low < 30)`);


    // --- SCENARIO 4: Family Bliss ---
    // Good Income, Married, 2 Kids, Big House, Low Stress
    const family = createMockState(80000, 15000, 20, 50000, true, 2, 120);
    const scoreFamily = engine.handleSatisfaction(family, []);
    console.log(`Happy Family Score: ${scoreFamily}/100 (Expected: Very High > 80)`);
}

main();