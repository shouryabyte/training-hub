const { Router } = require("express");
const { z } = require("zod");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validate");
const { listProjects, createProject, updateProject, deleteProject } = require("../controllers/projects.controller");

const r = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    partner: z.string().optional(),
    url: z.string().url().optional(),
    status: z.enum(["LIVE", "UPCOMING"]).optional(),
    cohortBadge: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    isFeatured: z.boolean().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const updateSchema = z.object({
  body: z
    .object({
      title: z.string().min(2).optional(),
      description: z.string().min(10).optional(),
      partner: z.string().optional(),
      url: z.string().url().optional(),
      status: z.enum(["LIVE", "UPCOMING"]).optional(),
      cohortBadge: z.string().optional(),
      techStack: z.array(z.string()).optional(),
      difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
      startsAt: z.string().datetime().nullable().optional(),
      endsAt: z.string().datetime().nullable().optional(),
      isFeatured: z.boolean().optional(),
    })
    .refine((v) => Object.keys(v || {}).length > 0, { message: "At least one field is required" }),
  query: z.any().optional(),
  params: z.object({ id: z.string().min(1) }),
  headers: z.any().optional(),
});

r.get("/", listProjects);
r.post(
  "/",
  protect,
  adminOnly,
  validate(createSchema),
  async (req, res, next) => {
    try {
      const body = { ...req.validated.body };
      if (body.startsAt) body.startsAt = new Date(body.startsAt);
      if (body.endsAt) body.endsAt = new Date(body.endsAt);
      req.validated.body = body;
      return next();
    } catch (err) {
      return next(err);
    }
  },
  createProject
);

r.patch(
  "/:id",
  protect,
  adminOnly,
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const body = { ...req.validated.body };
      if (body.startsAt === null) body.startsAt = null;
      if (body.endsAt === null) body.endsAt = null;
      if (typeof body.startsAt === "string") body.startsAt = new Date(body.startsAt);
      if (typeof body.endsAt === "string") body.endsAt = new Date(body.endsAt);
      req.validated.body = body;
      return next();
    } catch (err) {
      return next(err);
    }
  },
  updateProject
);

r.delete("/:id", protect, adminOnly, deleteProject);

module.exports = r;
