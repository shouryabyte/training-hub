const { Router } = require("express");
const { z } = require("zod");

const Batch = require("../models/Batch");
const { protect } = require("../middleware/authMiddleware");
const { teacherOnly } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validate");
const {
  listCoursesTeacher,
  createCourseTeacher,
  updateCourseTeacher,
  deleteCourseTeacher,
} = require("../controllers/courses.controller");

const r = Router();

const courseSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    batch: z.string().min(1),
    hasResumeTrack: z.boolean().optional().default(true),
    shortDescription: z.string().optional().default(""),
    description: z.string().optional().default(""),
    highlights: z.array(z.string()).optional().default([]),
    outcomes: z.array(z.string()).optional().default([]),
    sortOrder: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.get("/batches", protect, teacherOnly, async (_req, res) => {
  const batches = await Batch.find().sort({ name: 1 }).lean();
  return res.json(batches);
});

r.get("/courses", protect, teacherOnly, listCoursesTeacher);
r.post("/courses", protect, teacherOnly, validate(courseSchema), createCourseTeacher);
r.patch("/courses/:id", protect, teacherOnly, validate(courseSchema), updateCourseTeacher);
r.delete("/courses/:id", protect, teacherOnly, deleteCourseTeacher);

module.exports = r;

