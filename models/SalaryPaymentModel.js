const mongoose = require("mongoose");

const salaryPaymentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "To‘lov miqdori manfiy bo‘lishi mumkin emas"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SalaryPayment", salaryPaymentSchema);
