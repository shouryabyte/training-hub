const crypto = require("crypto");

const User = require("../models/User");
const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment");
const ProgramPlan = require("../models/ProgramPlan");
const Purchase = require("../models/Purchase");

const { createProgramOrder } = require("../services/payments/razorpay.service");

function hasRazorpay() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function assertRazorpayConfigured() {
  if (hasRazorpay()) return;
  const err = new Error("RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are missing. Configure Razorpay keys to accept payments.");
  err.statusCode = 500;
  throw err;
}

async function fulfillProgramPurchase({ userId, plan, provider, providerCheckoutId, providerPaymentId, rawMetadata }) {
  const [user, batch] = await Promise.all([User.findById(userId), Batch.findById(plan.batch)]);
  if (!user) throw new Error("User not found for fulfillment");
  if (!batch) throw new Error("Batch not found for fulfillment");

  const durationDays = Number.isFinite(Number(plan.durationDays)) ? Number(plan.durationDays) : null;
  const validUntil = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

  const purchase = await Purchase.findOneAndUpdate(
    { provider, providerCheckoutId },
    {
      $setOnInsert: {
        userId: user._id,
        planId: plan._id,
        batchId: batch._id,
        provider,
        providerCheckoutId,
        amount: plan.amount,
        currency: plan.currency,
      },
      $set: {
        status: "paid",
        providerPaymentId: providerPaymentId || "",
        paidAt: new Date(),
        validUntil,
        metadata: rawMetadata || {},
      },
    },
    { upsert: true, new: true }
  );

  // Assign active batch (simple model: latest purchase sets active batch)
  user.batch = batch._id;
  await user.save();

  // Auto-enroll included divisions
  const divIds = (plan.includedDivisions || []).map((d) => String(d));
  for (const division of divIds) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await Enrollment.create({ student: user._id, division });
    } catch (err) {
      if (!(err && err.code === 11000)) throw err;
    }
  }

  return purchase;
}

async function checkout(req, res) {
  const { planKey } = req.validated.body;

  const user = await User.findById(req.user.id).select("email role");
  if (!user) return res.status(401).json({ message: "Invalid token" });
  if (user.role !== "STUDENT") return res.status(403).json({ message: "Only student accounts can purchase plans" });

  const plan = await ProgramPlan.findOne({ key: planKey, isActive: true }).select(
    "key title batch includedDivisions currency amount"
  );
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  assertRazorpayConfigured();
  const provider = "razorpay";
  const order = await createProgramOrder({
    amount: plan.amount,
    currency: plan.currency,
    notes: { userId: String(req.user.id), planKey: plan.key },
  });

  await Purchase.create({
    userId: req.user.id,
    planId: plan._id,
    batchId: plan.batch,
    provider,
    status: "pending",
    amount: plan.amount,
    currency: plan.currency,
    providerCheckoutId: order.id,
    metadata: { planKey: plan.key },
  });

  return res.json({ provider, order, keyId: process.env.RAZORPAY_KEY_ID || "" });
}

async function confirmRazorpay(req, res) {
  const { orderId, paymentId, signature } = req.validated.body;

  const user = await User.findById(req.user.id).select("role");
  if (!user) return res.status(401).json({ message: "Invalid token" });
  if (user.role !== "STUDENT") return res.status(403).json({ message: "Only student accounts can purchase plans" });

  const purchase = await Purchase.findOne({ provider: "razorpay", providerCheckoutId: orderId });
  if (!purchase) return res.status(404).json({ message: "Purchase not found" });
  if (String(purchase.userId) !== String(req.user.id)) return res.status(403).json({ message: "Not your order" });

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return res.status(500).json({ message: "Razorpay keys not configured" });

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  if (expected !== signature) return res.status(400).json({ message: "Invalid signature" });

  const plan = await ProgramPlan.findById(purchase.planId).select(
    "key title batch includedDivisions currency amount durationDays"
  );
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  const updated = await fulfillProgramPurchase({
    userId: req.user.id,
    plan,
    provider: "razorpay",
    providerCheckoutId: orderId,
    providerPaymentId: paymentId,
    rawMetadata: { razorpay: { orderId, paymentId } },
  });

  return res.json({ success: true, purchase: updated });
}

async function razorpayWebhook(req, res) {
  // Optional: validate if secret configured
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  if (secret && signature) {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body || {}))
      .digest("hex");
    if (digest !== signature) return res.status(400).json({ message: "Invalid signature" });
  }
  return res.json({ received: true });
}

module.exports = { checkout, confirmRazorpay, razorpayWebhook };
