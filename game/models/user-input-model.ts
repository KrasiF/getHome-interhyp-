// every value which the user did not change is supposed to be null/undefined
// give the new values --- no increments --- overwrite directelly with this 

import { LivingModel } from "./living-model";
import { OccupationModel } from "./occupation-model";
import { PortfolioModel } from "./portfolio-model";

export interface UserInputModel {
    // create a new occupation object with the salary suggested by the llm interface
    newOccupationModel: OccupationModel | null;

    newPortfolioModel: Partial<PortfolioModel> | null;

    // create a new living object with the rent suggested by the llm interface
    newLivingModel: LivingModel | null;

    newSavingsRateInPercent: number | null;
}