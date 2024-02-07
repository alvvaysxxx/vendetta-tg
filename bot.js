const TelegramBot = require("node-telegram-bot-api");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

const url = "http://62.113.102.166:8000";

const bot = new TelegramBot(API_KEY_BOT, {
  polling: true,
});

module.exports = bot;
