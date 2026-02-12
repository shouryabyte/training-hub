const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Purchase = require("../models/Purchase");
const { hashPassword } = require("../utils/password");

function sanitizeUser(u) {
  if (!u) return null;
  const obj = typeof u.toObject === "function" ? u.toObject() : u;
  // eslint-disable-next-line no-unused-vars
  const { password, __v, ...rest } = obj;
  return rest;
}

async function listUsers(req, res) {
  const role = String(req.query.role || "").toUpperCase();
  const q = {};
  if (role === "TEACHER" || role === "STUDENT") q.role = role;
  else q.role = { $in: ["TEACHER", "STUDENT"] };

  const users = await User.find(q).select("-password").populate("batch").sort({ createdAt: -1 }).lean();
  return res.json(users);
}

async function createUser(req, res) {
  const { name, email, password, role, batch } = req.validated.body;

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() }).select("_id");
  if (existing) return res.status(400).json({ message: "Email already registered" });

  const hashed = await hashPassword(password);
  const created = await User.create({
    name,
    email,
    password: hashed,
    role,
    batch: role === "STUDENT" && batch ? batch : undefined,
  });

  await created.populate("batch");
  return res.status(201).json(sanitizeUser(created));
}

async function updateUser(req, res) {
  const id = req.params.id;
  const body = req.validated.body || {};

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot modify admin accounts" });

  if (body.role && body.role !== "TEACHER" && body.role !== "STUDENT") {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (typeof body.name === "string" && body.name.trim()) user.name = body.name.trim();

  const nextRole = typeof body.role === "string" ? body.role : user.role;
  if (typeof body.role === "string") user.role = body.role;

  if (Object.prototype.hasOwnProperty.call(body, "batch")) {
    user.batch = nextRole === "STUDENT" ? (body.batch || null) : null;
  } else if (typeof body.role === "string" && nextRole !== "STUDENT") {
    user.batch = null;
  }

  if (typeof body.password === "string" && body.password.trim()) {
    user.password = await hashPassword(body.password);
  }

  await user.save();
  await user.populate("batch");
  return res.json(sanitizeUser(user));
}

async function deleteUser(req, res) {
  const id = req.params.id;
  const user = await User.findById(id).select("role");
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot delete admin accounts" });

  // Safety: avoid orphaning purchases/enrollments for students.
  if (user.role === "STUDENT") {
    const [hasEnrollments, hasPurchases] = await Promise.all([
      Enrollment.exists({ student: id }),
      Purchase.exists({ userId: id }),
    ]);
    if (hasEnrollments || hasPurchases) {
      return res.status(409).json({ message: "Cannot delete student with purchases/enrollments. Disable account instead." });
    }
  }

  await User.deleteOne({ _id: id });
  return res.json({ success: true });
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
