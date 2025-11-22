import { StateModel } from "../models/state-model";

export interface SatisfactionEngineInterface {
    handleSatisfaction(state: StateModel): number;
}

export class SatisfactionEngine implements SatisfactionEngineInterface {
    constructor() {}

    public handleSatisfaction(state: StateModel): number {
        // Calculate satisfaction based on state
        return 0;
    }
}
