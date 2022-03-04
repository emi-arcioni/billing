import express from "express";
import "dotenv/config";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import { formatCurrency, calculate } from "./calculate.js";

const app = express();

const { TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN } = process.env;

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
