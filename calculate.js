import axios from "axios";
import "dotenv/config";

const {
  HARVEST_ACCOUNT_ID,
  HARVEST_ACCESS_TOKEN,
  HOUR_RATE = +HOUR_RATE,
  WORKING_HOURS = +WORKING_HOURS,
} = process.env;

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

const workingDays = () => {
  const date = new Date();
  const { lastDay } = getDates();

  let from = date.getUTCDate();
  if (date.getUTCHours() >= 18) from++;

  let left = 0,
    total = 0;
  for (let i = 1; i <= lastDay.getUTCDate(); i++) {
    const day = new Date(date.getFullYear(), date.getMonth(), i).getDay();
    const sum = day !== 0 && day !== 6 ? 1 : 0;
    if (i >= from) {
      left += sum;
    }
    total += sum;
  }

  return { left, total };
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
      workedHours += result.total_hours;
    });

    const {
      left: workingDaysLeft,
      total: workingDaysTotal,
      upto = workingDaysTotal - workingDaysLeft,
    } = workingDays();

    const hoursFull = workingDaysTotal * WORKING_HOURS;
    const hoursLeftFull = workedHours + workingDaysLeft * WORKING_HOURS;
    const hoursAvg = workedHours + workingDaysLeft * (Math.round((workedHours / upto) * 10) / 10);

    let worked = {
      hours: workedHours,
      income: workedHours * HOUR_RATE,
    };
    let estimated = {
      hoursFull,
      incomeFull: hoursFull * HOUR_RATE,
      hoursLeftFull,
      incomeLeftFull: hoursLeftFull * HOUR_RATE,
      hoursAvg,
      incomeAvg: hoursAvg * HOUR_RATE
    };

    return { worked, estimated };
  } catch (err) {
    console.log(err.message);
  }
};

export { formatCurrency, calculate };
