const Batch = require("../models/Batch");
const Division = require("../models/Division");
const ProgramPlan = require("../models/ProgramPlan");

async function publicCatalog(_req, res) {
  const [batches, divisions, plans] = await Promise.all([
    Batch.find().sort({ name: 1 }).lean(),
    Division.find({ isActive: true }).populate("batch").sort({ sortOrder: 1, name: 1 }).lean(),
    ProgramPlan.find({ isActive: true }).populate("batch").populate("includedDivisions").sort({ createdAt: 1 }).lean(),
  ]);

  return res.json({ batches, divisions, plans });
}

module.exports = { publicCatalog };
