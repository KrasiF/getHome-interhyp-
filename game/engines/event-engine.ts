//relistischer machen
//infos zeigen

import { GoogleGenerativeAI } from "@google/generative-ai";

import type { EventModel } from "../models/event-model";
import type { EventImpactModel } from "../models/event-impact-model";
import type { GoalModel } from "../models/goal-model";
import type { StateModel } from "../models/state-model";

export interface EventEngineInterface {
    randomlyGenerateEvent(probability: number, history: StateModel[], goal: GoalModel, eventHistory: EventModel[]): Promise<EventModel | undefined>;
}

export class EventEngine implements EventEngineInterface {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API Key is missing! Please provide it in .env.local");
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
                You are a "Life & Finance Event Engine" for a German life simulation game.
                The player simulates their life, takes financial and life decisions, and wants to figure out
                when to best take a mortgage for their dream home.

                Your task:
                - Generate ONE plausible life event that happens in the given year.
                - The event must be consistent with:
                    - the user's goal (dream home, number of children, etc.)
                    - the starting state
                    - the complete state history
                    - the previous event history
                - The event is fully described via an EventImpactModel.

                About half of the events shall have positive impact on the users simulation life and the other half negative.

                Data model (TypeScript):

                export interface EventImpactModel {
                    changeInOccupancyModel: {
                        occupationTitle?: string;
                        occupationDescription?: string;
                        yearlySalaryInEuro?: number;
                        stressLevelFrom0To100?: number;
                    } | null;

                    newPortfolioModel: {
                        cashInEuro?: number;
                        cryptoInEuro?: number;
                        etfInEuro?: number;
                    } | null;

                    changeInLivingModel: {
                        yearlyRentInEuro?: number;
                        zip?: string;
                        sizeInSquareMeter?: number;
                    } | null;

                    changeInSavingsRateInPercent: number | null;          // delta relative to current state
                    changeInAmountOfChildren: number | null;              // delta, e.g. +1 if child is born
                    newEducationLevel: string | null;                     // absolute new education level
                    changeInLifeSatisfactionFrom1To100: number | null;   // delta, e.g. +5 or -10
                    newMarried: boolean | null;                          // absolute new married status
                }

                export interface EventModel {
                    impact: EventImpactModel;
                    alternativeImpact: EventImpactModel | null;

                    eventDescription: string;      // short, vivid sentence in Englisch
                    eventQuestion: string | null;  // yes/no question in Englisch, or null
                }

                Semantics:
                - All fields that are NOT impacted by the event must be set to null (or left undefined inside the partials).
                - Numerical fields with prefix "changeIn" are DELTAS relative to the current state.
                - "newPortfolioModel" contains ABSOLUTE values (if set) for the portfolio after the event.
                - "newEducationLevel" and "newMarried" are absolute new values.

                Event logic:
                - Example event types to consider (inspiration):
                    - CHILD_BORN      (life satisfaction plus, more costs, lower savings rate)
                    - GET_MARRIED     (life satisfaction plus, more stability)
                    - DIVORCE         (life satisfaction minus, financial + stress effects)
                    - MARKET_CRASH    (portfolio drops)
                    - MARKET_GOOD_YEAR (portfolio grows)
                    - CAREER_STEP      (higher salary, maybe more stress)
                    - FURTHER_EDUCATION (improved education level, maybe lower current income but higher future potential)
                    - RELOCATION       (rent, zip, size change)

                Constraints:
                - Use the current state as truth:
                    - current age, children, marriage status, income, rent, etc.
                - Do NOT create "GET_MARRIED" if currentState.married is true.
                - You may create "DIVORCE" only if currentState.married is true.
                - You may create "CHILD_BORN" only if current age is in a plausible child-bearing range (approx 18–50).
                - Use goal.numberWishedChildren as a tendency, but the player may end up with fewer or more children.
                - Build on previous events (e.g., remarriage after divorce is allowed, not 5 crashes in 5 years, etc.).

                Decision / interactive events:
                - Some events are non-interactive (e.g. "Market crash on global markets"):
                    - eventQuestion = null
                    - alternativeImpact = null
                    - The impact is automatically applied.
                - Some events are interactive decisions (e.g. "Heiratsantrag", "Jobangebot mit höherem Gehalt", "Umzug"):
                    - eventQuestion: a yes/no question in Englisch to the player.
                      Example: "Möchtest du deinen Partner heiraten?" or
                               "Möchtest du das Jobangebot mit höherem Gehalt, aber mehr Stress annehmen?"
                    - impact: describes the consequences if the player answers YES.
                    - alternativeImpact: describes the consequences if the player answers NO.
                        - Often this is "no change" (all fields null),
                          but it can also include small consequences (e.g., slight drop in life satisfaction
                          if the player declines a dream job or refuses marriage).

                Important:
                - Always return a FULL EventModel object with:
                    - impact (EventImpactModel)
                    - alternativeImpact (EventImpactModel or null)
                    - eventDescription (string, Englisch)
                    - eventQuestion (string or null)
                - For non-interactive events:
                    - eventQuestion = null
                    - alternativeImpact = null

                Output:
                - Respond ONLY with a raw JSON object that matches EventModel.
                - No Markdown, no explanation, no surrounding text.
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

            const event: EventModel = {
                impact,
                alternativeImpact,
                eventDescription: data.eventDescription,
                eventQuestion: data.eventQuestion ?? null,
            };

            return event;
        } catch (error) {
            console.error("Error generating event:", error);
            return undefined;
        }
    }
}
