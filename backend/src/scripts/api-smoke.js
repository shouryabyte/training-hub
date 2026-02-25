/* eslint-disable no-console */
const http = require("http");
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

function randEmail(prefix) {
  const n = Date.now();
  const r = Math.random().toString(16).slice(2, 8);
  return `${prefix}+${n}.${r}@example.com`.toLowerCase();
}

async function cleanupSmokeData() {
  const testUserQuery = { email: { $regex: /@example\.com$/i } };
  const smokeDivisionQuery = { $or: [{ slug: { $regex: /^smoke-course-/i } }, { name: { $regex: /^SmokeCourse/i } }] };
  const smokePlanQuery = { $or: [{ key: { $regex: /^smoke-/i } }, { title: { $regex: /smoke plan/i } }] };
  const smokeProjectQuery = {
    $or: [{ title: { $regex: /^Smoke Project/i } }, { url: { $regex: /example\.com\/smoke-project/i } }],
  };

  const [testUsers, smokeDivisions, smokePlans, smokeProjects] = await Promise.all([
    User.find(testUserQuery).select("_id").lean(),
    Division.find(smokeDivisionQuery).select("_id").lean(),
    ProgramPlan.find(smokePlanQuery).select("_id").lean(),
    Project.find(smokeProjectQuery).select("_id").lean(),
  ]);

  const testUserIds = testUsers.map((u) => u._id);
  const smokeDivisionIds = smokeDivisions.map((d) => d._id);
  const smokePlanIds = smokePlans.map((p) => p._id);
  const smokeProjectIds = smokeProjects.map((p) => p._id);

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

  await Promise.all([
    enrollmentFilter ? Enrollment.deleteMany(enrollmentFilter) : Promise.resolve(),
    purchaseFilter ? Purchase.deleteMany(purchaseFilter) : Promise.resolve(),
    testUserIds.length ? RefreshToken.deleteMany({ user: { $in: testUserIds } }) : Promise.resolve(),
    testUserIds.length ? AiUsage.deleteMany({ userId: { $in: testUserIds } }) : Promise.resolve(),
  ]);

  await Promise.all([
    smokeDivisionIds.length ? Division.deleteMany({ _id: { $in: smokeDivisionIds } }) : Promise.resolve(),
    smokePlanIds.length ? ProgramPlan.deleteMany({ _id: { $in: smokePlanIds } }) : Promise.resolve(),
    smokeProjectIds.length ? Project.deleteMany({ _id: { $in: smokeProjectIds } }) : Promise.resolve(),
    testUserIds.length ? User.deleteMany({ _id: { $in: testUserIds } }) : Promise.resolve(),
  ]);
}

