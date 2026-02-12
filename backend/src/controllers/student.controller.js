const Enrollment = require("../models/Enrollment");
const Division = require("../models/Division");
const User = require("../models/User");

async function enrollDivision(req, res) {
  const { divisionId } = req.validated.body;

  const user = await User.findById(req.user.id).select("batch role");
  if (!user) return res.status(401).json({ message: "Invalid token" });
  if (!user.batch) return res.status(403).json({ message: "No active batch. Purchase a plan or contact support." });

  const division = await Division.findById(divisionId);
  if (!division) return res.status(404).json({ message: "Division not found" });

  if (String(division.batch) !== String(user.batch)) {
    return res.status(403).json({ message: "Division is not part of your active batch" });
  }

  try {
    const enrollment = await Enrollment.create({
      student: req.user.id,
      division: divisionId,
    });
    return res.status(201).json(enrollment);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Already enrolled" });
    }
    throw err;
  }
}

async function myEnrollments(req, res) {
  const enrollments = await Enrollment.find({ student: req.user.id }).populate("division");
  return res.json(enrollments);
}

module.exports = { enrollDivision, myEnrollments };
