const mongoose = require("mongoose");

const UsdSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
      default: 1,
    },
    kgs: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usd", UsdSchema);
