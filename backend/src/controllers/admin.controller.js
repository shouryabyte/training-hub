const User = require("../models/User");
const Batch = require("../models/Batch");

async function getAllStudents(_req, res) {
  const students = await User.find({ role: "STUDENT" }).populate("batch");
  return res.json(students);
}

async function assignBatch(req, res) {
  const { userId, batchId } = req.validated.body;

  const batch = await Batch.findById(batchId);
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  const updated = await User.findByIdAndUpdate(userId, { batch: batchId }, { new: true }).populate("batch");
  if (!updated) return res.status(404).json({ message: "User not found" });
  return res.json(updated);
}

module.exports = { getAllStudents, assignBatch };

