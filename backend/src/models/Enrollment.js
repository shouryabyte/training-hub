const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    division: { type: mongoose.Schema.Types.ObjectId, ref: "Division", required: true },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, division: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);

