import { StateModel } from "../models/state-model";
import { PortfolioModel } from "../models/portfolio-model";

export interface InvestmentEngineInterface {
    handleReturnOnInvestment(state: StateModel): PortfolioModel;
}

export class InvestmentEngine implements InvestmentEngineInterface {
    private readonly COST_PER_CHILD_YEARLY = 6000; // 500/month
    private readonly BASIC_FOOD_NEEDS_YEARLY = 6000; // 500€/month

    constructor() {}

    public handleReturnOnInvestment(state: StateModel): PortfolioModel {
        // Create a shallow copy of the portfolio to remain immutable regarding the input reference
        const newPortfolio: PortfolioModel = { ...state.portfolio };

        // 1. Calculate Interest & Returns (Asset Growth)
        newPortfolio.cashInEuro = Math.round(newPortfolio.cashInEuro * 1.02);

        const etfPerformance = this.getGaussianRandom(0.07, 0.15);
        newPortfolio.etfInEuro = Math.round(newPortfolio.etfInEuro * (1 + etfPerformance));

        const cryptoPerformance = this.getGaussianRandom(0.10, 0.50);
        newPortfolio.cryptoInEuro = Math.round(newPortfolio.cryptoInEuro * (1 + cryptoPerformance));


        // 2. Income, Expenses & Savings Rate (Household Budget)
        const salary = state.occupation.yearlySalaryInEuro;
        const rent = state.living.yearlyRentInEuro;
        
        const plannedSavings = salary * (state.savingsRateInPercent / 100);

        const childrenCost = state.amountOfChildren * this.COST_PER_CHILD_YEARLY;

        // Calculation: Is there enough money to survive
        const balance = salary - rent - childrenCost - plannedSavings - this.BASIC_FOOD_NEEDS_YEARLY;

        if (balance >= 0) {
            // GOOD SCENARIO: Money covers everything + food.
            // We add the full planned savings to the cash account.
            // (The remaining 'balance' is assumed to be spent on consumption/lifestyle)
            newPortfolio.cashInEuro += Math.round(plannedSavings);
        } else {
            // BAD SCENARIO 
            // Money does not cover planned savings or potentially even food.
            // We must take the reserves 
            
            const actualChange = plannedSavings + balance;
           
            newPortfolio.cashInEuro += Math.round(actualChange);
        }

        return newPortfolio;
    }


    private getGaussianRandom(mean: number, stdDev: number): number {
        const u = 1 - Math.random();
        const v = Math.random();
        
        const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        
        return z * stdDev + mean;
    }
}