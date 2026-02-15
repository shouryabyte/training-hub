const Batch = require("../models/Batch");
const Division = require("../models/Division");
const { slugify } = require("../utils/slug");

const COURSES_TTL_MS = Math.max(5_000, Number(process.env.PUBLIC_COURSES_TTL_MS || 60_000));
const coursesCache = new Map(); // key -> { ts, data }

function getCacheKey(batchName) {
  return batchName ? `batch:${batchName}` : "all";
}

async function listCourses(req, res) {
  const batchName = String(req.query.batch || "").toUpperCase();
  const normalizedBatch = batchName === "ALPHA" || batchName === "DELTA" ? batchName : "";
  const cacheKey = getCacheKey(normalizedBatch);

  const hit = coursesCache.get(cacheKey);
  const now = Date.now();
  if (hit && now - hit.ts < COURSES_TTL_MS) {
    res.set("Cache-Control", `public, max-age=${Math.floor(COURSES_TTL_MS / 1000)}, stale-while-revalidate=300`);
    res.set("Vary", "Origin");
    return res.json(hit.data);
  }

  const q = { isActive: true };
  if (batchName === "ALPHA" || batchName === "DELTA") {
    const batch = await Batch.findOne({ name: batchName }).select("_id").lean();
    if (batch) q.batch = batch._id;
  }

  const courses = await Division.find(q)
    .select("name slug batch hasResumeTrack shortDescription description highlights outcomes sortOrder isActive")
    .populate({ path: "batch", select: "name description" })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  coursesCache.set(cacheKey, { ts: now, data: courses });
  res.set("Cache-Control", `public, max-age=${Math.floor(COURSES_TTL_MS / 1000)}, stale-while-revalidate=300`);
  res.set("Vary", "Origin");
  return res.json(courses);
}

async function listCoursesAdmin(req, res) {
  const batchId = String(req.query.batchId || "");
  const q = {};
  if (batchId) q.batch = batchId;
  const courses = await Division.find(q)
    .select("name slug batch hasResumeTrack shortDescription description highlights outcomes sortOrder isActive teacher")
    .populate({ path: "batch", select: "name description" })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return res.json(courses);
}

async function listCoursesTeacher(req, res) {
  const batchId = String(req.query.batchId || "");
  // Include legacy/unassigned courses so teachers can take over existing catalog items
  // that were created before ownership was introduced.
  const q = { $or: [{ teacher: req.user.id }, { teacher: null }] };
  if (batchId) q.batch = batchId;
  const courses = await Division.find(q)
    .select("name slug batch hasResumeTrack shortDescription description highlights outcomes sortOrder isActive teacher")
    .populate({ path: "batch", select: "name description" })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return res.json(courses);
}

function normalizeCourseBody(body) {
  const name = String(body.name || "").trim();
  const slug = String(body.slug || slugify(name)).trim() || slugify(name);
  return {
    name,
    slug,
    batch: body.batch,
    hasResumeTrack: Boolean(body.hasResumeTrack),
    shortDescription: String(body.shortDescription || "").trim(),
    description: String(body.description || "").trim(),
    highlights: Array.isArray(body.highlights) ? body.highlights.map((s) => String(s)).filter(Boolean) : [],
    outcomes: Array.isArray(body.outcomes) ? body.outcomes.map((s) => String(s)).filter(Boolean) : [],
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    isActive: body.isActive !== false,
  };
}

async function createCourse(req, res) {
  const payload = normalizeCourseBody(req.validated.body);
  const batch = await Batch.findById(payload.batch).select("_id");
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  try {
    const created = await Division.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Course already exists" });
    throw err;
  }
}

async function createCourseTeacher(req, res) {
  const payload = normalizeCourseBody(req.validated.body);
  payload.teacher = req.user.id;

  const batch = await Batch.findById(payload.batch).select("_id");
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  try {
    const created = await Division.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Course already exists" });
    throw err;
  }
}

async function updateCourse(req, res) {
  const id = req.params.id;
  const payload = normalizeCourseBody({ ...req.validated.body, batch: req.validated.body.batch });
  const batch = await Batch.findById(payload.batch).select("_id");
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  try {
    const updated = await Division.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    return res.json(updated);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Course already exists" });
    throw err;
  }
}

async function updateCourseTeacher(req, res) {
  const id = req.params.id;

  const existing = await Division.findById(id).select("teacher");
  if (!existing) return res.status(404).json({ message: "Course not found" });
  if (existing.teacher && String(existing.teacher) !== String(req.user.id)) {
    return res.status(403).json({ message: "You can only manage your own courses" });
  }

  const payload = normalizeCourseBody({ ...req.validated.body, batch: req.validated.body.batch });
  payload.teacher = existing.teacher || req.user.id;

  const batch = await Batch.findById(payload.batch).select("_id");
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  try {
    const updated = await Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    return res.json(updated);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Course already exists" });
    throw err;
  }
}

async function deleteCourse(req, res) {
  const id = req.params.id;
  const Enrollment = require("../models/Enrollment");
  const inUse = await Enrollment.countDocuments({ division: id });
  if (inUse > 0) {
    const updated = await Division.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    return res.json({ success: true, disabled: true });
  }
  const deleted = await Division.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Course not found" });
  return res.json({ success: true });
}

async function deleteCourseTeacher(req, res) {
  const id = req.params.id;

  const existing = await Division.findById(id).select("teacher isActive");
  if (!existing) return res.status(404).json({ message: "Course not found" });
  if (existing.teacher && String(existing.teacher) !== String(req.user.id)) {
    return res.status(403).json({ message: "You can only manage your own courses" });
  }

  // Claim legacy/unassigned courses on first teacher action.
  if (!existing.teacher) {
    await Division.updateOne({ _id: id, teacher: null }, { $set: { teacher: req.user.id } });
    existing.teacher = req.user.id;
  }

  const Enrollment = require("../models/Enrollment");
  const inUse = await Enrollment.countDocuments({ division: id });
  if (inUse > 0) {
    const updated = await Division.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    return res.json({ success: true, disabled: true });
  }
  const deleted = await Division.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Course not found" });
  return res.json({ success: true });
}

module.exports = {
  listCourses,
  listCoursesAdmin,
  listCoursesTeacher,
  createCourse,
  createCourseTeacher,
  updateCourse,
  updateCourseTeacher,
  deleteCourse,
  deleteCourseTeacher,
};
