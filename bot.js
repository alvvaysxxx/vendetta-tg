const TelegramBot = require("node-telegram-bot-api");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

//const url = "http://62.113.102.166:8000";
const url = "https://c2kq4hl1-8000.euw.devtunnels.ms";

const commands = [
  {
    command: "start",
    description: "Запуск бота",
  },
  {
    command: "profile",
    description: "Ваш профиль",
  },
  {
    command: "help",
    description: "Раздел помощи",
  },
];

const bot = new TelegramBot(API_KEY_BOT, {
  polling: true,
});

bot.setMyCommands(commands);

module.exports = bot;
