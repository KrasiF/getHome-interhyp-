import { PortfolioModel } from "../models/portfolio-model";
import { StateModel } from "../models/state-model";

export interface CapitalEngineInterface {
    handlePortfolioChange(state: StateModel, portfolioInput: PortfolioInput): PortfolioModel;
    handleSavingRateChange(state: StateModel, new_rate: number): number;
}

export interface PortfolioInput {
  // Portfolio input properties
}

export class CapitalEngine implements CapitalEngineInterface {
    constructor() {}

    public handlePortfolioChange(state: StateModel, portfolioInput: PortfolioInput): PortfolioModel {
        // Handle portfolio change based on state and input
        throw Error("Not impl.");
    }

    public handleSavingRateChange(state: StateModel, new_rate: number): number {
        // Handle saving rate change
        return new_rate;
    }
}
