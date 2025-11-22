import { StateModel } from "./models/state-model";
import { EventEngine } from "./engines/event-engine";
import { JobEngine } from "./engines/job-engine";
import { SatisfactionEngine } from "./engines/satisfaction-engine";
import { InvestmentEngine } from "./engines/investment-engine";
import { HomeEngine } from "./engines/home-engine";
import { GoalModel } from "./models/goal-model";
import { StartStateModel } from "./models/start-state-model";
import { EventModel } from "./models/event-model";
import { OccupationModel } from "./models/occupation-model";
import { LivingModel } from "./models/living-model";
import { UserInputModel } from "./models/user-input-model";
import { PortfolioModel } from "./models/portfolio-model";

export class GameEngine implements GameEngineInterface {
    private eventEngine: EventEngine;
    private jobEngine: JobEngine;
    private satisfactionEngine: SatisfactionEngine;
    private investmentEngine: InvestmentEngine;
    private homeEngine: HomeEngine;

    private state: StateModel;
    private goals: GoalModel;
    private history: StateModel[];
    private eventHistory: EventModel[];
    private isRunning: boolean;
    private currentEventResult: EventModel | undefined;

    constructor(
        eventEngine?: EventEngine,
        jobEngine?: JobEngine,
        satisfactionEngine?: SatisfactionEngine,
        investmentEngine?: InvestmentEngine,
        homeEngine?: HomeEngine
    ) {
        this.eventEngine = eventEngine ?? new EventEngine();
        this.jobEngine = jobEngine ?? new JobEngine();
        this.satisfactionEngine = satisfactionEngine ?? new SatisfactionEngine();
        this.investmentEngine = investmentEngine ?? new InvestmentEngine();
        this.homeEngine = homeEngine ?? new HomeEngine();

        this.state = {} as StateModel;
        this.goals = {} as GoalModel;
        this.history = [];
        this.eventHistory = [];
        this.isRunning = false;
        this.currentEventResult = undefined;  
    }
    async requestNewOccupation(occupation_description: string): Promise<OccupationModel> {
        return await this.jobEngine.handleNewJobWish(occupation_description);
    }
    async requestNewHomes(home_description: string): Promise<LivingModel[]> {
        return await this.homeEngine.handleNewHomeWish(home_description);
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
    startGame(startState: StartStateModel, goal: GoalModel): StateModel {
        if(this.isRunning) {
            throw new Error("Game is already running.");
        }

        this.state = {
            ...startState,
            year: new Date().getFullYear(),
            educationLevel: "",
            lifeSatisfactionFrom1To100: 50,
            terminated: false
        };

        this.isRunning = true;
        this.history = [structuredClone(this.state)];
        this.eventHistory = [];
        this.currentEventResult = undefined;

        this.goals = goal;

        return this.state;
    }
    runLoop(): EventModel | undefined {
        // Apply automatic updates
        this.state.portfolio = this.investmentEngine.handleReturnOnInvestment(this.state);
        this.state.lifeSatisfactionFrom1To100 = this.satisfactionEngine.handleSatisfaction(this.state);

        // Increment year and age
        this.state.year += 1;
        this.state.age += 1;

        // Check if goal is reached
        this.checkGoalReached();

        this.history.push(JSON.parse(JSON.stringify(this.state)));

        const random_event = this.eventEngine.randomlyGenerateEvent(0.5, this.history, [this.goals]);
        
        if (random_event) {
            this.currentEventResult = random_event;
        }
        
        return random_event;
    }
    reset(): void {
        this.isRunning = false;
        this.state = {
            year: 0,
            age: 0,
            occupation: {} as OccupationModel,
            portfolio: {} as PortfolioModel,
            living: {} as LivingModel,
            savingsRateInPercent: 0,
            amountOfChildren: 0,
            educationLevel: "",
            lifeSatisfactionFrom1To100: 0,
            married: false,
            terminated: false
        };
        this.goals = {} as GoalModel;
        this.history = [];
        this.eventHistory = [];
        this.currentEventResult = undefined;
    }
    decideEvent(decision: boolean): StateModel {
        if (!this.currentEventResult) {
            throw new Error("No event to decide on.");
        }

        const impact = decision ? this.currentEventResult.impact : this.currentEventResult.alternativeImpact;
        
        if (impact) {
            this.applyEventImpact(impact);
        }

        this.eventHistory.push(this.currentEventResult);
        this.history.push(structuredClone(this.state));
        this.currentEventResult = undefined;

        return this.state;
    }

    private applyEventImpact(impact: any): void {
        // Apply occupation changes
        if (impact.changeInOccupancyModel) {
            this.state.occupation = { ...this.state.occupation, ...impact.changeInOccupancyModel };
        }

        // Apply portfolio changes
        if (impact.newPortfolioModel) {
            this.state.portfolio = { ...this.state.portfolio, ...impact.newPortfolioModel };
        }

        // Apply living changes
        if (impact.changeInLivingModel) {
            this.state.living = { ...this.state.living, ...impact.changeInLivingModel };
        }

        // Apply savings rate change
        if (impact.changeInSavingsRateInPercent !== null) {
            this.state.savingsRateInPercent += impact.changeInSavingsRateInPercent;
        }

        // Apply children count change
        if (impact.changeInAmountOfChildren !== null) {
            this.state.amountOfChildren += impact.changeInAmountOfChildren;
        }

        // Apply education level change
        if (impact.newEducationLevel !== null) {
            this.state.educationLevel = impact.newEducationLevel;
        }

        // Apply life satisfaction change
        if (impact.changeInLifeSatisfactionFrom1To100 !== null) {
            this.state.lifeSatisfactionFrom1To100 += impact.changeInLifeSatisfactionFrom1To100;
        }

        // Apply married status change
        if (impact.newMarried !== null) {
            this.state.married = impact.newMarried;
        }
    }

    decideActions(userInput: UserInputModel): StateModel {
        // Apply user actions
        if (userInput.newOccupationModel) {
            this.state.occupation = userInput.newOccupationModel;
        }

        if (userInput.newLivingModel) {
            this.state.living = userInput.newLivingModel;
        }

        if (userInput.newPortfolioModel) {
            this.state.portfolio = { ...this.state.portfolio, ...userInput.newPortfolioModel };
        }

        if (userInput.newSavingsRateInPercent !== null) {
            this.state.savingsRateInPercent = userInput.newSavingsRateInPercent;
        }

        // // Apply automatic updates
        // this.state.portfolio = this.investmentEngine.handleReturnOnInvestment(this.state);
        // this.state.lifeSatisfactionFrom1To100 = this.satisfactionEngine.handleSatisfaction(this.state);

        // // Increment year and age
        // this.state.year += 1;
        // this.state.age += 1;

        // // Check if goal is reached
        // this.checkGoalReached();

        // this.history.push(JSON.parse(JSON.stringify(this.state)));


        return this.state;
    }

    private checkGoalReached(): void {
        const totalWealth = 
            this.state.portfolio.cashInEuro + 
            this.state.portfolio.cryptoInEuro + 
            this.state.portfolio.etfInEuro;

        if (totalWealth >= this.goals.buyingPrice) {
            (this.state as any).terminated = true; 
            this.isRunning = false;
        }
    }
}

export interface GameEngineInterface {
    getState(): StateModel;
    getGoals(): GoalModel;
    getHistory(): StateModel[];
    getEventHistory(): EventModel[];

    startGame(start_state: StartStateModel, goal: GoalModel): StateModel;
    runLoop(): EventModel | undefined;
    reset(): void;
    decideEvent(decision: boolean): StateModel;
    decideActions(userInput: UserInputModel): StateModel;
    requestNewOccupation(occupation_description: string): Promise<OccupationModel>;
    requestNewHomes(home_description: string): Promise<LivingModel[]>;
}




