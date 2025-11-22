import type { OccupationModel } from "./occupation-model";
import type { PortfolioModel } from "./portfolio-model";
import type { LivingModel } from "./living-model";

export interface StateModel {
    year: number;
    age: number;

    occupation: OccupationModel;
    portfolio: PortfolioModel;
    living: LivingModel;

    savingsRateInPercent: number;
    amountOfChildren: number;
    educationLevel: string;
    lifeSatisfactionFrom1To100: number;
    married: boolean;
}