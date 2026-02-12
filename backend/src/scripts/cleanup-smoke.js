/* eslint-disable no-console */
const mongoose = require("mongoose");

const { loadEnv } = require("../config/env");
const { connectDb } = require("../config/db");

const User = require("../models/User");
const Division = require("../models/Division");
const Enrollment = require("../models/Enrollment");
const Purchase = require("../models/Purchase");
const RefreshToken = require("../models/RefreshToken");
const AiUsage = require("../models/AiUsage");
const ProgramPlan = require("../models/ProgramPlan");
const Project = require("../models/Project");

function hasFlag(name) {
  return process.argv.includes(name);
}

function normalizeBool(v) {
  const s = String(v || "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

async function main() {
  loadEnv();
  await connectDb();

  const execute = hasFlag("--yes") || normalizeBool(process.env.CONFIRM_SMOKE_CLEANUP);
  console.log(execute ? "SMOKE CLEANUP: EXECUTE" : "SMOKE CLEANUP: DRY RUN");

  const testUserQuery = {
    email: { $regex: /@example\.com$/i },
  };

  const smokeDivisionQuery = {
    $or: [{ slug: { $regex: /^smoke-course-/i } }, { name: { $regex: /^SmokeCourse/i } }],
  };

  const smokePlanQuery = {
    $or: [{ key: { $regex: /^smoke-/i } }, { title: { $regex: /smoke plan/i } }],
  };

  const smokeProjectQuery = {
    $or: [{ title: { $regex: /^Smoke Project/i } }, { url: { $regex: /example\.com\/smoke-project/i } }],
  };

  const [testUsers, smokeDivisions, smokePlans, smokeProjects] = await Promise.all([
    User.find(testUserQuery).select("_id email role name").lean(),
    Division.find(smokeDivisionQuery).select("_id name slug").lean(),
    ProgramPlan.find(smokePlanQuery).select("_id key title").lean(),
    Project.find(smokeProjectQuery).select("_id title url").lean(),
  ]);

  const testUserIds = testUsers.map((u) => u._id);
  const smokeDivisionIds = smokeDivisions.map((d) => d._id);
  const smokePlanIds = smokePlans.map((p) => p._id);

  const counts = {
    users: testUsers.length,
    divisions: smokeDivisions.length,
    plans: smokePlans.length,
    projects: smokeProjects.length,
  };

  console.log("Matches:", counts);

  if (!execute) {
    console.log("Run with `node src/scripts/cleanup-smoke.js --yes` to delete these records.");
    await mongoose.disconnect();
    return;
  }

  // Delete children first.
  const enrollmentFilter =
    testUserIds.length || smokeDivisionIds.length
      ? {
          $or: [
            ...(testUserIds.length ? [{ student: { $in: testUserIds } }] : []),
            ...(smokeDivisionIds.length ? [{ division: { $in: smokeDivisionIds } }] : []),
          ],
        }
      : null;

  const purchaseFilter =
    testUserIds.length || smokePlanIds.length
      ? {
          $or: [
            ...(testUserIds.length ? [{ userId: { $in: testUserIds } }] : []),
            ...(smokePlanIds.length ? [{ planId: { $in: smokePlanIds } }] : []),
          ],
        }
      : null;

  const [enrollmentsDel, purchasesDel, refreshTokensDel, aiUsageDel] = await Promise.all([
    enrollmentFilter ? Enrollment.deleteMany(enrollmentFilter) : Promise.resolve({ deletedCount: 0 }),
    purchaseFilter ? Purchase.deleteMany(purchaseFilter) : Promise.resolve({ deletedCount: 0 }),
    testUserIds.length ? RefreshToken.deleteMany({ user: { $in: testUserIds } }) : Promise.resolve({ deletedCount: 0 }),
    testUserIds.length ? AiUsage.deleteMany({ userId: { $in: testUserIds } }) : Promise.resolve({ deletedCount: 0 }),
  ]);

  const [divisionsDel, plansDel, projectsDel, usersDel] = await Promise.all([
    smokeDivisionIds.length ? Division.deleteMany({ _id: { $in: smokeDivisionIds } }) : Promise.resolve({ deletedCount: 0 }),
    smokePlanIds.length ? ProgramPlan.deleteMany({ _id: { $in: smokePlanIds } }) : Promise.resolve({ deletedCount: 0 }),
    smokeProjects.length
      ? Project.deleteMany({ _id: { $in: smokeProjects.map((p) => p._id) } })
      : Promise.resolve({ deletedCount: 0 }),
    testUserIds.length ? User.deleteMany({ _id: { $in: testUserIds } }) : Promise.resolve({ deletedCount: 0 }),
  ]);

  console.log("Deleted:");
  console.log("- enrollments:", enrollmentsDel.deletedCount || 0);
  console.log("- purchases:", purchasesDel.deletedCount || 0);
  console.log("- refreshTokens:", refreshTokensDel.deletedCount || 0);
  console.log("- aiUsage:", aiUsageDel.deletedCount || 0);
  console.log("- divisions:", divisionsDel.deletedCount || 0);
  console.log("- plans:", plansDel.deletedCount || 0);
  console.log("- projects:", projectsDel.deletedCount || 0);
  console.log("- users:", usersDel.deletedCount || 0);

  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("cleanup-smoke failed:", err);
  process.exit(1);
});
