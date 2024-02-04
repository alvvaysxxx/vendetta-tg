const { Schema, model } = require("mongoose");

const User = new Schema({
  username: {
    type: String,
    unique: true,
  },
  tgname: {
    type: String,
  },
  tgusername: {
    type: String,
  },
  friendCode: {
    type: String,
    required: false,
    unique: true,
  },
  avatarUrl: {
    type: String,
    default: "",
    required: false,
  },
  chatid: {
    type: String,
    unique: true,
    required: true,
  },
  isClanMember: {
    type: Boolean,
    default: false,
    required: true,
  },
  xp: {
    type: Number,
    default: 1100,
  },
  vendettix: {
    type: Number,
    default: 0,
  },
  avacoins: {
    type: Number,
    default: 0,
  },
  inventory: {
    type: Array,
    default: [],
  },
  role: {
    type: String,
    default: "Пользователь",
  },
});

module.exports = model("user", User);
