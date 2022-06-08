import { formatCurrency, calculate } from "./calculate.js";

(async () => {
  const { workedHours, workedIncome, estimatedHours, estimatedIncome } =
    await calculate();
  
  console.log();
  console.log("Worked current month");
  console.log(`⏰${workedHours} hs -> 💵${formatCurrency(workedIncome)}`);
  console.log();
  console.log("Monthly estimate");
  console.log(`⏰${estimatedHours} hs -> 💵${formatCurrency(estimatedIncome)}`);
  console.log();
})();
