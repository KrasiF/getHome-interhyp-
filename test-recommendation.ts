// run command: pnpm ts-node   --compiler-options '{"module":"commonjs","moduleResolution":"node"}'   --transpile-only   test-recommendation.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { RecommendationEngine } from "./game/engines/recommendation-engine";
import type { StateModel } from "./game/models/state-model";
import type { GoalModel } from "./game/models/goal-model";
import type { EventModel } from "./game/models/event-model";

console.log("🏁 Starting RecommendationEngine Test...\n");

async function main() {
    const engine = new RecommendationEngine();

    console.log("🧪 Building mock 10-year simulation...");
    const history = buildTenYearHistory();
    const events = buildEvents();
    const goal = buildGoal();

    console.log("➡️ Calling AI model...\n");

    const feedback = await engine.generateFeedback(history, events, goal);

    console.log("===== AI FEEDBACK START =====\n");
    console.log(feedback);
    console.log("\n===== AI FEEDBACK END =====\n");

    console.log("📌 Manual checklist:");
    console.log("- Mentions the housing goal or missing money?");
    console.log("- Mentions life satisfaction?");
    console.log("- Mentions risk / portfolio (cash, ETFs, crypto)?");
    console.log("- Mentions savings behavior?");
    console.log("- Mentions at least one event?");
    console.log("- Gives concrete advice for improvement?");
}

// ------------------------------
// Mock builders for the test
// ------------------------------
function buildTenYearHistory(): StateModel[] {
    const history: StateModel[] = [];

    let age = 28;
    let year = 1;

    let cash = 5000;
    let etf = 0;
    let crypto = 0;

    for (let i = 0; i < 10; i++) {
        const salary = 42000 + i * 3000;
        const rent = 9000 + i * 300;
        const savingsRate = i < 3 ? 15 : i < 7 ? 20 : 22;
        const yearlySavings = (salary * savingsRate) / 100;
        const lifeSatisfaction = 60 + (i % 3) * 5; // 60, 65, 70

        // Simulate simple portfolio growth
        if (i < 3) {
            cash += yearlySavings * 0.8;
            etf += yearlySavings * 0.2;
        } else if (i < 7) {
            cash += yearlySavings * 0.3;
            etf += yearlySavings * 0.6;
            crypto += yearlySavings * 0.1;
        } else {
            cash += yearlySavings * 0.2;
            etf += yearlySavings * 0.5;
            crypto += yearlySavings * 0.3;
        }

        const state: StateModel = {
            year,
            age,
            occupation: {
                occupationTitle: i < 4 ? "Junior Developer" : i < 8 ? "Mid-level Developer" : "Senior Developer",
                occupationDescription: "Software developer role.",
                yearlySalaryInEuro: salary,
                stressLevelFrom0To100: i < 4 ? 55 : i < 8 ? 65 : 75
            },
            living: {
                yearlyRentInEuro: rent,
                zip: "80331",
                sizeInSquareMeter: i < 5 ? 45 : 60
            },
            portfolio: {
                cashInEuro: Math.round(cash),
                etfInEuro: Math.round(etf),
                cryptoInEuro: Math.round(crypto)
            },
            savingsRateInPercent: savingsRate,
            amountOfChildren: i < 5 ? 0 : i < 8 ? 1 : 2,
            married: i >= 5,
            educationLevel: i < 2 ? "Bachelor ongoing" : "Bachelor finished",
            lifeSatisfactionFrom1To100: lifeSatisfaction
        };

        history.push(state);
        age++;
        year++;
    }

    return history;
}

function buildEvents(): EventModel[] {
    return [
        {
            eventDescription: "A stock market crash reduces ETF and crypto values sharply.",
            eventQuestion: null,
            impact: {
                changeInOccupancyModel: null,
                newPortfolioModel: {
                    etfInEuro: 10000, // overwrite ETFs after crash
                    cryptoInEuro: 2000
                },
                changeInLivingModel: null,
                changeInSavingsRateInPercent: -2,
                changeInAmountOfChildren: null,
                newEducationLevel: null,
                changeInLifeSatisfactionFrom1To100: -10,
                newMarried: null
            },
            alternativeImpact: null
        },
        {
            eventDescription: "A promotion opportunity appears with higher stress but raises salary.",
            eventQuestion: "Do you want to accept the promotion?",
            impact: {
                changeInOccupancyModel: {
                    occupationTitle: "Senior Developer",
                    yearlySalaryInEuro: 8000, // relative increase
                    stressLevelFrom0To100: 15
                },
                newPortfolioModel: null,
                changeInLivingModel: null,
                changeInSavingsRateInPercent: 2,
                changeInAmountOfChildren: null,
                newEducationLevel: null,
                changeInLifeSatisfactionFrom1To100: -3,
                newMarried: null
            },
            alternativeImpact: {
                changeInOccupancyModel: {
                    occupationTitle: "Mid-level Developer"
                },
                newPortfolioModel: null,
                changeInLivingModel: null,
                changeInSavingsRateInPercent: 0,
                changeInAmountOfChildren: null,
                newEducationLevel: null,
                changeInLifeSatisfactionFrom1To100: 2,
                newMarried: null
            }
        },
        {
            eventDescription: "Your partner suggests having a child sooner than planned.",
            eventQuestion: "Do you want to have a child now?",
            impact: {
                changeInOccupancyModel: null,
                newPortfolioModel: null,
                changeInLivingModel: null,
                changeInSavingsRateInPercent: -4,
                changeInAmountOfChildren: 1,
                newEducationLevel: null,
                changeInLifeSatisfactionFrom1To100: 5,
                newMarried: null
            },
            alternativeImpact: {
                changeInOccupancyModel: null,
                newPortfolioModel: null,
                changeInLivingModel: null,
                changeInSavingsRateInPercent: 1,
                changeInAmountOfChildren: 0,
                newEducationLevel: null,
                changeInLifeSatisfactionFrom1To100: -2,
                newMarried: null
            }
        }
    ];
}

function buildGoal(): GoalModel {
    return {
        buyingPrice: 400000,
        zip: "80992",
        rooms: 3,
        squareMeter: 80,
        numberWishedChildren: 2,
        estateType: "Apartment"
    };
}

main().catch((err) => {
    console.error("Error while running RecommendationEngine test:", err);
});