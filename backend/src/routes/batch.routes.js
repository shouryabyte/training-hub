const { Router } = require("express");
const { z } = require("zod");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validate");
const { createBatch, createDivision, getDivisions } = require("../controllers/batch.controller");

const r = Router();

const createBatchSchema = z.object({
  body: z.object({
    name: z.enum(["ALPHA", "DELTA"]),
    description: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const createDivisionSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    batch: z.string().min(1),
    hasResumeTrack: z.boolean().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.post("/batch", protect, adminOnly, validate(createBatchSchema), createBatch);
r.post("/division", protect, adminOnly, validate(createDivisionSchema), createDivision);
r.get("/divisions", protect, getDivisions);

module.exports = r;

