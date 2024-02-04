const TelegramBot = require("node-telegram-bot-api");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

const bot = new TelegramBot(API_KEY_BOT, {
  polling: {
    interval: 1000,
    autoStart: true,
  },
});

module.exports = bot;
