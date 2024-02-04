const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const generateProfileImage = require("./tghandlers/profile_image.js");
const bot = require("./bot.js");
const User = require("./models/user.js");
const Gallery = require("./models/gallery.js");

const router = require("./router.js");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET", "POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use("/", router);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  try {
    console.log("Сервер стартанул!!! Порт:", PORT);
  } catch (err) {
    console.error("Ошибка!", err);
  }
});

app.post(`/bot${API_KEY_BOT}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on("polling_error", (err) => console.log(err.data.error.message));

bot.on("text", async (msg) => {
  bot.sendMessage(msg.chat.id, `Здравствуйте! Выберите вашу платформу`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "iOS", callback_data: "iOS" },
          { text: "Android", callback_data: "Android" },
        ],
      ],
    },
  });
});

bot.on("callback_query", async (ctx) => {
  try {
    if (ctx.data.includes("acceptToClan")) {
      bot.sendMessage(ctx.message.chat.id, "Пользователь оповещен.");
      const user = User.findById(ctx.data.split(" ")[1]);
      bot.sendMessage(
        user.chatid,
        `🔔 Поздавляем!\n<b>Вы были приняты в клан.</b> Чтобы продолжить, <a href = "https://t.me/nwqosh">Напишите нашему администратору за ссылкой</a>\nПривилегии на сайте выданы`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );
      user.isClanMember = true;
      user.save();
    }
    if (ctx.data.includes("rejectFromClan")) {
      bot.sendMessage(ctx.message.chat.id, "Пользователь оповещен.");
      const user = User.findById(ctx.data.split(" ")[1]);
      bot.sendMessage(
        user.chatid,
        `🔔 Уведомление!\nК сожалению, ваша заявка нам не подошла. Не расстраивайтесь, попробуйте еще раз в след. раз!`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );
    }
    switch (ctx.data) {
      case "iOS":
        bot.sendPhoto(ctx.message.chat.id, "https://i.imgur.com/72MovHv.png", {
          caption: `Перед тем, как вы продолжите, пожалуйста, выполните данную инструкцию, чтобы авторизация прошла успешно (для iOS)`,
          reply_markup: {
            inline_keyboard: [[{ text: "Выполнил(а)", callback_data: "done" }]],
          },
        });
        break;
      case "Android":
        bot.sendPhoto(ctx.message.chat.id, "https://i.imgur.com/hGWBYp2.png", {
          caption: `Перед тем, как вы продолжите, пожалуйста, выполните данную инструкцию, чтобы авторизация прошла успешно (для Android)`,
          reply_markup: {
            inline_keyboard: [[{ text: "Выполнил(а)", callback_data: "done" }]],
          },
        });
        break;
      case "done":
        bot.sendPhoto(ctx.message.chat.id, "https://i.imgur.com/fVhg0a8.png", {
          caption: `Для завершения регистрации нажмите на кнопку https://c2kq4hl1-5173.euw.devtunnels.ms/?token=${jwt.sign(
            ctx.message.chat.id,
            "urionzzz"
          )}&tgusername=${ctx.message.chat.username}&tgfirstname=${
            ctx.message.chat.first_name
          }&tglastname=${ctx.message.chat.last_name}`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Нажмите сюда",
                  url: `https://c2kq4hl1-5173.euw.devtunnels.ms/?token=${jwt.sign(
                    ctx.message.chat.id,
                    "urionzzz"
                  )}&tgusername=${ctx.message.chat.username}&tgfirstname=${
                    ctx.message.chat.first_name
                  }&tglastname=${ctx.message.chat.last_name}`,
                },
              ],
            ],
          },
        });
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("photo", async (img) => {
  try {
    let image = img.photo[img.photo.length - 2].file_id;
    let url = bot.getFile(image).file_path;
    console.log(url);

    let dbImage = new Gallery({
      src: `https://api.telegram.org/file/bot6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY/${url}`,
    });
    bot.sendMessage(img.chat.id, "Фотография загружена");
    dbImage.save();
  } catch (err) {
    console.error(err);
  }
});

module.exports = app;
