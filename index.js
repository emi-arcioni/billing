import { formatCurrency, calculate } from './calculate.js';

calculate().then((data) => {
  console.log(`*Worked current month*\n⏰${
    data.workedHours
  } hs 💵${formatCurrency(
    data.workedIncome
  )}\n*Monthly estimate*\n⏰${
    data.estimatedHours
  } hs 💵${formatCurrency(data.estimatedIncome)}`);
});