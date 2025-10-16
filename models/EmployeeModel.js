const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism majburiy"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Familya majburiy"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Lavozim majburiy"],
      trim: true,
    },
    salary_amount: {
      type: Number,
      required: [true, "Oylik summa majburiy"],
      min: [0, "Oylik manfiy bo‘lishi mumkin emas"],
    },
    salary_type: {
      type: String,
      enum: ["oylik", "haftalik"], // Bular bazada saqlanadigan qiymatlar
      required: [true, "Oylik turi tanlanishi kerak"],
    },
    currency: {
      type: String,
      enum: ["UZS", "USD", "KGS"],
      required: [true, "Valyuta tanlanishi kerak"],
      default: "UZS",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
