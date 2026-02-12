const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "ProgramPlan", required: true, index: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    provider: { type: String, enum: ["razorpay"], required: true, index: true },
    status: { type: String, enum: ["pending", "paid", "failed", "canceled"], default: "pending", index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    providerCheckoutId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      validate: {
        validator: (v) => typeof v === "string" && v.trim().length > 0,
        message: "providerCheckoutId is required",
      },
    },
    providerPaymentId: { type: String, default: "" },
    metadata: { type: Object, default: {} },
    paidAt: { type: Date, default: null },
    validUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

purchaseSchema.index({ provider: 1, providerCheckoutId: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);
