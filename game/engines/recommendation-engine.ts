//eventuell auch noch das wunsch ding so als ziel eingeben
//von lenni alles was als spaßgeld weggeht pro jahr als so zusatz history
//zinssätze von lenni mit rein
//zusammenfassung von jedem jahr erstellen lassen mit den finalen berechungen 

import { StateModel } from "../models/state-model";
import { EventModel } from "../models/event-model";
import { GoalModel } from "../models/goal-model";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface RecommendationEngineInterface {
    generateFeedback(history: StateModel[], eventHistory: EventModel[], goal: GoalModel): Promise<string>;
}

export class RecommendationEngine implements RecommendationEngineInterface {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API Key is missing! Please provide it in .env.local");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    public async generateFeedback(
        history: StateModel[],
        eventHistory: EventModel[],
        goal: GoalModel
    ): Promise<string> {
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

        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
You are a friendly but honest financial and life coach for a simulation game
in which a player plans their life and long-term financial situation.

Task:
- You will receive:
  1. A chronological state history (yearly snapshots).
  2. A list of random events (with descriptions and possible questions to the player).
  3. A housing goal (target property).
- Produce **5–8 sentences of feedback in English** as **markdown paragraphs** (no lists, no headings).

Important:
- Summarize how the player lived:
  - job/education,
  - living situation,
  - savings behavior,
  - family (children, marriage),
  - life satisfaction.
- Evaluate:
  - whether they saved enough overall,
  - portfolio risk distribution (**cash < ETF < crypto** = increasing risk),
  - whether the life satisfaction aligns with their financial and life decisions.
- Calculate mentally:
  - finalPortfolioValue = cash + ETF + crypto in the last state,
  - gapToGoal = goal.buyingPrice – finalPortfolioValue.
- Explicitly mention whether the goal was reached or how much money is missing or exceeding.
- Use the event descriptions and questions to understand key turning points (e.g. crises, family decisions, job changes).
- Give actionable suggestions for improvement, e.g.:
  - save earlier or more consistently,
  - reduce crypto exposure if it is too high,
  - invest more steadily in ETFs,
  - increase life satisfaction through different choices (less stress, different job, housing changes, etc.),
  - make better long-term decisions aligned with the real-estate goal.
- Praise only briefly (1–2 sentences max), focus mainly on constructive insights.

Format:
- Respond **only** with a normal markdown text consisting of 5–8 sentences.
- No lists, no headings, no meta explanations.
            `.trim()
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
        `.trim();

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            return text.trim();
        } catch (error) {
            console.error("Error generating final feedback:", error);
            return "An error occurred while generating your life evaluation. Please try again later.";
        }
    }
}
