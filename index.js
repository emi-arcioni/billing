const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const {
  HARVEST_ACCOUNT_ID,
  HARVEST_ACCESS_TOKEN,
  HOUR_RATE,
  WORKING_HOURS,
  TELEGRAM_CHAT_ID,
  TELEGRAM_BOT_TOKEN,
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
  const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;

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
  for (let i = date.getDate() + 1; i <= lastDay.getDate(); i++) {
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

    const workedIncome = workedHours * parseInt(HOUR_RATE);
    const estimatedHours =
      workedHours + workingDaysLeft() * parseInt(WORKING_HOURS);
    const estimatedIncome = estimatedHours * parseInt(HOUR_RATE);

    return { workedHours, workedIncome, estimatedHours, estimatedIncome };
  } catch (err) {
    console.log(err.message);
  }
};

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: true,
});

bot.on("message", (msg) => {
  if (TELEGRAM_CHAT_ID != msg.chat.id) return;

  if (msg.entities) {
    msg.entities.map((entity) => {
      if (
        entity.type === "bot_command" &&
        msg.text.slice(entity.offset, entity.offset + entity.length) ===
          "/estimate"
      ) {
        calculate().then((data) => {
          bot.sendMessage(
            TELEGRAM_CHAT_ID,
            `*Worked current month*\n⏰${
              data.workedHours
            } hs 💵${formatCurrency(
              data.workedIncome
            )}\n*Monthly estimate*\n⏰${
              data.estimatedHours
            } hs 💵${formatCurrency(data.estimatedIncome)}`,
            { parse_mode: "markdown" }
          );
        });
      }
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("App running");
});

app.get("/", function (req, res) {
  res.send({ message: "API Works!" });
});

if (process.env.APP_URL) {
  setInterval(async () => {
      try {
        const response = await axios.get(process.env.APP_URL);
        console.log(response.data);
      } catch (err) {}
  }, 300000); // every 5 minutes (300000)
}