const { Router } = require("express");
const { z } = require("zod");
const { protect } = require("../middleware/authMiddleware");
const { studentOnly } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validate");
const { enrollDivision, myEnrollments } = require("../controllers/student.controller");

const r = Router();

const enrollSchema = z.object({
  body: z.object({
    divisionId: z.string().min(1),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.post("/enroll", protect, studentOnly, validate(enrollSchema), enrollDivision);
r.get("/enrollments", protect, studentOnly, myEnrollments);

module.exports = r;
