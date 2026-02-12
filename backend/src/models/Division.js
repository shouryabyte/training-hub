const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => typeof v === "string" && v.trim().length > 0,
        message: "slug is required",
      },
    },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    hasResumeTrack: { type: Boolean, default: true },
    shortDescription: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    highlights: { type: [String], default: [] },
    outcomes: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, default: null },
  },
  { timestamps: true }
);

divisionSchema.index({ batch: 1, name: 1 }, { unique: true });
divisionSchema.index({ batch: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Division", divisionSchema);
