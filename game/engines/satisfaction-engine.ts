import { StateModel } from "../models/state-model";

export interface SatisfactionEngineInterface {
    handleSatisfaction(state: StateModel): number;
}

export class SatisfactionEngine implements SatisfactionEngineInterface {
    constructor() {}

    public handleSatisfaction(state: StateModel): number {
        // Calculate satisfaction based on state
        // ---------------------------------------------------------
   
        let rawScore = 0;

        // Financials
        const totalWealth = state.portfolio.cashInEuro + state.portfolio.cryptoInEuro + state.portfolio.etfInEuro;
        const salary = state.occupation.yearlySalaryInEuro;
        const rent = state.living.yearlyRentInEuro;

        rawScore += Math.min(40, totalWealth / 5000);


        // Rent Burden (High rent kills the vibe)
        if (salary > 0) {
            const rentRatio = rent / salary;
            if (rentRatio > 0.35) {
                rawScore -= (rentRatio * 100); 
            }
        }

       
        // Having a high stress lecvel is bad af
        const stress = state.occupation.stressLevelFrom0To100;
        rawScore -= (stress * 1.5); 

        // Living Quality: Space is luxury
        const peopleInHousehold = 1 + state.amountOfChildren + (state.married ? 1 : 0);
        const qmPerPerson = state.living.sizeInSquareMeter / Math.max(1, peopleInHousehold);
        rawScore += (qmPerPerson - 35);


        // Mostly true 
        if (state.married) {
            rawScore += 25; 
        }
        
        rawScore += (state.amountOfChildren * 15);

        // Education 
        if (state.educationLevel.length > 5) {
            rawScore += 10;
        }

       
        // Tanh Mapping
        const SENSITIVITY = 150;
        const curveValue = Math.tanh(rawScore / SENSITIVITY);
        
        // map to [0, 100]
        const finalHappiness = 50 + (50 * curveValue);

        return Math.round(finalHappiness);
    }
}