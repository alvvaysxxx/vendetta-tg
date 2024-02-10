const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bot = require("../bot");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class ItemsHandler {
  async sendAnonymousMsg(req, res) {
    try {
      let { user } = req;
      let { destination, msg } = req.body;
      if (user.inventory["anonymousMsg"] === 0) {
        return res.status(403).json({ error: true });
      }
      let receiver = await User.findOne({
        tgusername: destination.split("@")[1],
      });
      if (!receiver) {
        return res.status(404).json({ error: true });
      }
      console.log(receiver.chatid);
      /* user.anonymousMsg -= 1;*/
      await bot.sendMessage(
        receiver.chatid,
        `🔔<b>Вам пришло анонимное сообщение!</b>\n\n${msg}`,
        {
          parse_mode: "HTML",
        }
      );
      user.inventory.anonymousMsg -= 1;
      await user.updateOne({
        $set: { inventory: user.inventory },
      });
      return res.status(200).json({ error: false });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
}

module.exports = ItemsHandler;
