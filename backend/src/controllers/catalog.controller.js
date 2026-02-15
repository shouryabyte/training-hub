const Batch = require("../models/Batch");
const Division = require("../models/Division");
const ProgramPlan = require("../models/ProgramPlan");

const CATALOG_TTL_MS = Math.max(5_000, Number(process.env.PUBLIC_CATALOG_TTL_MS || 60_000));
let catalogCache = { ts: 0, data: null };

async function publicCatalog(_req, res) {
  const now = Date.now();
  if (catalogCache.data && now - catalogCache.ts < CATALOG_TTL_MS) {
    res.set("Cache-Control", `public, max-age=${Math.floor(CATALOG_TTL_MS / 1000)}, stale-while-revalidate=300`);
    res.set("Vary", "Origin");
    return res.json(catalogCache.data);
  }

  const [batches, divisions, plans] = await Promise.all([
    Batch.find().select("name description").sort({ name: 1 }).lean(),
    Division.find({ isActive: true })
      .select("name slug batch hasResumeTrack shortDescription description highlights outcomes sortOrder isActive")
      .populate({ path: "batch", select: "name description" })
      .sort({ sortOrder: 1, name: 1 })
      .lean(),
    ProgramPlan.find({ isActive: true })
      .select("key title batch includedDivisions currency amount durationLabel durationDays isActive")
      .populate({ path: "batch", select: "name" })
      .populate({ path: "includedDivisions", select: "name slug" })
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const data = { batches, divisions, plans };
  catalogCache = { ts: now, data };

  res.set("Cache-Control", `public, max-age=${Math.floor(CATALOG_TTL_MS / 1000)}, stale-while-revalidate=300`);
  res.set("Vary", "Origin");
  return res.json(data);
}

module.exports = { publicCatalog };
