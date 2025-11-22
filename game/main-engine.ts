import { StateModel } from "./models/state-model";
import { EventEngine } from "./engines/event-engine";
import { JobEngine } from "./engines/job-engine";
import { CapitalEngine } from "./engines/capital-engine";
import { SatisfactionEngine } from "./engines/satisfaction-engine";
import { InvestmentEngine } from "./engines/investment-engine";
import { HomeEngine } from "./engines/home-engine";
import { GoalModel } from "./models/goal-model";
import { StartStateModel } from "./models/start-state-model";
import { EventModel } from "./models/event-model";

export class GameEngine implements GameEngineInterface {
    private eventEngine: EventEngine;
    private jobEngine: JobEngine;
    private capitalEngine: CapitalEngine;
    private satisfactionEngine: SatisfactionEngine;
    private investmentEngine: InvestmentEngine;
    private homeEngine: HomeEngine;

    private state: StateModel;
    private goals: GoalModel;
    private history: StateModel[];
    private eventHistory: EventModel[];
    private isRunning: boolean;
    private currentEventResult: EventModel | undefined;

    constructor() {
        this.eventEngine = new EventEngine();
        this.jobEngine = new JobEngine();
        this.capitalEngine = new CapitalEngine();
        this.satisfactionEngine = new SatisfactionEngine();
        this.investmentEngine = new InvestmentEngine();
        this.homeEngine = new HomeEngine();

        this.state = {} as StateModel;
        this.goals = {} as GoalModel;
        this.history = [];
        this.eventHistory = [];
        this.isRunning = false;
        this.currentEventResult = undefined;  
    }

    getState(): StateModel {
        return this.state;
    }
    getGoals(): GoalModel {
        return this.goals;
    }
    getHistory(): StateModel[] {
        return this.history;
    }
    getEventHistory(): EventModel[] {
        return this.eventHistory;
    }
    startGame(startState: StartStateModel): StateModel {
        if(this.isRunning) {
            throw new Error("Game is already running.");
        }

        
        // TODO: Implement



        return this.state;
    }
    runLoop(): EventModel {
        const random_event = this.eventEngine.randomlyGenerateEvent(0.5, this.history, [this.goals]);
        
        if (random_event) {
            this.currentEventResult = random_event;
        }
        
        return {} as EventModel;
    }
    reset(): void {
        this.isRunning = false;
        this.state = {} as StateModel;
        this.goals = {} as GoalModel;
        this.history = [];
        this.eventHistory = [];
        this.currentEventResult = undefined;
    }
    decideEvent(decision: boolean): StateModel {
        if (!this.currentEventResult) {
            throw new Error("No event to decide on.");
        }

        if (decision) {
            // TODO implement;
        }

        this.history.push(this.state);
        this.currentEventResult = undefined;

        return this.state;
    }
    decideActions(userInput: UserInputMock): StateModel {
        throw new Error("Method not implemented.");
    }

}

export interface GameEngineInterface {
    getState(): StateModel;
    getGoals(): GoalModel;
    getHistory(): StateModel[];
    getEventHistory(): EventModel[];

    startGame(start_state: StartStateModel): StateModel;
    runLoop(): EventModel;
    reset(): void;
    decideEvent(decision: boolean): StateModel;
    decideActions(userInput: UserInputMock): StateModel;
}




