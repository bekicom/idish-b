const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    partnerId: {
      type: String,
      default: null,
    },
    products: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          promokodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Promo",
            default: null,
          },
          totalAmount: {
            type: Number,
            required: true,
          },
          sellingPrice: {
            type: Number,
            required: true,
          },
          unit: {
            type: String,
            required: true,
          },
          currency: {
            type: String,
            enum: ["USD", "SUM", "KGS"], // ✅ bir xil
            required: true,
          },
        },
      ],
      default: [], // ✅ tuzatildi
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "credit"],
      default: "credit",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentHistory: {
      type: [
        {
          amount: { type: Number, required: true },
          date: {
            type: Date,
            default: Date.now, // ✅
          },
          currency: {
            type: String,
            enum: ["USD", "SUM", "KGS"], // ✅
            required: true,
          },
          storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
          },
          type: {
            type: String,
            default: "cash",
          },
        },
      ],
      default: [],
    },
    promokodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promo",
      default: null,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true, // ✅
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Debt", debtSchema);
