const mongoose = require("mongoose");

async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");

  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== "production",
  });

  // Ensure critical indexes exist even in production where autoIndex is disabled.
  // This is required for uniqueness constraints (e.g. enrollments, emails).
  await ensureIndexes();

  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}

async function ensureIndexes() {
  if (String(process.env.SYNC_INDEXES || "").toLowerCase() === "false") return;

  // Require models to ensure they are registered before syncing indexes.
  const User = require("../models/User");
  const Batch = require("../models/Batch");
  const Division = require("../models/Division");
  const Enrollment = require("../models/Enrollment");
  const RefreshToken = require("../models/RefreshToken");
  const Project = require("../models/Project");
  const AiUsage = require("../models/AiUsage");
  const ProgramPlan = require("../models/ProgramPlan");
  const Purchase = require("../models/Purchase");

  try {
    await backfillDivisionSlugs({ Division });
    await dedupeBatches({ Batch, Division, User });
    await dedupeEnrollments({ Enrollment });
    await cleanupPurchases({ Purchase });

    await Promise.all([
      User.syncIndexes(),
      Batch.syncIndexes(),
      Division.syncIndexes(),
      Enrollment.syncIndexes(),
      RefreshToken.syncIndexes(),
      Project.syncIndexes(),
      AiUsage.syncIndexes(),
      ProgramPlan.syncIndexes(),
      Purchase.syncIndexes(),
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Index sync failed:", err);
    throw err;
  }
}

async function backfillDivisionSlugs({ Division }) {
  const { slugify } = require("../utils/slug");
  const docs = await Division.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
  }).select("_id name slug");

  for (const d of docs) {
    const slug = slugify(d.name);
    // eslint-disable-next-line no-await-in-loop
    await Division.updateOne({ _id: d._id }, { $set: { slug } });
  }
}

async function cleanupPurchases({ Purchase }) {
  // Avoid unique-index failures for legacy/stub documents that might not have a provider checkout id.
  await Purchase.deleteMany({
    $or: [{ providerCheckoutId: { $exists: false } }, { providerCheckoutId: null }, { providerCheckoutId: "" }],
  });
}

async function dedupeBatches({ Batch, Division, User }) {
  const dups = await Batch.aggregate([
    { $group: { _id: "$name", ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
  ]);

  for (const d of dups) {
    const docs = await Batch.find({ _id: { $in: d.ids } }).sort({ createdAt: 1, _id: 1 });
    const keep = docs[0]?._id;
    const remove = docs.slice(1).map((x) => x._id);
    if (!keep || remove.length === 0) continue;

    await Promise.all([
      Division.updateMany({ batch: { $in: remove } }, { $set: { batch: keep } }),
      User.updateMany({ batch: { $in: remove } }, { $set: { batch: keep } }),
    ]);
    await Batch.deleteMany({ _id: { $in: remove } });
  }
}

async function dedupeEnrollments({ Enrollment }) {
  const dups = await Enrollment.aggregate([
    { $group: { _id: { student: "$student", division: "$division" }, ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const d of dups) {
    const docs = await Enrollment.find({ _id: { $in: d.ids } }).sort({ createdAt: 1, _id: 1 });
    const keep = docs[0]?._id;
    const remove = docs.slice(1).map((x) => x._id);
    if (!keep || remove.length === 0) continue;
    await Enrollment.deleteMany({ _id: { $in: remove } });
  }
}

module.exports = { connectDb };
