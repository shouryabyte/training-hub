const Batch = require("../models/Batch");
const Division = require("../models/Division");
const ProgramPlan = require("../models/ProgramPlan");
const Purchase = require("../models/Purchase");

async function listProgramPlans(_req, res) {
  const plans = await ProgramPlan.find().populate("batch").populate("includedDivisions").sort({ createdAt: -1 });
  return res.json(plans);
}

function normalizePlanBody(body) {
  const durationDays = body.durationDays === null || body.durationDays === undefined ? null : Number(body.durationDays);
  return {
    key: String(body.key || "").trim(),
    title: String(body.title || "").trim(),
    batch: body.batch,
    includedDivisions: Array.isArray(body.includedDivisions) ? body.includedDivisions : [],
    durationLabel: String(body.durationLabel || "").trim(),
    durationDays: Number.isFinite(durationDays) && durationDays > 0 ? durationDays : null,
    currency: String(body.currency || "INR").trim().toUpperCase(),
    amount: Number(body.amount),
    isActive: body.isActive !== false,
    metadata: body.metadata || {},
  };
}

async function createProgramPlan(req, res) {
  const payload = normalizePlanBody(req.validated.body);
  const batch = await Batch.findById(payload.batch).select("_id");
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  const divs = await Division.find({ _id: { $in: payload.includedDivisions }, batch: payload.batch }).select("_id");
  if (divs.length !== payload.includedDivisions.length) {
    return res.status(400).json({ message: "Some included divisions do not belong to the batch" });
  }

  try {
    const created = await ProgramPlan.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Plan key already exists" });
    throw err;
  }
}

async function updateProgramPlan(req, res) {
  const id = req.params.id;
  const payload = normalizePlanBody(req.validated.body);
  const batch = await Batch.findById(payload.batch).select("_id");
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  const divs = await Division.find({ _id: { $in: payload.includedDivisions }, batch: payload.batch }).select("_id");
  if (divs.length !== payload.includedDivisions.length) {
    return res.status(400).json({ message: "Some included divisions do not belong to the batch" });
  }

  try {
    const updated = await ProgramPlan.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Plan not found" });
    return res.json(updated);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Plan key already exists" });
    throw err;
  }
}

async function deleteProgramPlan(req, res) {
  const id = req.params.id;
  const inUse = await Purchase.countDocuments({ planId: id });
  if (inUse > 0) {
    return res.status(409).json({ message: "Plan has purchases. Disable it instead of deleting." });
  }
  const deleted = await ProgramPlan.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Plan not found" });
  return res.json({ success: true });
}

module.exports = { listProgramPlans, createProgramPlan, updateProgramPlan, deleteProgramPlan };
