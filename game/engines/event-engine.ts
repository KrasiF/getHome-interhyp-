import { EventModel } from "../models/event-model";
import { GoalModel } from "../models/goal-model";
import { StateModel } from "../models/state-model";

export interface EventEngineInterface {
    randomlyGenerateEvent(probability: number, history: StateModel[], goals: GoalModel[]): EventModel | undefined;
}

export enum EventType {
    ANY,
    CHILD_BORN, // life sat plus, income lower?
    GET_MARRIED, // life sat plus
    DIVORCE, // life satisfaction minus, maybe income plus?
    MARKET_CRASH, // investments get affected
    MARKET_GOOD_YEAR // inverstments positive affected
}

export class EventEngine implements EventEngineInterface {
    constructor() {}

    public randomlyGenerateEvent(probability: number, history: StateModel[], goals: GoalModel[]): EventModel | undefined {
        // maybe decide on event type
        
        // then either use llm to generate something that make sense, or get hardocded exAMPLE
        throw Error("Not impl.");
    }

    private generateEvent(history: StateModel[], goals: GoalModel[], eventType: EventType): EventModel {
        // Generate event based on history, goals and event type
        throw Error("Not impl.");
    }
}
