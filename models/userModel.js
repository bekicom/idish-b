const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "seller"],
    default: "seller",
  },
  success: {
    type: {

      home: { type: Boolean, default: false },
      daily: { type: Boolean, default: false },
      statistika: { type: Boolean, default: false },
      admin: { type: Boolean, default: false },
      ombor: { type: Boolean, default: false },
      stores: { type: Boolean, default: false },
      product: { type: Boolean, default: false },
      partner: { type: Boolean, default: false },
      client: { type: Boolean, default: false },
      debtors: { type: Boolean, default: false },
      promo: { type: Boolean, default: false },
      sales: { type: Boolean, default: false },
      brak: { type: Boolean, default: false },
      expense: { type: Boolean, default: false },
      report: { type: Boolean, default: false },
      "report-add": { type: Boolean, default: false },
      hodimlar: { type: Boolean, default: false },
      oylik: { type: Boolean, default: false },
      transportions: { type: Boolean, default: false },
    },
    default: {
      home: false,
      daily: false,
      statistika: false,
      admin: false,
      ombor: false,
      stores: false,
      product: false,
      partner: false,
      client: false,
      debtors: false,
      promo: false,
      sales: false,
      brak: false,
      expense: false,
      report: false,
      "report-add": false,
      hodimlar: false,
      oylik: false,
      transportions: false,
    }
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
