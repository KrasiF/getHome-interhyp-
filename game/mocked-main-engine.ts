import { GameEngine } from "./main-engine";
import { EventEngine } from "./engines/event-engine";
import { JobEngine } from "./engines/job-engine";
import { SatisfactionEngine } from "./engines/satisfaction-engine";
import { InvestmentEngine } from "./engines/investment-engine";
import { HomeEngine } from "./engines/home-engine";
import { EventModel } from "./models/event-model";
import { OccupationModel } from "./models/occupation-model";
import { LivingModel } from "./models/living-model";
import { PortfolioModel } from "./models/portfolio-model";
import { StateModel } from "./models/state-model";
import { GoalModel } from "./models/goal-model";
import { EventType } from "./engines/event-engine";

// Mock Event Engine
class MockEventEngine implements Partial<EventEngine> {
  randomlyGenerateEvent(probability: number, history: StateModel[], goals: GoalModel[]): EventModel {
    // Return a mock event if random condition is met
    if (Math.random() < probability) {
      return {
        impact: {
          changeInOccupancyModel: null,
          newPortfolioModel: { cashInEuro: 5000 },
          changeInLivingModel: null,
          changeInSavingsRateInPercent: 5,
          changeInAmountOfChildren: 0,
          newEducationLevel: null,
          changeInLifeSatisfactionFrom1To100: 10,
          newMarried: null,
        },
        alternativeImpact: {
          changeInOccupancyModel: null,
          newPortfolioModel: null,
          changeInLivingModel: null,
          changeInSavingsRateInPercent: null,
          changeInAmountOfChildren: null,
          newEducationLevel: null,
          changeInLifeSatisfactionFrom1To100: -5,
          newMarried: null,
        },
        eventDescription: "You received a bonus at work!",
        eventQuestion: "Do you want to save it or spend it?",
      };
    }
    // Return null-like event if no event occurs
    return {
      impact: {
        changeInOccupancyModel: null,
        newPortfolioModel: null,
        changeInLivingModel: null,
        changeInSavingsRateInPercent: null,
        changeInAmountOfChildren: null,
        newEducationLevel: null,
        changeInLifeSatisfactionFrom1To100: null,
        newMarried: null,
      },
      alternativeImpact: null,
      eventDescription: "Nothing special happened this year.",
      eventQuestion: null,
    };
  }

  generateEvent(history: StateModel[], goals: GoalModel[], eventType: EventType): EventModel {
    return {
      impact: {
        changeInOccupancyModel: null,
        newPortfolioModel: null,
        changeInLivingModel: null,
        changeInSavingsRateInPercent: null,
        changeInAmountOfChildren: eventType === EventType.CHILD_BORN ? 1 : null,
        newEducationLevel: null,
        changeInLifeSatisfactionFrom1To100: 5,
        newMarried: eventType === EventType.GET_MARRIED ? true : null,
      },
      alternativeImpact: {
        changeInOccupancyModel: null,
        newPortfolioModel: null,
        changeInLivingModel: null,
        changeInSavingsRateInPercent: null,
        changeInAmountOfChildren: null,
        newEducationLevel: null,
        changeInLifeSatisfactionFrom1To100: 0,
        newMarried: null,
      },
      eventDescription: `Event type: ${EventType[eventType]}`,
      eventQuestion: "Do you accept?",
    };
  }
}

// Mock Job Engine
class MockJobEngine implements Partial<JobEngine> {
  async handleNewJobWish(job_description: string): Promise<OccupationModel> {
    // Return a mock job based on description keywords
    const salary = job_description.toLowerCase().includes("senior") ? 100000 : 
                   job_description.toLowerCase().includes("lead") ? 120000 : 70000;
    
    return {
      occupationTitle: job_description,
      occupationDescription: `Mock job: ${job_description}`,
      yearlySalaryInEuro: salary,
      stressLevelFrom0To100: 50,
    };
  }
}

// Mock Satisfaction Engine
class MockSatisfactionEngine implements Partial<SatisfactionEngine> {
  handleSatisfaction(state: StateModel): number {
    // Simple mock calculation based on salary and stress
    let satisfaction = 50;
    
    if (state.occupation?.yearlySalaryInEuro > 80000) satisfaction += 20;
    if (state.occupation?.stressLevelFrom0To100 > 70) satisfaction -= 15;
    if (state.married) satisfaction += 10;
    if (state.amountOfChildren > 0) satisfaction += 5 * state.amountOfChildren;
    
    return Math.max(0, Math.min(100, satisfaction));
  }
}

// Mock Investment Engine
class MockInvestmentEngine implements Partial<InvestmentEngine> {
  handleReturnOnInvestment(state: StateModel): PortfolioModel {
    // Mock 5% return on all investments
    return {
      cashInEuro: state.portfolio.cashInEuro * 1.02, // 2% interest on cash
      cryptoInEuro: state.portfolio.cryptoInEuro * 1.10, // 10% on crypto (volatile)
      etfInEuro: state.portfolio.etfInEuro * 1.07, // 7% on ETFs
    };
  }
}

// Mock Home Engine
class MockHomeEngine implements Partial<HomeEngine> {
  async handleNewHomeWish(home_desc: string): Promise<LivingModel[]> {
    // Return mock home options
    const isMunich = home_desc.toLowerCase().includes("munich");
    const isBerlin = home_desc.toLowerCase().includes("berlin");
    
    const baseRent = isMunich ? 18000 : isBerlin ? 14400 : 12000;
    
    return [
      {
        yearlyRentInEuro: baseRent,
        zip: isMunich ? "80331" : isBerlin ? "10115" : "60311",
        sizeInSquareMeter: 75,
      },
      {
        yearlyRentInEuro: baseRent * 1.3,
        zip: isMunich ? "80333" : isBerlin ? "10117" : "60313",
        sizeInSquareMeter: 95,
      },
      {
        yearlyRentInEuro: baseRent * 0.7,
        zip: isMunich ? "81539" : isBerlin ? "13353" : "60487",
        sizeInSquareMeter: 60,
      },
    ];
  }

  handleNewHome(home: LivingModel): void {
    // Mock - does nothing
  }
}

// Factory function to create a mocked GameEngine
export function createMockedGameEngine(): GameEngine {
  return new GameEngine(
    new MockEventEngine() as unknown as EventEngine,
  );
}

// Export mock classes for testing
export {
  MockEventEngine,
  MockJobEngine,
  MockSatisfactionEngine,
  MockInvestmentEngine,
  MockHomeEngine,
};
