const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UnfinishedSchema = new Schema(
  {
    products: [
      {
        name: {
          type: String,
          required: true,
        },
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        checked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Unfinished", UnfinishedSchema);
