import { StartStateModel } from "../models/start-state-model";
import { StateModel } from "../models/state-model";

export class CreditEngine {
  private annuityFactor(r: number, years: number): number {
    return (r * Math.pow(1 + r, years)) / (Math.pow(1 + r, years) - 1);
  }

  public maxLoanAmount(
    state: StartStateModel | StateModel,
    years: number
  ): number {
    const Y = state.occupation.yearlySalaryInEuro;
    const C = state.living.yearlyRentInEuro + 3000 * state.amountOfChildren;
    const P =
      state.portfolio.cashInEuro +
      state.portfolio.cryptoInEuro +
      state.portfolio.etfInEuro;

    const R = 0.35 * (Y - C) + 0.035 * P;

    if (R <= 0) {
      return 0;
    }

    const r = 0.03;
    const a = this.annuityFactor(r, years);

    return R / a;
  }

  public calculateAllDurations(
    state: StartStateModel | StateModel
  ): Record<number, number> {
    const durations = [5, 10, 15, 20];
    const results: Record<number, number> = {};

    for (const yrs of durations) {
      results[yrs] = this.maxLoanAmount(state, yrs);
    }

    return results;
  }
}
