const mongoose = require("mongoose");

const aiResponseCacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true, trim: true },
    feature: { type: String, required: true, index: true, trim: true },
    provider: { type: String, default: "", trim: true },
    model: { type: String, default: "", trim: true },
    response: { type: Object, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

aiResponseCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AiResponseCache", aiResponseCacheSchema);
