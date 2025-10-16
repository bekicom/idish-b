const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    name_partner: {
      type: String,
      default: "",
    },
    partner_number: {
      type: String,
      default: "",
    },
    partner_address: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      enum: ["USD", "SUM", ""],
    },
    purchasePrice: {
      value: {
        type: Number,
      },
    },
    image_url: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: null,
    },
    quantity_per_package: {
      type: Number,
      default: 1,
    },
    total_kg: {
      type: Number,
      default: null,
    },
    kg_per_box: {
      type: Number,
      default: null,
    },
    kg_per_package: {
      type: Number,
      default: null,
    },
    kg_per_quantity: {
      type: Number,
      default: null,
    },
    package_quantity_per_box: {
      type: Number,
      default: 1,
    },
    isPackage: {
      type: Boolean,
      default: true,
    },
    kg_quantity: {
      type: Number,
      default: null,
    },
    box_quantity: {
      type: Number,
      default: null,
    },
    package_quantity: {
      type: Number,
      default: 1,
    },
    sellingPrice: {
      value: {
        type: Number,
      },
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: false,
      default: null,
    },
    category: {
      type: String,
      required: false,
    },
    size: {
      type: String,
      required: false,
    },
    code: {
      type: String,
      required: false,
    },
    barcode: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    part: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
