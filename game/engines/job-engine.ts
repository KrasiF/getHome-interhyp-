import { OccupationModel } from "../models/occupation-model";

export interface JobEngineInterface {
    handleNewJobWish(job_description: string): OccupationModel;
}

export class JobEngine implements JobEngineInterface {
    constructor() {}

    public handleNewJobWish(job_description: string): OccupationModel {
        // Handle new job wish based on description
        throw Error("Not impl.");
    }
}
