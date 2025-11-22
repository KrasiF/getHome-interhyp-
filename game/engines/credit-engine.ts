import { StateModel } from "../models/state-model";
import { GoalModel } from "../models/goal-model";

export class CreditEngine {
    // Fixer Zinssatz für die Simulation (z.B. 3.5%)
    private readonly INTEREST_RATE = 0.035; 
    
    // Mögliche Laufzeiten, die die Bank prüft (in Jahren)
    private readonly POSSIBLE_DURATIONS = [10, 15, 20, 25, 30];

    /**
     * Prüft die Kreditwürdigkeit basierend auf dem Ziel-Hauspreis und dem aktuellen Vermögen.
     * Updated den State direkt.
     */
    public checkAndApplyCredit(state: StateModel, goal: GoalModel): StateModel {
        // 1. Wie viel Geld fehlt? (Kreditsumme)
        const totalWealth = 
            (state.portfolio.cashInEuro || 0) + 
            (state.portfolio.cryptoInEuro || 0) + 
            (state.portfolio.etfInEuro || 0);

        // Wir ziehen Vermögen vom Hauspreis ab. Wenn man mehr hat als das Haus kostet, ist Loan = 0.
        const loanAmountNeeded = Math.max(0, goal.buyingPrice - totalWealth);

        // Sonderfall: Man kann es sofort bar bezahlen
        if (loanAmountNeeded === 0) {
            state.creditWorthiness = true;
            state.loanConditions = {
                loanAmount: 0,
                durationInYears: 0,
                interestRateInPercent: 0,
                monthlyPayment: 0
            };
            return state;
        }

        // 2. Wie viel kann der User monatlich maximal zurückzahlen?
        // Annahme: Man darf max 40% des Netto-Einkommens für den Kredit nutzen.
        // (Vereinfacht: Jahresgehalt / 12 * 0.4)
        const monthlyIncome = state.occupation.yearlySalaryInEuro / 12;
        
        // Wir ziehen Lebenshaltungskosten grob ab (Konservative Bankrechnung)
        // Miete fällt weg (da man ja kauft), aber Unterhalt bleibt.
        const costPerChild = 500; // Pauschale
        const minimumLivingCost = 1000 + (state.amountOfChildren * costPerChild);
        
        const disposableIncome = monthlyIncome - minimumLivingCost;
        
        // Die Bank erlaubt maximal 40% des verfügbaren Einkommens als Rate oder das gesamte Disposable, was kleiner ist.
        const maxMonthlyRate = Math.min(disposableIncome, monthlyIncome * 0.40);

        // 3. Finde eine passende Laufzeit
        let foundCondition = null;

        if (maxMonthlyRate > 0) {
            for (const years of this.POSSIBLE_DURATIONS) {
                const monthlyPayment = this.calculateAnnuity(loanAmountNeeded, this.INTEREST_RATE, years);
                
                // Wenn die Rate bezahlbar ist, nehmen wir diesen Deal
                if (monthlyPayment <= maxMonthlyRate) {
                    foundCondition = {
                        loanAmount: loanAmountNeeded,
                        durationInYears: years,
                        interestRateInPercent: this.INTEREST_RATE * 100, // Als Prozent speichern (3.5)
                        monthlyPayment: Math.round(monthlyPayment)
                    };
                    break; // Wir nehmen die kürzeste Laufzeit, die möglich ist (oder ändere Reihenfolge für längste)
                }
            }
        }

        // 4. State updaten
        if (foundCondition) {
            state.creditWorthiness = true;
            state.loanConditions = foundCondition;
        } else {
            state.creditWorthiness = false;
            // Wir speichern trotzdem, was nötig gewesen wäre (z.B. für 30 Jahre), damit das UI was zeigen kann,
            // oder wir setzen es auf undefined.
            state.loanConditions = {
                loanAmount: loanAmountNeeded,
                durationInYears: 30,
                interestRateInPercent: this.INTEREST_RATE * 100,
                monthlyPayment: Math.round(this.calculateAnnuity(loanAmountNeeded, this.INTEREST_RATE, 30))
            };
        }

        return state;
    }

    /**
     * Berechnet die monatliche Annuität (Rate) für einen Kredit.
     * Formel: R = K * (q^n * (q-1)) / (q^n - 1)
     */
    private calculateAnnuity(principal: number, annualRate: number, years: number): number {
        if (years === 0) return 0;
        
        const monthlyRate = annualRate / 12;
        const numberOfPayments = years * 12;

        const factor = Math.pow(1 + monthlyRate, numberOfPayments);
        const annuity = principal * ((monthlyRate * factor) / (factor - 1));

        return annuity;
    }
}