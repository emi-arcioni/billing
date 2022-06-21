import { formatCurrency, calculate } from "./calculate.js";

(async () => {
  const { worked, estimated } = await calculate();

  console.log();
  console.log("Worked current month");
  console.log(`⏰${worked.hours} hs -> 💵${formatCurrency(worked.income)}`);
  console.log();
  console.log("Monthly estimate\n(days left doing month average from now on)");
  console.log(
    `⏰${estimated.hoursAvg} hs -> 💵${formatCurrency(
      estimated.incomeAvg
    )}`
  );
  console.log();
  console.log("Monthly estimate\n(days left doing fulltime from now on)");
  console.log(
    `⏰${estimated.hoursLeftFull} hs -> 💵${formatCurrency(
      estimated.incomeLeftFull
    )}`
  );
  console.log();
  console.log("Monthly as fulltime");
  console.log(
    `⏰${estimated.hoursFull} hs -> 💵${formatCurrency(
      estimated.incomeFull
    )}`
  );
  console.log();
})();
