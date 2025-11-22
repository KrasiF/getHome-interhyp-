import { PortfolioModel } from "../models/portfolio-model";

export interface InvestmentEngineInterface {
    handleReturnOnInvestment(portfolio: PortfolioModel): PortfolioModel;
}

export class InvestmentEngine implements InvestmentEngineInterface {
    constructor() {}

    public handleReturnOnInvestment(portfolio: PortfolioModel): PortfolioModel {
        // Calculate and apply return on investment
        return portfolio;
    }
}
