import { LivingModel } from "../models/living-model";

export interface HomeEngineInterface {
    handleNewHomeWish(home_desc: string): LivingModel[];
    handleNewHome(home: LivingModel): void;
}

export class HomeEngine implements HomeEngineInterface {
    constructor() {}

    public handleNewHomeWish(home_desc: string): LivingModel[] {
        // Generate multiple home choices based on description
        return [];
    }

    public handleNewHome(home: LivingModel): void {
        // Handle selection of a new home
        // maybe unneeded so delet if needed.
    }
}
