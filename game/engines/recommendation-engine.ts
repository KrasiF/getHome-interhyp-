//eventuell auch noch das wunsch ding so als ziel eingeben
//von lenni alles was als spaßgeld weggeht pro jahr als so zusatz history
//zinssätze von lenni mit rein
//zusammenfassung von jedem jahr erstellen lassen mit den finalen berechungen 

import { StateModel } from "../models/state-model";
import { EventModel } from "../models/event-model";
import { GoalModel } from "../models/goal-model";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface RecommendationEngineInterface {
    generateFeedback(history: StateModel[], eventHistory: EventModel[], goal: GoalModel): Promise<string[]>;
}

export class RecommendationEngine implements RecommendationEngineInterface {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        
        if (!apiKey) {
            console.warn("Warning: API Key missing.");
            this.genAI = null as any; // Fake it till you make it
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    private buildSavingsProfile(history: StateModel[], eventHistory: EventModel[]) {
        const savingsRates = history.map((state) => state.savingsRateInPercent ?? 0);
        const currentSavingsRate = savingsRates[savingsRates.length - 1] ?? 0;
        const averageSavingsRate =
            savingsRates.reduce((sum, rate) => sum + rate, 0) / Math.max(1, savingsRates.length);
        const highestSavingsRate = Math.max(...savingsRates);
        const lowestSavingsRate = Math.min(...savingsRates);

        const savingsMovesFromEvents = eventHistory
            .map((event) => {
                const impact = event.chosenImpact ?? event.impact ?? event.alternativeImpact;
                const delta = impact?.changeInSavingsRateInPercent;
                if (delta === null || delta === undefined || delta === 0) return null;
                return {
                    delta,
                    description: event.eventDescription
                };
            })
            .filter(Boolean) as { delta: number; description: string }[];

        const totalEventDrivenDelta = savingsMovesFromEvents.reduce(
            (sum, entry) => sum + entry.delta,
            0
        );

        let savingsStyle = "neutral spender";
        if (averageSavingsRate >= 25 || currentSavingsRate >= 25) {
            savingsStyle = "aggressive saver";
        } else if (averageSavingsRate >= 15) {
            savingsStyle = "steady saver";
        } else if (averageSavingsRate <= 5) {
            savingsStyle = "carefree spender";
        }

        if (totalEventDrivenDelta > 4) {
            savingsStyle += ", tightened savings after events";
        } else if (totalEventDrivenDelta < -4) {
            savingsStyle += ", loosened savings after events";
        }

        const eventNotes =
            savingsMovesFromEvents.length > 0
                ? savingsMovesFromEvents
                      .slice(0, 6)
                      .map(
                          (entry) =>
                              `${entry.delta > 0 ? "+" : ""}${entry.delta}% after "${entry.description}"`
                      )
                      .join("; ")
                : "No event-driven savings changes recorded.";

        return {
            currentSavingsRate,
            averageSavingsRate: Number(averageSavingsRate.toFixed(1)),
            highestSavingsRate,
            lowestSavingsRate,
            totalEventDrivenDelta,
            savingsStyle,
            eventNotes
        };
    }

    public async generateFeedback(
        history: StateModel[],
        eventHistory: EventModel[],
        goal: GoalModel
    ): Promise<string[]> {
        if (!this.genAI) {
            return ["AI key missing – cannot generate recommendations right now."];
        }
        if (!history || history.length === 0) {
            throw new Error("History must not be empty.");
        }

        const lastState = history[history.length - 1];

        const finalPortfolioValue =
            lastState.portfolio.cashInEuro +
            lastState.portfolio.etfInEuro +
            lastState.portfolio.cryptoInEuro;

        const gapToGoal = goal.buyingPrice - finalPortfolioValue;

        const historySummary = history
            .map((state) => {
                const totalPortfolio =
                    state.portfolio.cashInEuro +
                    state.portfolio.etfInEuro +
                    state.portfolio.cryptoInEuro;

                return [
                    `Year ${state.year}:`,
                    `age ${state.age}`,
                    `job "${state.occupation.occupationTitle}" (salary: ${state.occupation.yearlySalaryInEuro}€)`,
                    `rent: ${state.living.yearlyRentInEuro}€/year in ${state.living.zip} for ${state.living.sizeInSquareMeter}m²`,
                    `children: ${state.amountOfChildren}`,
                    `married: ${state.married}`,
                    `savings rate: ${state.savingsRateInPercent}%`,
                    `life satisfaction: ${state.lifeSatisfactionFrom1To100}/100`,
                    `portfolio total: ${totalPortfolio}€ (cash ${state.portfolio.cashInEuro}€, ETF ${state.portfolio.etfInEuro}€, crypto ${state.portfolio.cryptoInEuro}€)`
                ].join(", ");
            })
            .join("\n");

        const eventsSummary =
            eventHistory && eventHistory.length > 0
                ? eventHistory
                      .map((event, index) => {
                          const interactive = event.alternativeImpact !== null;
                          const decisionType = interactive ? "interactive" : "non-interactive";
                          const questionText = event.eventQuestion
                              ? ` Question asked to the player: "${event.eventQuestion}".`
                              : "";
                          return `Event ${index + 1} (${decisionType}): ${event.eventDescription}.${questionText}`;
                      })
                      .join("\n")
                : "No random events occurred.";

        const savingsProfile = this.buildSavingsProfile(history, eventHistory);

        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
You are a concise, upbeat financial & life coach for a simulation game.

Goal:
- Return 5–8 SHORT bullet-style takeaways for a Spotify-Wrapped-like story flow.
- Focus on brevity (ideally < 120 characters per bullet). English language.
- Answer format MUST be raw JSON array of strings (no prose around it).

What to cover across the bullets:
- Whether the housing goal was reached; if not, how much money is missing/excess.
- How the player lived: job/education, living situation, family (children/marriage), life satisfaction.
- Savings behavior and frugality using the provided savings profile and event-driven changes.
- Portfolio risk mix (cash vs ETF vs crypto) and whether it fits the goal.
- 1–2 concrete improvement nudges (save more, rebalance, housing choice, stress/life balance).

Style:
- Energetic but to the point. Think “story cards”, not a paragraph.
- Avoid filler, no markdown formatting, no numbering in the strings.
            `.trim(),
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
### Goal (Real Estate)
- buying price: ${goal.buyingPrice}€
- ZIP: ${goal.zip}
- rooms: ${goal.rooms}
- size: ${goal.squareMeter}m²
- desired children: ${goal.numberWishedChildren}
- estate type: ${goal.estateType}

### Last State
- age: ${lastState.age}
- children: ${lastState.amountOfChildren}
- married: ${lastState.married}
- final portfolio: ${finalPortfolioValue}€ (cash ${lastState.portfolio.cashInEuro}€, ETF ${lastState.portfolio.etfInEuro}€, crypto ${lastState.portfolio.cryptoInEuro}€)
- life satisfaction: ${lastState.lifeSatisfactionFrom1To100}/100
- gap to goal (goal - final portfolio): ${gapToGoal}€

### Full History (chronological)
${historySummary}

### Event History
${eventsSummary}

### Savings Profile (derived)
- average savings rate: ${savingsProfile.averageSavingsRate}%
- current savings rate: ${savingsProfile.currentSavingsRate}%
- highest / lowest savings rate: ${savingsProfile.highestSavingsRate}% / ${savingsProfile.lowestSavingsRate}%
- event-driven savings moves: ${savingsProfile.eventNotes}
- style guess: ${savingsProfile.savingsStyle}
        `.trim();

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text().trim();

            if (text.startsWith("```")) {
                text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
            }

            const parsed = JSON.parse(text);

            if (!Array.isArray(parsed)) {
                throw new Error("Recommendation model did not return an array.");
            }

            return parsed.map((entry) => String(entry).trim()).filter((entry) => entry.length > 0);
        } catch (error) {
            console.error("Error generating final feedback:", error);
            return ["An error occurred while generating your life evaluation. Please try again later."];
        }
    }
}
