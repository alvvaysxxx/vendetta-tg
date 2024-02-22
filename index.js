const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bot = require("./bot.js");
const User = require("./models/user.js");
const Gallery = require("./models/gallery.js");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

(async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
    );
  } catch (error) {
    console.error("Ошибка при подключении к MongoDB:", error);
  }
})();

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-Type", "application/json");
  next();
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  try {
    console.log("Сервер стартанул!!! Порт:", PORT);
  } catch (err) {
    console.error("Ошибка при запуске сервера:", err);
  }
});

app.post(`/bot${API_KEY_BOT}`, async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    console.log("Я получил сообщение!!!");
    res.sendStatus(200);
  } catch (error) {
    console.error("Ошибка при обработке сообщения от бота:", error);
    res.sendStatus(500);
  }
});

bot.on("text", async (msg) => {
  try {
    if (msg.text === "/start" && msg.chat.type == "private") {
      bot.sendMessage(
        msg.chat.id,
        `<b>Добро пожаловать в экосистему клана Vendetta.</b>\nПо нажатию на кнопку "Приложение" снизу вы сможете попасть в наше приложение.\nТак-же, вы можете использовать команды. Напишите "/", и Telegram выведет вам список команд`,
        {
          parse_mode: "HTML",
        }
      );
    }

    if (
      msg.text === "/inventory" ||
      msg.text === "/inventory@avkvendetta_bot"
    ) {
      let data = await User.findOne({ chatid: msg.from.id });
      if (!data) {
        if (!data) {
          return bot.sendMessage(
            msg.chat.id,
            `Вы еще не создали свой профиль в системе Vendetta.`,
            {
              parse_mode: "HTML",
            }
          );
        }
      }
      bot.sendMessage(
        msg.chat.id,
        `👤 Предметы пользователя @${msg.from.username}\n\n📝 <b>Снятие преда:</b> ${data.inventory.unwarn}\n🏷️ <b>Переход на новый уровень:</b> ${data.inventory.nextLvl}\n⭐ <b>Анонимное сообщение:</b> ${data.inventory.anonymousMsg}`,
        {
          parse_mode: "HTML",
        }
      );
    }

    if (msg.text === "/profile" || msg.text == "/profile@avkvendetta_bot") {
      let data = await User.findOne({ chatid: msg.from.id });
      if (!data) {
        return bot.sendMessage(
          msg.chat.id,
          `Вы еще не создали свой профиль в системе Vendetta.`,
          {
            parse_mode: "HTML",
          }
        );
      }
      bot.sendMessage(
        msg.chat.id,
        `👤 Профиль пользователя @${msg.from.username}\n\n📝 КД: ${
          data.friendCode
        }\n🏷️ Ник: ${data.username}\n⭐ Уровень: ${Math.trunc(
          data.xp / 1000
        )}\n\Роль пользователя: <b>${data.role}</b>`,
        {
          parse_mode: "HTML",
        }
      );
    }
  } catch (error) {
    console.error("Ошибка при обработке текстового сообщения:", error);
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    if (ctx.data.includes("acceptToClan")) {
      await bot.sendMessage(ctx.message.chat.id, "Пользователь оповещен.");
      const user = await User.findById(ctx.data.split(" ")[1]);
      console.log("hi!");
      await bot.sendMessage(
        user.chatid,
        `🔔 Поздавляем!\n<b>Вы были приняты в клан.</b> Чтобы продолжить, <a href = "https://t.me/nwqosh">Напишите нашему администратору за ссылкой</a>\nПривилегии на сайте выданы`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );
      user.isClanMember = true;
      await user.save();
    }
    if (ctx.data.includes("rejectFromClan")) {
      await bot.sendMessage(ctx.message.chat.id, "Пользователь оповещен.");
      const user = await User.findById(ctx.data.split(" ")[1]);
      await bot.sendMessage(
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
        await bot.sendPhoto(
          ctx.message.chat.id,
          "https://i.imgur.com/72MovHv.png",
          {
            caption: `Перед тем, как вы продолжите, пожалуйста, выполните данную инструкцию, чтобы авторизация прошла успешно (для iOS)`,
            reply_markup: {
              inline_keyboard: [
                [{ text: "Выполнил(а)", callback_data: "done" }],
              ],
            },
          }
        );
        break;
      case "Android":
        await bot.sendPhoto(
          ctx.message.chat.id,
          "https://i.imgur.com/hGWBYp2.png",
          {
            caption: `Перед тем, как вы продолжите, пожалуйста, выполните данную инструкцию, чтобы авторизация прошла успешно (для Android)`,
            reply_markup: {
              inline_keyboard: [
                [{ text: "Выполнил(а)", callback_data: "done" }],
              ],
            },
          }
        );
        break;
      case "done":
        bot.sendPhoto(ctx.message.chat.id, "https://i.imgur.com/fVhg0a8.png", {
          caption: `Для завершения регистрации нажмите на кнопку`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Нажмите сюда",
                  url: `https://vendetta-avkn.vercel.app/?token=${jwt.sign(
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
    console.error("Ошибка при обработке callback_query:", error);
  }
});

bot.on("photo", async (img) => {
  try {
    if (img.chat.type === "private") {
      let image = img.photo[img.photo.length - 2].file_id;
      let url = (await bot.getFile(image)).file_path;
      console.log(url);

      let dbImage = new Gallery({
        src: `https://api.telegram.org/file/bot6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY/${url}`,
      });
      await bot.sendMessage(img.chat.id, "Фотография загружена");
      await dbImage.save();
    }
  } catch (error) {
    console.error("Ошибка при обработке фотографии:", error);
  }
});

module.exports = app;
