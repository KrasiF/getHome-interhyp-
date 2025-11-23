import { GoogleGenerativeAI } from "@google/generative-ai";

import type { EventModel } from "../models/event-model";
import type { EventImpactModel } from "../models/event-impact-model";
import type { GoalModel } from "../models/goal-model";
import type { StateModel } from "../models/state-model";

export interface EventEngineInterface {
    randomlyGenerateEvent(probability: number, history: StateModel[], goal: GoalModel, eventHistory: EventModel[]): Promise<EventModel | undefined>;
}

//TODO: Einfluss bei Finaznzeug

export class EventEngine implements EventEngineInterface {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            console.warn("Warning: API Key missing in EventEngine.");
            this.genAI = null as any;
            return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
}

    public async randomlyGenerateEvent(
        probability: number,
        history: StateModel[],
        goal: GoalModel,
        eventHistory: EventModel[]
    ): Promise<EventModel | undefined> {
        if (Math.random() > probability) {
            return undefined;
        }

        if (!history || history.length === 0) {
            return undefined;
        }

        const startingState = history[0];
        const currentState = history[history.length - 1];

        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
You are the "Life & Finance Event Engine" for a German life simulation game. Return ONE plausible EventModel per call.

Keep polarity balanced: mix positive and negative events; at least ~50% should be decision-based (yes/no).

Data model (TypeScript)
- EventImpactModel:
    changeInOccupancyModel?: { occupationTitle?, occupationDescription?, yearlySalaryInEuro?, stressLevelFrom0To100? } | null
    newPortfolioModel?: { cashInEuro?, cryptoInEuro?, etfInEuro? } | null   // ABSOLUTE values after event
    changeInLivingModel?: { yearlyRentInEuro?, zip?, sizeInSquareMeter? } | null
    changeInSavingsRateInPercent: number | null      // delta
    changeInAmountOfChildren: number | null          // delta (e.g. +1 child)
    newEducationLevel: string | null                 // absolute
    changeInLifeSatisfactionFrom1To100: number | null// delta
    newMarried: boolean | null                       // absolute
- EventModel:
    impact: EventImpactModel
    alternativeImpact: EventImpactModel | null
    eventDescription: string          // short, vivid, English
    eventQuestion: string | null      // English yes/no question or null
    emoji: string                      // SINGLE emoji that represents the event (e.g., 🎉, 💍, 👶, 📉, 🏆)

Semantics
- Unchanged fields -> null/undefined.
- All "changeIn" fields are deltas.
- newPortfolioModel holds ABSOLUTE values after the event.

Constraints
- Use current state/history/goal; stay consistent (age, marriage, income, rent, etc.).
- No GET_MARRIED if already married; DIVORCE only if married; CHILD_BORN only if age ~18–50.
- Use numberWishedChildren as tendency; build on event history (no spam of same event).

Portfolio realism
- Market moves MUST update portfolio:
    - MARKET_CRASH: multiply holdings realistically (e.g., crypto *0.7–0.9, ETF *0.85–0.95; cash unchanged unless stated) and set ABSOLUTE values in newPortfolioModel.
    - MARKET_GOOD_YEAR: growth multipliers (crypto *1.05–1.25, ETF *1.03–1.15).

Child events (hard rules)
- CHILD_BORN MUST reduce money: cash down and/or savings rate negative (e.g., -2% to -8%). Never return a child event without a negative financial change encoded in the impact.
- CHILD_BORN is non-interactive: eventQuestion = null, alternativeImpact = null.

Decision events
- Non-interactive: eventQuestion = null, alternativeImpact = null (auto-apply).
- Interactive: eventQuestion is the YES prompt; impact = YES branch, alternativeImpact = NO branch (often no change or minor consequence).

Output
- Return ONLY raw JSON matching EventModel. No Markdown or text around it.
            `,
            generationConfig: { responseMimeType: "application/json" },
        });

        const contextForModel = {
            goal,
            startingState,
            currentState,
            stateHistory: history,
            previousEvents: eventHistory,
            constraints: {
                userCurrentlyMarried: currentState.married,
                currentAge: currentState.age,
                currentChildren: currentState.amountOfChildren,
                wishedChildren: goal.numberWishedChildren,
            },
        };

        const prompt = `
Erzeuge ein neues plausibles Lebensereignis für den Spieler basierend auf dem folgenden Kontext:

${JSON.stringify(contextForModel, null, 2)}
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text().trim();

            if (text.startsWith("```")) {
                text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
            }

            const data = JSON.parse(text);

            if (!data || !data.impact || !data.eventDescription) {
                console.warn("Generated event is missing required fields:", data);
                return undefined;
            }

            const impact: EventImpactModel = {
                changeInOccupancyModel: data.impact.changeInOccupancyModel ?? null,
                newPortfolioModel: data.impact.newPortfolioModel ?? null,
                changeInLivingModel: data.impact.changeInLivingModel ?? null,
                changeInSavingsRateInPercent: data.impact.changeInSavingsRateInPercent ?? null,
                changeInAmountOfChildren: data.impact.changeInAmountOfChildren ?? null,
                newEducationLevel: data.impact.newEducationLevel ?? null,
                changeInLifeSatisfactionFrom1To100: data.impact.changeInLifeSatisfactionFrom1To100 ?? null,
                newMarried: data.impact.newMarried ?? null,
            };

            let alternativeImpact: EventImpactModel | null = null;
            if (data.alternativeImpact) {
                alternativeImpact = {
                    changeInOccupancyModel: data.alternativeImpact.changeInOccupancyModel ?? null,
                    newPortfolioModel: data.alternativeImpact.newPortfolioModel ?? null,
                    changeInLivingModel: data.alternativeImpact.changeInLivingModel ?? null,
                    changeInSavingsRateInPercent: data.alternativeImpact.changeInSavingsRateInPercent ?? null,
                    changeInAmountOfChildren: data.alternativeImpact.changeInAmountOfChildren ?? null,
                    newEducationLevel: data.alternativeImpact.newEducationLevel ?? null,
                    changeInLifeSatisfactionFrom1To100:
                        data.alternativeImpact.changeInLifeSatisfactionFrom1To100 ?? null,
                    newMarried: data.alternativeImpact.newMarried ?? null,
                };
            }

            // Enforce mandatory costs for child events
            const enforceChildCost = (impactToFix: EventImpactModel | null): EventImpactModel | null => {
                if (!impactToFix) return impactToFix;
                const isChildEvent = (impactToFix.changeInAmountOfChildren ?? 0) > 0;
                if (!isChildEvent) return impactToFix;

                // Require a negative savings rate delta if none provided or non-negative
                if (
                    impactToFix.changeInSavingsRateInPercent === null ||
                    impactToFix.changeInSavingsRateInPercent === undefined ||
                    impactToFix.changeInSavingsRateInPercent >= 0
                ) {
                    impactToFix.changeInSavingsRateInPercent = -5;
                }

                // Require a cash drop if none provided
                const hasCashAbsolute = impactToFix.newPortfolioModel?.cashInEuro !== undefined && impactToFix.newPortfolioModel?.cashInEuro !== null;
                if (!hasCashAbsolute) {
                    const currentCash = currentState.portfolio.cashInEuro ?? 0;
                    const loweredCash = Math.max(0, currentCash * 0.9); // default 10% drop
                    impactToFix.newPortfolioModel = {
                        ...(impactToFix.newPortfolioModel ?? {}),
                        cashInEuro: loweredCash,
                    };
                }

                return impactToFix;
            };

            const event: EventModel = {
                impact: enforceChildCost(impact)!,
                alternativeImpact: enforceChildCost(alternativeImpact),
                eventDescription: data.eventDescription,
                eventQuestion: data.eventQuestion ?? null,
                emoji: data.emoji ?? "📌",
                year: currentState.year,
            };

            return event;
        } catch (error) {
            console.error("Error generating event:", error);
            return undefined;
        }
    }
}
