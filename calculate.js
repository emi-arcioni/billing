import axios from "axios";
import "dotenv/config";

const { HARVEST_ACCOUNT_ID, HARVEST_ACCESS_TOKEN, HOUR_RATE, WORKING_HOURS } =
  process.env;

const formatCurrency = (amount) => {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return numberFormat.format(amount);
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() < 10 ? "0" : ""}${date.getMonth() + 1}`;
  const day = `${date.getUTCDate() < 10 ? "0" : ""}${date.getUTCDate()}`;

  return year + month + day;
};

const getDates = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return { firstDay, lastDay };
};

const workingDaysLeft = () => {
  const date = new Date();
  const { lastDay } = getDates();

  let count = 0;
  let from = date.getUTCDate();
  if (date.getUTCHours() >= 18) from++;

  for (let i = from; i <= lastDay.getUTCDate(); i++) {
    const day = new Date(date.getFullYear(), date.getMonth(), i).getDay();
    count += day !== 0 && day !== 6 ? 1 : 0;
  }

  return count;
};

const calculate = async () => {
  const { firstDay, lastDay } = getDates();

  try {
    const response = await axios.get(
      `https://api.harvestapp.com/v2/reports/time/tasks?from=${formatDate(
        firstDay
      )}&to=${formatDate(lastDay)}`,
      {
        headers: {
          Authorization: `Bearer ${HARVEST_ACCESS_TOKEN}`,
          "Harvest-Account-ID": HARVEST_ACCOUNT_ID,
        },
      }
    );
    let workedHours = 0;
    response.data.results.map((result) => {
      workedHours += result.billable_hours;
    });
    workedHours = Math.round(workedHours);

    const workedIncome = workedHours * parseInt(HOUR_RATE);
    const estimatedHours =
      workedHours + workingDaysLeft() * parseInt(WORKING_HOURS);
    const estimatedIncome = estimatedHours * parseInt(HOUR_RATE);

    return { workedHours, workedIncome, estimatedHours, estimatedIncome };
  } catch (err) {
    console.log(err.message);
  }
};

export { formatCurrency, calculate };
