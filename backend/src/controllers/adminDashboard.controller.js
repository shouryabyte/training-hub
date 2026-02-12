const Batch = require("../models/Batch");
const User = require("../models/User");
const Division = require("../models/Division");
const Purchase = require("../models/Purchase");
const ProgramPlan = require("../models/ProgramPlan");
const Enrollment = require("../models/Enrollment");

async function adminDashboard(_req, res) {
  const [studentsCount, teachersCount, batches, paidPurchases, totalEnrollments, paidPurchasesCount, totalCourses, activeCourses] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    User.countDocuments({ role: "TEACHER" }),
    Batch.find().lean(),
    Purchase.find({ status: "paid" }).populate("planId").populate("batchId").sort({ createdAt: -1 }).limit(25),
    Enrollment.countDocuments({}),
    Purchase.countDocuments({ status: "paid" }),
    Division.countDocuments({}),
    Division.countDocuments({ isActive: true }),
  ]);

  const batchIds = batches.map((b) => b._id);
  const byBatchAgg = await User.aggregate([
    { $match: { role: "STUDENT", batch: { $in: batchIds } } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
  ]);

  const byBatch = {};
  for (const b of batches) {
    const hit = byBatchAgg.find((x) => String(x._id) === String(b._id));
    byBatch[b.name] = hit ? hit.count : 0;
  }

  const coursesByBatchAgg = await Division.aggregate([
    { $match: { batch: { $in: batchIds } } },
    { $group: { _id: "$batch", total: { $sum: 1 }, active: { $sum: { $cond: [{ $ne: ["$isActive", false] }, 1, 0] } } } },
  ]);

  const coursesByBatch = {};
  for (const b of batches) {
    const hit = coursesByBatchAgg.find((x) => String(x._id) === String(b._id));
    coursesByBatch[b.name] = {
      total: hit ? hit.total : 0,
      active: hit ? hit.active : 0,
    };
  }

  const revenue = await Purchase.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const paidCustomers = await Purchase.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: "$userId" } },
    { $count: "count" },
  ]);

  const activeSubscribersAgg = await Purchase.aggregate([
    { $match: { status: "paid" } },
    {
      $match: {
        $or: [{ validUntil: null }, { validUntil: { $gt: new Date() } }],
      },
    },
    { $group: { _id: "$userId" } },
    { $count: "count" },
  ]);
  const activeSubscribers = activeSubscribersAgg[0]?.count || 0;

  // Latest purchase per user (paid or pending), for admin view
  const latestPurchases = await Purchase.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$userId", purchaseId: { $first: "$_id" } } },
    { $limit: 200 },
  ]);

  const latestPurchaseDocs = await Purchase.find({ _id: { $in: latestPurchases.map((p) => p.purchaseId) } })
    .populate("planId")
    .populate("batchId")
    .lean();

  const enrollCountsAgg = await Enrollment.aggregate([
    { $group: { _id: "$student", count: { $sum: 1 } } },
  ]);
  const enrollCounts = new Map(enrollCountsAgg.map((r) => [String(r._id), r.count]));

  const enrollments = await Enrollment.find({}).populate({
    path: "division",
    populate: { path: "batch" },
  }).lean();

  const enrolledCoursesByStudent = new Map();
  for (const e of enrollments) {
    const sid = String(e.student);
    const division = e.division;
    if (!division) continue;
    const list = enrolledCoursesByStudent.get(sid) || [];
    list.push({
      id: String(division._id),
      name: division.name,
      batchName: division.batch?.name || null,
      enrolledAt: e.createdAt,
    });
    enrolledCoursesByStudent.set(sid, list);
  }

  const students = await User.find({ role: "STUDENT" }).populate("batch").sort({ createdAt: -1 }).limit(200).lean();
  const studentRows = students.map((s) => {
    const purchase = latestPurchaseDocs.find((p) => String(p.userId) === String(s._id)) || null;
    const enrolled = (enrolledCoursesByStudent.get(String(s._id)) || []).sort((a, b) => {
      const ta = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
      const tb = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
      return tb - ta;
    });
    return {
      id: String(s._id),
      name: s.name,
      email: s.email,
      batch: s.batch ? { id: String(s.batch._id), name: s.batch.name } : null,
      latestPurchase: purchase
        ? {
            status: purchase.status,
            planKey: purchase.planId?.key,
            planTitle: purchase.planId?.title,
            validUntil: purchase.validUntil,
            amount: purchase.amount,
            provider: purchase.provider,
          }
        : null,
      enrollments: enrollCounts.get(String(s._id)) || 0,
      enrolledCourses: enrolled.slice(0, 6),
    };
  });

  const teachers = await User.find({ role: "TEACHER" }).sort({ createdAt: -1 }).limit(200).lean();
  const teacherIds = teachers.map((t) => t._id);
  const coursesByTeacherAgg = await Division.aggregate([
    { $match: { teacher: { $in: teacherIds } } },
    {
      $group: {
        _id: "$teacher",
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $ne: ["$isActive", false] }, 1, 0] } },
      },
    },
  ]);
  const coursesByTeacher = new Map(coursesByTeacherAgg.map((r) => [String(r._id), r]));

  const teacherRows = teachers.map((t) => {
    const hit = coursesByTeacher.get(String(t._id));
    return {
      id: String(t._id),
      name: t.name,
      email: t.email,
      coursesTotal: hit ? hit.total : 0,
      coursesActive: hit ? hit.active : 0,
      createdAt: t.createdAt,
    };
  });

  const plans = await ProgramPlan.find().populate("batch").populate("includedDivisions").sort({ createdAt: -1 }).lean();

  return res.json({
    stats: {
      students: studentsCount,
      teachers: teachersCount,
      byBatch,
      coursesTotal: totalCourses,
      coursesActive: activeCourses,
      coursesByBatch,
      revenue: revenue[0]?.total || 0,
      paidPurchases: paidPurchasesCount,
      paidCustomers: paidCustomers[0]?.count || 0,
      activeSubscribers,
      totalEnrollments,
    },
    recentPurchases: paidPurchases,
    students: studentRows,
    teachers: teacherRows,
    batches,
    plans,
  });
}

module.exports = { adminDashboard };
