const mongoose = require("mongoose");

const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    day: { type: String, required: true, index: true }, // YYYY-MM-DD (UTC)
    feature: { type: String, required: true, index: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

aiUsageSchema.index({ userId: 1, day: 1, feature: 1 }, { unique: true });

module.exports = mongoose.model("AiUsage", aiUsageSchema);

