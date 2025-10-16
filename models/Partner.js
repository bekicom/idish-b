const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    // 🏷️ Asosiy ma'lumotlar
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

    // 💰 Narx va valyuta
    currency: {
      type: String,
      enum: ["USD", "SUM", ""],
      default: "",
    },
    purchasePrice: {
      value: {
        type: Number,
        default: 0,
      },
    },
    sellingPrice: {
      value: {
        type: Number,
        default: 0,
      },
    },

    // 📦 Miqdor va o'lchov
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

    // 🏭 Ombor va kategoriya
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: false,
      default: null,
    },
    category: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      default: "",
    },
    barcode: {
      type: String,
      required: true,
    },
    part: {
      type: String,
      default: "",
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    image_url: {
      type: String,
      default: "",
    },

    // 💳 Hamkorga qarz maydonlari
    total_debt: { type: Number, default: 0 }, // jami qarz
    paid_amount: { type: Number, default: 0 }, // to‘langan summa
    remaining_debt: { type: Number, default: 0 }, // qolgan qarz

    payment_history: [
      {
        amount: { type: Number, required: true },
        currency: {
          type: String,
          enum: ["USD", "SUM"],
          default: "USD",
        },
        method: {
          type: String,
          enum: ["naqt", "karta", "bank","qarz"],
          default: "naqt",
        },
        date: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🔁 Qolgan qarzni avtomatik hisoblaydi
partnerSchema.pre("save", function (next) {
  this.remaining_debt = this.total_debt - this.paid_amount;
  next();
});

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
