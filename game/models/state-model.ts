import { StartStateModel } from "./start-state-model";
import { LoanConditions } from "./loan-condition";


export interface StateModel extends StartStateModel {
  year: number;
  educationLevel: string;
  lifeSatisfactionFrom1To100: number;
  terminated: boolean;
  creditWorthiness: boolean;      
  loanConditions?: LoanConditions; 
}
