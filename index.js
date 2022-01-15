require('dotenv').config();
const axios = require("axios");

const { HARVEST_ACCOUNT_ID, HARVEST_ACCESS_TOKEN, HOUR_RATE, WORKING_HOURS } = process.env;

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() < 10 ? '0' : ''}${date.getMonth() + 1}`;
  const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;

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
  for(let i = date.getDate() + 1; i <= lastDay.getDate(); i ++) {
    const day = new Date(date.getFullYear(), date.getMonth(), i).getDay();
    count += (day !== 0 && day !== 6 ? 1 : 0);
  }

  return count;
};

const run = async () => {
  const { firstDay, lastDay } = getDates();
  
  try {
    const response = await axios.get(`https://api.harvestapp.com/v2/reports/time/tasks?from=${formatDate(firstDay)}&to=${formatDate(lastDay)}`, {
      headers: {
        "Authorization": `Bearer ${HARVEST_ACCESS_TOKEN}`,
        "Harvest-Account-ID": HARVEST_ACCOUNT_ID
      }
    });
    let hours = 0;
    response.data.results.map(result => {
      hours += result.billable_hours;
    });

    const estimatedHours = (hours + (workingDaysLeft() * parseInt(WORKING_HOURS)));
    const estimatedIncome = estimatedHours * parseInt(HOUR_RATE);

    return { estimatedHours, estimatedIncome };
  } catch (err) {
    console.log(err.message);
  }
};

run().then(data => console.log(data));