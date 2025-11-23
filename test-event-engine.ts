import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { EventEngine } from "./game/engines/event-engine";
import { StateModel } from "./game/models/state-model";
import { GoalModel } from "./game/models/goal-model";
import { EventModel } from "./game/models/event-model";

// Hilfsfunktion: Beispiel-State-History aufbauen
function buildSampleStateHistory(): StateModel[] {
    const baseLiving = {
        name: "",
        yearlyRentInEuro: 18_000, // 1500 €/Monat
        zip: "80331",             // München Innenstadt
        sizeInSquareMeter: 60,
    };

    const occupationJunior = {
        occupationTitle: "Junior Software Engineer",
        occupationDescription: "Erste Festanstellung in der IT.",
        yearlySalaryInEuro: 55_000,
        stressLevelFrom0To100: 45,
    };

    const occupationMid = {
        occupationTitle: "Software Engineer",
        occupationDescription: "Mehr Verantwortung, eigenes Teilprojekt.",
        yearlySalaryInEuro: 70_000,
        stressLevelFrom0To100: 60,
    };

    const occupationSenior = {
        occupationTitle: "Senior Software Engineer",
        occupationDescription: "Verantwortung für ein kleines Team.",
        yearlySalaryInEuro: 85_000,
        stressLevelFrom0To100: 70,
    };

    const portfolioStart = {
        cashInEuro: 20_000,
        cryptoInEuro: 5_000,
        etfInEuro: 30_000,
    };

    const portfolioAfterFewYears = {
        cashInEuro: 25_000,
        cryptoInEuro: 4_000,
        etfInEuro: 45_000,
    };

    const portfolioCurrent = {
        cashInEuro: 35_000,
        cryptoInEuro: 6_000,
        etfInEuro: 60_000,
    };

    const history: StateModel[] = [
        {
            year: 2028,
            age: 30,
            educationLevel: "Bachelor",
            lifeSatisfactionFrom1To100: 68,
            occupation: occupationJunior,
            portfolio: portfolioStart,
            living: baseLiving,
            savingsRateInPercent: 0.20,
            amountOfChildren: 0,
            married: false,
            terminated: false,
            creditWorthiness: false
        },
        {
            year: 2029,
            age: 31,
            educationLevel: "Bachelor",
            lifeSatisfactionFrom1To100: 72,
            occupation: occupationMid,
            portfolio: portfolioAfterFewYears,
            living: {
                ...baseLiving,
                yearlyRentInEuro: 19_200, // leichte Mieterhöhung
            },
            savingsRateInPercent: 0.22,
            amountOfChildren: 0,
            married: false,
            terminated: false,
            creditWorthiness: false
        },
        {
            year: 2030,
            age: 32,
            educationLevel: "Master",
            lifeSatisfactionFrom1To100: 75,
            occupation: occupationSenior,
            portfolio: portfolioCurrent,
            living: {
                ...baseLiving,
                yearlyRentInEuro: 20_400,
                sizeInSquareMeter: 70, // etwas größere Wohnung
            },
            savingsRateInPercent: 0.25,
            amountOfChildren: 1,
            married: true, // inzwischen verheiratet
            terminated: false,
            creditWorthiness: false
        },
    ];

    return history;
}

// Beispiel-Goal – hier einfach gecastet, falls dein GoalModel mehr Felder hat
function buildSampleGoal(): GoalModel {
    const goal: GoalModel = {
        buyingPrice: 850000,                  // Beispiel Kaufpreis (EUR)
        zip: "82041",                         // Beispiel PLZ (z.B. Oberhaching)
        rooms: 4,                             // Wunschanzahl Zimmer
        squareMeter: 120,                     // Wunschgröße
        numberWishedChildren: 2,              // Kinderwunsch → relevant fürs Event Engine
        estateType: "house",                  // z.B. "house" | "apartment" | "duplex"
    };

    return goal;
}

// Beispiel-Event-History (ein paar frühere Events)
function buildSampleEventHistory(): EventModel[] {
    const salaryRaiseEvent: EventModel = {
        impact: {
            changeInOccupancyModel: {
                yearlySalaryInEuro: 80_000,
                stressLevelFrom0To100: 65,
            },
            newPortfolioModel: null,
            changeInLivingModel: null,
            changeInSavingsRateInPercent: 0.03,
            changeInAmountOfChildren: null,
            newEducationLevel: null,
            changeInLifeSatisfactionFrom1To100: 5,
            newMarried: null,
        },
        alternativeImpact: null,
        eventDescription: "Du hast eine Beförderung zum Senior Software Engineer mit höherem Gehalt bekommen.",
        eventQuestion: null,
    } as EventModel;

    const marketCrashEvent: EventModel = {
        impact: {
            changeInOccupancyModel: null,
            newPortfolioModel: {
                // 25 % Crash auf ETFs, 10 % auf Krypto
                cashInEuro: 30_000,
                cryptoInEuro: 3_600,
                etfInEuro: 45_000,
            },
            changeInLivingModel: null,
            changeInSavingsRateInPercent: null,
            changeInAmountOfChildren: null,
            newEducationLevel: null,
            changeInLifeSatisfactionFrom1To100: -8,
            newMarried: null,
        },
        alternativeImpact: null,
        eventDescription: "Ein Börsencrash hat einen Teil deiner ETF- und Krypto-Anlagen vernichtet.",
        eventQuestion: null,
    } as EventModel;

    const marriageEvent: EventModel = {
        impact: {
            changeInOccupancyModel: null,
            newPortfolioModel: null,
            changeInLivingModel: null,
            changeInSavingsRateInPercent: null,
            changeInAmountOfChildren: null,
            newEducationLevel: null,
            changeInLifeSatisfactionFrom1To100: 10,
            newMarried: true,
        },
        alternativeImpact: null,
        eventDescription: "Du hast geheiratet 🎉",
        eventQuestion: null,
    } as EventModel;

    return [salaryRaiseEvent, marketCrashEvent, marriageEvent];
}

async function main() {
    console.log("🏁 Starting EventEngine Test...");

    const history = buildSampleStateHistory();
    const goal = buildSampleGoal();
    const eventHistory = buildSampleEventHistory();

    const engine = new EventEngine();

    // probability = 1 → always versuchen, ein Event zu generieren
    const probability = 1.0;

    // Du kannst das auch in einer Schleife mehrmals machen, um Varianz zu sehen
    const event = await engine.randomlyGenerateEvent(probability, history, goal, eventHistory);

    if (!event) {
        console.log("❌ No event generated (probability gate or model/parsing failed).");
    } else {
        console.log("✅ Generated event:");
        console.dir(event, { depth: null });
    }
}

main().catch((err) => {
    console.error("Error while running EventEngine test:", err);
});
