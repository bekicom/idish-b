const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
    partnerId: {
      type: String,
      required: false,
    },
    // clientAddress: {
    //   type: String,
    //   required: true,
    // },
    currency: {
      type: String,
      enum: ["USD", "SUM", "KGS"],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    discount: {
      type: Number,
      default: "-",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    promokodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promo",
      required: false,
      default: null,
    },
    unit: {
      type: String,
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    payment: {
      type: {
        sum: Number,
        usd: Number,
      },
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "credit"],
      required: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sale", saleSchema);
