
// every value which is not supposted to be impacted by the event should be set null
// number values: give the change relative to the old value
    // exception: portfolio -> here overwrite the value like in string
// string values: give the new value with which the existing one is overwritten

import { LivingModel } from "./living-model";
import { OccupationModel } from "./occupation-model";
import { PortfolioModel } from "./portfolio-model";

export interface EventImpactModel {
    changeInOccupancyModel: Partial<OccupationModel> | null;

    newPortfolioModel: Partial<PortfolioModel> | null;

    changeInLivingModel: Partial<LivingModel> | null;

    changeInSavingsRateInPercent: number | null;
    changeInAmountOfChildren: number | null;
    newEducationLevel: string | null;
    changeInLifeSatisfactionFrom1To100: number | null;
    newMarried: boolean | null;
}