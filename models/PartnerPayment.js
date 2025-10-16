const mongoose = require("mongoose");

const partnerPaymentSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

    // Denormalized snapshot (ixtiyoriy, hisobotlar uchun qulay)
    partner_name: { type: String, default: "" },
    partner_number: { type: String, default: "" },

    amount: { type: Number, required: true, min: 0.01 },

    currency: {
      type: String,
      enum: ["USD", "SUM", "KGS"],
      default: "USD",
      required: true,
    },

    // Enumlarni bir xil uslubda saqlaymiz
    method: {
      type: String,
      enum: ["naqt", "karta", "bank"],
      default: "naqt",
      required: true,
    },

    note: { type: String, default: "" },

    // Agar alohida sana saqlamoqchi bo‘lsang:
    paid_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Tez qidirish uchun indeks
partnerPaymentSchema.index({ partner: 1, paid_at: -1 });

module.exports = mongoose.model("PartnerPayment", partnerPaymentSchema);
