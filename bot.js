const TelegramBot = require("node-telegram-bot-api");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

const url = "https://c2kq4hl1-8000.euw.devtunnels.ms";

const bot = new TelegramBot(API_KEY_BOT);
bot.setWebHook(`${url}/bot${API_KEY_BOT}`);

module.exports = bot;
