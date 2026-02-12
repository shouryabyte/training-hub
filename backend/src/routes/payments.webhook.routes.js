const { Router } = require("express");
const express = require("express");

const { razorpayWebhook } = require("../controllers/payments.controller");

const r = Router();

r.post("/razorpay", express.json({ limit: "1mb" }), razorpayWebhook);

module.exports = r;