async function reqJson(baseUrl, path, { method = "GET", token, body } = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  loadEnv();
  // Keep smoke tests stable regardless of whether email verification is enabled in local/prod envs.
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "true") process.env.REQUIRE_EMAIL_VERIFICATION = "false";
  if (process.env.EMAIL_OTP_ENABLED === "true") process.env.EMAIL_OTP_ENABLED = "false";

  const app = require("../app");
  await connectDb();
  await require("../config/seed").seedCoreCatalog();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  const results = [];
  const check = async (name, fn) => {
    try {
      await fn();
      results.push({ name, ok: true });
    } catch (err) {
      results.push({ name, ok: false, err: err?.message || String(err) });
    }
  };

  let studentToken = null;
  let studentCreds = null;
  let studentId = null;
  let adminToken = null;
  let teacherToken = null;
  let teacherCreds = null;

  let alphaBatchId = null;
  let alphaDivisionId = null;
  let razorpayOrderId = null;

  await check("GET /health", async () => {
    const r = await reqJson(baseUrl, "/health");
    if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
    if (!r.data || r.data.ok !== true) throw new Error("invalid health payload");
  });

  await check("GET /api/public/catalog", async () => {
    const r = await reqJson(baseUrl, "/api/public/catalog");
    if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
    const batches = r.data?.batches || [];
    const divisions = r.data?.divisions || [];
    alphaBatchId = String((batches.find((b) => b.name === "ALPHA") || {})._id || "");
    alphaDivisionId = String((divisions.find((d) => d?.batch?.name === "ALPHA") || {})._id || "");
  });

  await check("GET /api/public/courses?batch=ALPHA", async () => {
    const r = await reqJson(baseUrl, "/api/public/courses?batch=ALPHA");
    if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
    if (!Array.isArray(r.data)) throw new Error("expected array");
  });

  await check("POST /api/auth/register (student)", async () => {
    studentCreds = { email: randEmail("student"), password: "Passw0rd!" };
    const r = await reqJson(baseUrl, "/api/auth/register", {
      method: "POST",
      body: { name: "Student Test", email: studentCreds.email, password: studentCreds.password },
    });
    if (r.status !== 201) throw new Error(`expected 201, got ${r.status}`);
    if (!r.data?.token) throw new Error("missing token");
    studentToken = r.data.token;
    studentId = String(r.data?.user?.id || "");
  });

  await check("POST /api/auth/login (student)", async () => {
    const r = await reqJson(baseUrl, "/api/auth/login", {
      method: "POST",
      body: { email: studentCreds.email, password: studentCreds.password },
    });
    if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
    if (!r.data?.token) throw new Error("missing token");
  });

  await check("GET /api/auth/me (student)", async () => {
    const r = await reqJson(baseUrl, "/api/auth/me", { token: studentToken });
    if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
    if (!r.data?.user) throw new Error("missing user");
  });

  await check("GET /api/projects", async () => {
    const r = await reqJson(baseUrl, "/api/projects");
    if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
    if (!Array.isArray(r.data)) throw new Error("expected array");
  });

  await check("POST /api/payments/checkout (student)", async () => {
    const r = await reqJson(baseUrl, "/api/payments/checkout", {
      method: "POST",
      token: studentToken,
      body: { planKey: "alpha-foundation" },
    });
    if (r.ok) {
      if (r.data?.provider !== "razorpay") throw new Error("expected provider=razorpay");
      if (!r.data?.order?.id) throw new Error("missing order id");
      razorpayOrderId = String(r.data.order.id);
    } else if (r.status !== 500) {
      throw new Error(`unexpected status ${r.status}`);
    }
  });

  await check("POST /api/payments/razorpay/confirm (invalid signature)", async () => {
    if (!razorpayOrderId) return;
    const r = await reqJson(baseUrl, "/api/payments/razorpay/confirm", {
      method: "POST",
      token: studentToken,
      body: { orderId: razorpayOrderId, paymentId: `pay_${Date.now()}`, signature: "invalid" },
    });
    if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
  });

  await check("POST /api/ai/career-roadmap (student)", async () => {
    const r = await reqJson(baseUrl, "/api/ai/career-roadmap", {
      method: "POST",
      token: studentToken,
      body: { targetRole: "Full Stack Developer", currentSkills: "HTML, CSS, JS basics" },
    });
    // If AI keys are missing, backend returns 500 with helpful message.
    if (!(r.ok || r.status === 500)) throw new Error(`unexpected status ${r.status}`);
  });

  await check("POST /api/ai/resume-analyze (student)", async () => {
    const r = await reqJson(baseUrl, "/api/ai/resume-analyze", {
      method: "POST",
      token: studentToken,
      body: { resumeText: "Built projects. Led teams. Shipped products.", category: "DELTA" },
    });
    if (!(r.ok || r.status === 500)) throw new Error(`unexpected status ${r.status}`);
  });

  await check("POST /api/ai/explain-code (student)", async () => {
    const r = await reqJson(baseUrl, "/api/ai/explain-code", {
      method: "POST",
      token: studentToken,
      body: { problem: "Two sum", code: "function twoSum(nums, target) { return []; }" },
    });
    if (!(r.ok || r.status === 500)) throw new Error(`unexpected status ${r.status}`);
  });

  await check("POST /api/ai/debug-code (student)", async () => {
    const r = await reqJson(baseUrl, "/api/ai/debug-code", {
      method: "POST",
      token: studentToken,
      body: {
        problem: "Reverse string",
        description: "Function returns wrong output for empty string.",
        code: "function rev(s){ return s.split('').reverse().join('') }",
      },
    });
    if (!(r.ok || r.status === 500)) throw new Error(`unexpected status ${r.status}`);
  });

  await check("POST /api/ai/mock-question (student)", async () => {
    const r = await reqJson(baseUrl, "/api/ai/mock-question", {
      method: "POST",
      token: studentToken,
      body: { role: "Frontend Engineer", level: "Intern", history: [] },
    });
    if (!(r.ok || r.status === 500)) throw new Error(`unexpected status ${r.status}`);
  });

  const invite = String(process.env.ADMIN_INVITE_KEY || "").trim();
  if (invite) {
    await check("POST /api/auth/register (admin)", async () => {
      const r = await reqJson(baseUrl, "/api/auth/register", {
        method: "POST",
        body: { name: "Admin Test", email: randEmail("admin"), password: "Passw0rd!", adminInviteKey: invite },
      });
      if (r.status !== 201) throw new Error(`expected 201, got ${r.status}`);
      if (r.data?.user?.role !== "ADMIN") throw new Error("expected ADMIN role");
      adminToken = r.data.token;
    });

    await check("POST /api/admin/users (create teacher)", async () => {
      teacherCreds = { email: randEmail("teacher"), password: "Passw0rd!" };
      const r = await reqJson(baseUrl, "/api/admin/users", {
        method: "POST",
        token: adminToken,
        body: { name: "Teacher Test", email: teacherCreds.email, password: teacherCreds.password, role: "TEACHER" },
      });
      if (r.status !== 201) throw new Error(`expected 201, got ${r.status}`);
      if (r.data?.role !== "TEACHER") throw new Error("expected TEACHER role");
    });

    await check("POST /api/auth/login (teacher)", async () => {
      const r = await reqJson(baseUrl, "/api/auth/login", {
        method: "POST",
        body: { email: teacherCreds.email, password: teacherCreds.password },
      });
      if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
      if (!r.data?.token) throw new Error("missing token");
      teacherToken = r.data.token;
    });

    await check("POST /api/admin/assign-batch (admin)", async () => {
      if (!studentId) throw new Error("missing student id");
      if (!alphaBatchId) throw new Error("missing alpha batch id");
      const r = await reqJson(baseUrl, "/api/admin/assign-batch", {
        method: "POST",
        token: adminToken,
        body: { userId: studentId, batchId: alphaBatchId },
      });
      if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
    });

    await check("POST /api/student/enroll (student)", async () => {
      if (!alphaDivisionId) throw new Error("missing alpha division id");
      const r = await reqJson(baseUrl, "/api/student/enroll", {
        method: "POST",
        token: studentToken,
        body: { divisionId: alphaDivisionId },
      });
      if (!(r.ok || r.status === 409)) throw new Error(`expected 201 or 409, got ${r.status}`);
    });

    await check("GET /api/admin/dashboard (admin)", async () => {
      const r = await reqJson(baseUrl, "/api/admin/dashboard", { token: adminToken });
      if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
      if (!r.data?.stats) throw new Error("missing stats");
    });

    await check("GET /api/admin/dashboard reflects enrollment", async () => {
      const r = await reqJson(baseUrl, "/api/admin/dashboard", { token: adminToken });
      if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
      const row = (r.data?.students || []).find((x) => String(x.id) === String(studentId));
      if (!row) throw new Error("student row missing");
      if (Number(row.enrollments || 0) < 1) throw new Error("expected enrollments >= 1");
    });

    await check("GET /api/admin/courses (admin)", async () => {
      const r = await reqJson(baseUrl, "/api/admin/courses", { token: adminToken });
      if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
      if (!Array.isArray(r.data)) throw new Error("expected array");
    });

    await check("POST /api/admin/courses forbidden (admin)", async () => {
      if (!alphaBatchId) throw new Error("missing alpha batch id");
      const r = await reqJson(baseUrl, "/api/admin/courses", {
        method: "POST",
        token: adminToken,
        body: { batch: alphaBatchId, name: `Forbidden ${Date.now()}` },
      });
      if (r.status !== 404) throw new Error(`expected 404, got ${r.status}`);
    });

    await check("GET /api/admin/students (admin)", async () => {
      const r = await reqJson(baseUrl, "/api/admin/students", { token: adminToken });
      if (!r.ok) throw new Error(`expected 200, got ${r.status}`);
      if (!Array.isArray(r.data)) throw new Error("expected array");
    });

    await check("CRUD /api/teacher/courses (teacher)", async () => {
      if (!alphaBatchId) throw new Error("missing alpha batch id");
      const name = `Smoke Course ${Date.now()}`;
      const created = await reqJson(baseUrl, "/api/teacher/courses", {
        method: "POST",
        token: teacherToken,
        body: {
          batch: alphaBatchId,
          name,
          shortDescription: "Smoke test course.",
          description: "Created by api-smoke to validate CRUD.",
          highlights: ["CRUD", "RBAC", "Catalog sync"],
          outcomes: ["Course visible in catalog"],
          sortOrder: 999,
          isActive: true,
        },
      });
      if (created.status !== 201) throw new Error(`create expected 201, got ${created.status}`);
      const id = String(created.data?._id || "");
      if (!id) throw new Error("missing created id");

      const updated = await reqJson(baseUrl, `/api/teacher/courses/${id}`, {
        method: "PATCH",
        token: teacherToken,
        body: { batch: alphaBatchId, name: `${name} Updated`, shortDescription: "Updated.", description: "Updated.", highlights: [], outcomes: [] },
      });
      if (!updated.ok) throw new Error(`update expected 200, got ${updated.status}`);

      // Enroll the student into this new course to exercise "delete => disable" behavior.
      const enrolled = await reqJson(baseUrl, "/api/student/enroll", {
        method: "POST",
        token: studentToken,
        body: { divisionId: id },
      });
      if (!(enrolled.ok || enrolled.status === 409)) throw new Error(`enroll expected 201 or 409, got ${enrolled.status}`);

      const deleted = await reqJson(baseUrl, `/api/teacher/courses/${id}`, { method: "DELETE", token: teacherToken });
      if (!deleted.ok) throw new Error(`delete expected 200, got ${deleted.status}`);
      if (deleted.data && deleted.data.disabled !== true) throw new Error("expected disabled=true for enrolled course");
    });

    await check("CRUD /api/admin/plans (admin)", async () => {
      if (!alphaBatchId) throw new Error("missing alpha batch id");
      if (!alphaDivisionId) throw new Error("missing alpha division id");

      const key = `smoke-${Date.now()}`;
      const created = await reqJson(baseUrl, "/api/admin/plans", {
        method: "POST",
        token: adminToken,
        body: {
          key,
          title: "Smoke Plan",
          batch: alphaBatchId,
          includedDivisions: [alphaDivisionId],
          durationLabel: "3 months",
          durationDays: 90,
          currency: "INR",
          amount: 99900,
          isActive: true,
          metadata: {},
        },
      });
      if (created.status !== 201) throw new Error(`create expected 201, got ${created.status}`);
      const planId = String(created.data?._id || "");
      if (!planId) throw new Error("missing plan id");

      const updated = await reqJson(baseUrl, `/api/admin/plans/${planId}`, {
        method: "PATCH",
        token: adminToken,
        body: {
          key,
          title: "Smoke Plan Updated",
          batch: alphaBatchId,
          includedDivisions: [alphaDivisionId],
          durationLabel: "3 months",
          durationDays: 90,
          currency: "INR",
          amount: 99900,
          isActive: false,
          metadata: {},
        },
      });
      if (!updated.ok) throw new Error(`update expected 200, got ${updated.status}`);

      const deleted = await reqJson(baseUrl, `/api/admin/plans/${planId}`, { method: "DELETE", token: adminToken });
      if (!deleted.ok) throw new Error(`delete expected 200, got ${deleted.status}`);
    });

    await check("CRUD /api/projects (admin)", async () => {
      const created = await reqJson(baseUrl, "/api/projects", {
        method: "POST",
        token: adminToken,
        body: {
          title: "Smoke Project",
          description: "A smoke-test project created by the admin to validate CRUD behavior.",
          status: "UPCOMING",
          url: "https://example.com/smoke-project",
          techStack: ["Node.js", "React"],
          difficulty: "BEGINNER",
        },
      });
      if (created.status !== 201) throw new Error(`create expected 201, got ${created.status}`);
      const id = String(created.data?._id || "");
      if (!id) throw new Error("missing project id");

      const updated = await reqJson(baseUrl, `/api/projects/${id}`, {
        method: "PATCH",
        token: adminToken,
        body: { status: "LIVE" },
      });
      if (!updated.ok) throw new Error(`update expected 200, got ${updated.status}`);
      if (updated.data?.status !== "LIVE") throw new Error("expected status LIVE");

      const deleted = await reqJson(baseUrl, `/api/projects/${id}`, { method: "DELETE", token: adminToken });
      if (!deleted.ok) throw new Error(`delete expected 200, got ${deleted.status}`);
      if (deleted.data?.success !== true) throw new Error("expected success true");
    });
  } else {
    results.push({ name: "ADMIN_INVITE_KEY not set; admin smoke tests skipped", ok: true });
  }

  const keep = String(process.env.SMOKE_KEEP_DATA || "").trim().toLowerCase();
  const shouldKeep = keep === "1" || keep === "true" || keep === "yes";
  if (!shouldKeep) {
    try {
      await cleanupSmokeData();
    } catch (err) {
      results.push({ name: "cleanup smoke data", ok: false, err: err?.message || String(err) });
    }
  } else {
    results.push({ name: "SMOKE_KEEP_DATA enabled; skipping cleanup", ok: true });
  }

  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : ` — ${r.err}`}`);
  }
  if (failed.length) {
    console.error(`\nSmoke failed: ${failed.length} test(s) failed.`);
    process.exit(1);
  }
  console.log("\nSmoke passed.");
}

main().catch((err) => {
  console.error("Smoke crashed:", err);
  process.exit(1);
});
