const mongoose = require("mongoose"); // Добавляем импорт mongoose

const partnerSchema = new mongoose.Schema({
  partner_name: {
    type: String,
    required: true,
    trim: true,
  },
  partner_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  partner_address: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parts: {
    type: [
      {
        part: String,
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],
  },
});
module.exports = mongoose.model("ActPartner", partnerSchema);
