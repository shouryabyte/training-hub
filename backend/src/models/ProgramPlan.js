const mongoose = require("mongoose");

const programPlanSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    includedDivisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division", required: true }],
    durationLabel: { type: String, default: "" },
    durationDays: { type: Number, default: null },
    currency: { type: String, default: "INR" },
    amount: { type: Number, required: true }, // smallest currency unit (e.g., INR paise)
    isActive: { type: Boolean, default: true, index: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

programPlanSchema.index({ batch: 1, key: 1 });

module.exports = mongoose.model("ProgramPlan", programPlanSchema);
