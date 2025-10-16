const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    login: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    products: {
      type: [
        {
          product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        }
      ],
      default: []
    }
  },
{ timestamps: true }
);

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
