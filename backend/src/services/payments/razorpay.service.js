const Razorpay = require("razorpay");

function getClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys are not set");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function createProgramOrder({ amount, currency, notes }) {
  const client = getClient();
  if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) throw new Error("Invalid amount for checkout");

  const order = await client.orders.create({
    amount: Number(amount),
    currency: String(currency || "INR"),
    receipt: `prog_${Date.now()}`,
    notes: notes || {},
  });

  return { id: order.id, amount: order.amount, currency: order.currency };
}

module.exports = { createProgramOrder };
