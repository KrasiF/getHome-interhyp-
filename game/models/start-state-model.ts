import {LivingModel} from "./living-model";
import {OccupationModel} from "./occupation-model";
import {PortfolioModel} from "./portfolio-model";

export interface StartStateModel {
  age: number;
  occupation: OccupationModel;
  portfolio: PortfolioModel;
  living: LivingModel;
  savingsRateInPercent: number;
  amountOfChildren: number;
}
