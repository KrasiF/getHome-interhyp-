import { StartStateModel } from "./start-state-model";

export interface StateModel extends StartStateModel {
  year: number;
  educationLevel: string;
  lifeSatisfactionFrom1To100: number;
   terminated: boolean;
}
