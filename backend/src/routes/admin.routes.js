const { Router } = require("express");
const { z } = require("zod");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validate");
const { getAllStudents, assignBatch } = require("../controllers/admin.controller");
const { listUsers, createUser, updateUser, deleteUser } = require("../controllers/adminUsers.controller");
const { adminDashboard } = require("../controllers/adminDashboard.controller");
const { listCoursesAdmin } = require("../controllers/courses.controller");
const {
  listProgramPlans,
  createProgramPlan,
  updateProgramPlan,
  deleteProgramPlan,
} = require("../controllers/programPlans.controller");

const r = Router();

const assignBatchSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    batchId: z.string().min(1),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.get("/dashboard", protect, adminOnly, adminDashboard);
r.get("/students", protect, adminOnly, getAllStudents);
r.post("/assign-batch", protect, adminOnly, validate(assignBatchSchema), assignBatch);

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["TEACHER", "STUDENT"]),
    batch: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      password: z.string().min(6).optional(),
      role: z.enum(["TEACHER", "STUDENT"]).optional(),
      batch: z.string().nullable().optional(),
    })
    .default({}),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.get("/users", protect, adminOnly, listUsers);
r.post("/users", protect, adminOnly, validate(createUserSchema), createUser);
r.patch("/users/:id", protect, adminOnly, validate(updateUserSchema), updateUser);
r.delete("/users/:id", protect, adminOnly, deleteUser);

// Courses are read-only for admins (Teacher manages course CRUD).
r.get("/courses", protect, adminOnly, listCoursesAdmin);

const planSchema = z.object({
  body: z.object({
    key: z.string().min(1),
    title: z.string().min(1),
    batch: z.string().min(1),
    includedDivisions: z.array(z.string().min(1)).default([]),
    durationLabel: z.string().optional().default(""),
    durationDays: z.number().nullable().optional().default(null),
    currency: z.string().optional().default("INR"),
    amount: z.number().min(1),
    isActive: z.boolean().optional().default(true),
    metadata: z.any().optional().default({}),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.get("/plans", protect, adminOnly, listProgramPlans);
r.post("/plans", protect, adminOnly, validate(planSchema), createProgramPlan);
r.patch("/plans/:id", protect, adminOnly, validate(planSchema), updateProgramPlan);
r.delete("/plans/:id", protect, adminOnly, deleteProgramPlan);

module.exports = r;
