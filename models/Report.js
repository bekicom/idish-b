// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
     {
          partnerId: {
               type: String,
               required: false, 
          },
          partnerName: {
               type: String,
               default: "Unknown",
          },
          clientId: {
               type: String,
               required: false,
          },
          clientName: {
               type: String,
               default: "Unknown",
          },
          type: {
               type: String,
               enum: ["debt", "payment", "other"],
               required: [true, "Type is required"],
          },
          amount: {
               type: Number,
               required: [true, "Amount is required"],
               min: [0, "Amount must be positive"],
          },
          currency: {
               type: String,
               enum: ["USD", "SUM"],
               required: [true, "Currency is required"],
          },
          date: {
               type: Date,
               default: Date.now,
          },
          comment: {
               type: String,
               maxlength: [500, "Comment cannot exceed 500 characters"],
          },
          createdBy: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true,
          },
     },
     {
          timestamps: true,
     }
);

// Убедимся, что хотя бы один из partnerId или clientId присутствует
reportSchema.pre("validate", function (next) {
     if (!this.partnerId && !this.clientId) {
          next(new Error("Either partnerId or clientId is required"));
     } else {
          next();
     }
});

module.exports = mongoose.model("Report", reportSchema);