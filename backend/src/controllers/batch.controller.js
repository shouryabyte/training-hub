const Batch = require("../models/Batch");
const Division = require("../models/Division");

async function createBatch(req, res) {
  try {
    const created = await Batch.create(req.validated.body);
    return res.status(201).json(created);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Batch already exists" });
    throw err;
  }
}

async function createDivision(req, res) {
  try {
    const created = await Division.create(req.validated.body);
    return res.status(201).json(created);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Division already exists" });
    throw err;
  }
}

async function getDivisions(_req, res) {
  const divisions = await Division.find().populate("batch");
  return res.json(divisions);
}

module.exports = { createBatch, createDivision, getDivisions };

