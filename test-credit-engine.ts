import { CreditEngine } from "./game/engines/credit-engine";
import { StartStateModel } from "./game/models/start-state-model";

const examplePerson: StartStateModel = {
  age: 30,
  amountOfChildren: 1,
  married: true,
  savingsRateInPercent: 15,
  occupation: {
    occupationTitle: "Engineer",
    occupationDescription: "software",
    yearlySalaryInEuro: 65000,
    stressLevelFrom0To100: 40,
  },
  portfolio: {
    cashInEuro: 10000,
    cryptoInEuro: 5000,
    etfInEuro: 20000,
  },
  living: {
    yearlyRentInEuro: 12000,
    zip: "80331",
    sizeInSquareMeter: 45,
  },
};

const engine = new CreditEngine();

console.log("🏦 CREDIT ENGINE TEST\n");

console.log("All durations:");
console.log(engine.calculateAllDurations(examplePerson));

console.log("\nIndividual calculations:");
console.log(`5 years: €${engine.maxLoanAmount(examplePerson, 5).toFixed(2)}`);
console.log(`10 years: €${engine.maxLoanAmount(examplePerson, 10).toFixed(2)}`);
console.log(`15 years: €${engine.maxLoanAmount(examplePerson, 15).toFixed(2)}`);
console.log(`20 years: €${engine.maxLoanAmount(examplePerson, 20).toFixed(2)}`);
