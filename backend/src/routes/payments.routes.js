const { Router } = require("express");
const { z } = require("zod");

const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { checkout, confirmRazorpay } = require("../controllers/payments.controller");

const r = Router();

const checkoutSchema = z.object({
  body: z.object({
    planKey: z.string().min(1),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const confirmRazorpaySchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    paymentId: z.string().min(1),
    signature: z.string().min(1),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.post("/checkout", protect, validate(checkoutSchema), checkout);
r.post("/razorpay/confirm", protect, validate(confirmRazorpaySchema), confirmRazorpay);

module.exports = r;
