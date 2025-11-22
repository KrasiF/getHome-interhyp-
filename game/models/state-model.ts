import { StartStateModel } from "./start-state-model";
import { LoanConditions } from "./loan-condition";


export interface StateModel extends StartStateModel {
  year: number;
  educationLevel: string;
  lifeSatisfactionFrom1To100: number;
  terminated: boolean;
  creditWorthiness: boolean;       // Bekommt man den Kredit?
  loanConditions?: LoanConditions; // Wenn ja, zu welchen Konditionen?
}
