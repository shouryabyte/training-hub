const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ["ALPHA", "DELTA"], required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

batchSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Batch", batchSchema);

