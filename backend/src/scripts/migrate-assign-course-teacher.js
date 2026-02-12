const mongoose = require("mongoose");

const { loadEnv } = require("../config/env");
const { connectDb } = require("../config/db");

const User = require("../models/User");
const Division = require("../models/Division");

async function main() {
  loadEnv();
  await connectDb();

  const teacherId = String(process.env.DEFAULT_TEACHER_ID || "").trim();
  const teacherEmail = String(process.env.DEFAULT_TEACHER_EMAIL || "").trim().toLowerCase();
  if (!teacherId && !teacherEmail) {
    throw new Error("Set DEFAULT_TEACHER_ID or DEFAULT_TEACHER_EMAIL to assign existing courses to a teacher.");
  }

  const teacher = teacherId
    ? await User.findById(teacherId).select("_id role email")
    : await User.findOne({ email: teacherEmail }).select("_id role email");

  if (!teacher) throw new Error("Teacher account not found.");
  if (teacher.role !== "TEACHER") throw new Error(`User ${teacher.email} is not a TEACHER.`);

  const filter = { $or: [{ teacher: { $exists: false } }, { teacher: null }] };
  const before = await Division.countDocuments(filter);
  const r = await Division.updateMany(filter, { $set: { teacher: teacher._id } });
  const after = await Division.countDocuments(filter);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ assignedTo: String(teacher._id), matched: before, modified: r.modifiedCount, remaining: after }, null, 2));
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });

