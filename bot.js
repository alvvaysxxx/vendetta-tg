const TelegramBot = require("node-telegram-bot-api");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

const url = "https://vendetta-tg.vercel.app";

const bot = new TelegramBot(API_KEY_BOT);
async () => {
  await bot.setWebHook(`${url}/bot${API_KEY_BOT}`);
};

module.exports = bot;
