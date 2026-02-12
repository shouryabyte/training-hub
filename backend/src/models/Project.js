const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    partner: { type: String, default: "" },
    url: { type: String, default: "", trim: true },
    status: { type: String, enum: ["LIVE", "UPCOMING"], default: "UPCOMING", index: true },
    cohortBadge: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    difficulty: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "INTERMEDIATE" },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, isFeatured: 1, createdAt: -1 });
projectSchema.index({ url: 1 });

module.exports = mongoose.model("Project", projectSchema);
