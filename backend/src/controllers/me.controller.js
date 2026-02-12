const User = require("../models/User");
const Purchase = require("../models/Purchase");
const Enrollment = require("../models/Enrollment");

async function getMe(req, res) {
  const user = await User.findById(req.user.id).select("name email role batch").populate("batch");
  if (!user) return res.status(401).json({ message: "Invalid token" });

  const [purchases, enrollments] = await Promise.all([
    Purchase.find({ userId: user._id })
      .populate("planId")
      .populate("batchId")
      .sort({ createdAt: -1 }),
    Enrollment.find({ student: user._id }).populate({
      path: "division",
      populate: { path: "batch" },
    }),
  ]);

  return res.json({ user, purchases, enrollments });
}

module.exports = { getMe };

