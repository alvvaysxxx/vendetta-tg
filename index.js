const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bot = require("./bot.js");
const User = require("./models/user.js");
const Gallery = require("./models/gallery.js");
const axios = require("axios");

const API_KEY_BOT = "7033176556:AAFjD9Vns3shJ0hve7znsDiVIl3oEU5JQtI";

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

const PORT = process.env.PORT || 8080;

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
        `<b>Добро пожаловать в экосистему клана Vieta.</b>\nПо нажатию на кнопку "Приложение" снизу вы сможете попасть в наше приложение.\nТакже, вы можете использовать команды. Напишите "/", и Telegram выведет вам список команд`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Приложение Vieta",
                  web_app: { url: "https://Vieta-avkn.vercel.app/" },
                },
              ],
            ],
          },
        }
      );
    }

    if (msg.text == "/marriages" || msg.text == "/marriages@avavieta_bot") {
      try {
        const users = await User.find({ marriedWith: { $ne: "" } });

        // Prepare the response as an array of marriage objects
        const marriages = await Promise.all(
          users.map(async (user) => {
            try {
              const marriedWith = await User.findById(user.marriedWith);
              return {
                partner1: {
                  id: user._id,
                  avatarUrl: user.avatarUrl,
                  username: user.username,
                  tgusername: user.tgusername,
                },
                partner2: {
                  id: marriedWith._id,
                  avatarUrl: marriedWith.avatarUrl,
                  username: marriedWith.username,
                  tgusername: marriedWith.tgusername,
                },
              };
            } catch (error) {
              console.error(`Error fetching marriage details: ${error}`);
              // You might want to handle the error or return some default value
              return null;
            }
          })
        );

        const uniqueMarriages = [];

        const seenPairs = new Set();

        marriages.forEach((marriage) => {
          const sortedIds = [marriage.partner1.id, marriage.partner2.id].sort();
          const pair = sortedIds.join("_");
          if (!seenPairs.has(pair)) {
            uniqueMarriages.push(marriage);
            seenPairs.add(pair);
          }
        });

        let resStr = "";
        for (let i = 0; i < uniqueMarriages.length; i++) {
          resStr += `<a href = "https://t.me/${uniqueMarriages[i].partner1.tgusername}">${uniqueMarriages[i].partner1.username}</a> ❤ <a href = "https://t.me/${uniqueMarriages[i].partner2.tgusername}">${uniqueMarriages[i].partner2.username}</a>\n`;
        }
        await bot.sendMessage(msg.chat.id, `💍 Все браки:\n\n${resStr}`, {
          reply_to_message_id: msg.message_id,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (msg.text === "/inventory" || msg.text === "/inventory@avavieta_bot") {
      let data = await User.findOne({ chatid: msg.from.id });
      if (!data) {
        return bot.sendMessage(
          msg.chat.id,
          `Вы еще не создали свой профиль в системе Vieta.`,
          {
            reply_to_message_id: msg.message_id,
            parse_mode: "HTML",
            ...(msg.chat.type === "private"
              ? {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "Создайте!",
                          web_app: {
                            url: "https://Vieta-avkn.vercel.app/",
                          },
                        },
                      ],
                    ],
                  },
                }
              : {}),
          }
        );
      }
      bot.sendMessage(
        msg.chat.id,
        `👤 Предметы пользователя @${msg.from.username}\n\n⚠️ <b>Снятие преда:</b> ${data.inventory.unwarn}\n🌟 <b>Переход на новый уровень:</b> ${data.inventory.nextLevel}\n🤫 <b>Анонимное сообщение:</b> ${data.inventory.anonymousMsg}`,
        {
          reply_to_message_id: msg.message_id,
          parse_mode: "HTML",
        }
      );
    }

    if (msg.text === "/profile" || msg.text == "/profile@avavieta_bot") {
      let data = await User.findOne({ chatid: msg.from.id });
      if (!data) {
        return bot.sendMessage(
          msg.chat.id,
          `Вы еще не создали свой профиль в системе Vieta.`,
          {
            reply_to_message_id: msg.message_id,
            parse_mode: "HTML",
            ...(msg.chat.type === "private"
              ? {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "Создайте!",
                          web_app: {
                            url: "https://Vieta-avkn.vercel.app/",
                          },
                        },
                      ],
                    ],
                  },
                }
              : {}),
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
          reply_to_message_id: msg.message_id,
          parse_mode: "HTML",
        }
      );
    }
  } catch (error) {
    console.error("Ошибка при обработке текстового сообщения:", error);
  }
});

bot.on("message", async (msg) => {
  if (msg.new_chat_members != undefined) {
    bot.sendMessage(
      msg.chat.id,
      `<a href = "https://t.me/${msg.new_chat_participant.username}"><b>${msg.new_chat_participant.first_name}</b></a>, добро пожаловать в Vieta!`,
      {
        reply_to_message_id: msg.message_id,
        reply_markup: {
          resize_keyboard: true,
          one_time_keyboard: true,
          keyboard: [
            {
              text: "Приложение Vieta",
              web_app: "https://Vieta-avkn.vercel.app/",
            },
          ],
        },
        parse_mode: "HTML",
      }
    );
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    if (ctx.data.includes("acceptMarriage")) {
      await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
      await bot.sendMessage(
        ctx.message.chat.id,
        "✔️ Поздравляем! Вы согласились на брак!"
      );
      const user = await User.findById(ctx.data.split(" ")[1]);
      const receiver = await User.findOne({ chatid: ctx.message.chat.id });
      await bot.sendMessage(
        user.chatid,
        `🔔 <b>Уведомление!</b>\nВаша заявка на брак была принята, поздравляем!`,
        {
          parse_mode: "HTML",
        }
      );
      user.marriedWith = receiver._id;
      receiver.marriedWith = user._id;

      await user.save();
      await receiver.save();
    }

    if (ctx.data.includes("rejectMarriage")) {
      await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
      await bot.sendMessage(
        ctx.message.chat.id,
        "❌ Вы отказались от бракосочетания"
      );
      const user = await User.findById(ctx.data.split(" ")[1]);
      await bot.sendMessage(
        user.chatid,
        `🔔 <b>Уведомление!</b>\nК сожалению, ваша заявка на брак была отклонена, не расстраивайтесь!`,
        {
          parse_mode: "HTML",
        }
      );
    }

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
                  url: `https://Vieta-avkn.vercel.app/?token=${jwt.sign(
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
      console.log(img.photo);
      let imageId = img.photo[img.photo.length - 2].file_id;
      const file = await bot.getFile(imageId);
      const imageBuffer = await axios.get(
        `https://api.telegram.org/file/bot${API_KEY_BOT}/${file.file_path}`,
        { responseType: "arraybuffer" }
      );
      const base64Image = Buffer.from(imageBuffer.data, "binary").toString(
        "base64"
      );
      const response = await axios.post(
        "https://api.imgur.com/3/image",
        { image: base64Image },
        {
          headers: {
            Authorization: "Client-ID 99ab068c4469655",
          },
        }
      );

      let dbImage = new Gallery({
        src: response.data.data.link,
      });
      await bot.sendMessage(img.chat.id, "Фотография загружена");
      await dbImage.save();
    }
  } catch (error) {
    console.error("Ошибка при обработке фотографии:", error);
  }
});

module.exports = app;
