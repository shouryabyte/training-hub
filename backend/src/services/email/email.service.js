function canSendEmail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendEmail({ to, subject, text }) {
  let delivery = String(process.env.OTP_DELIVERY || "").toLowerCase().trim();
  // If someone accidentally leaves an inline comment in .env like: OTP_DELIVERY=  # comment
  // dotenv treats it as a value. Treat comment-only values as unset.
  if (delivery.startsWith("#")) delivery = "";
  if (delivery === "log" || !canSendEmail()) {
    // eslint-disable-next-line no-console
    console.log(`[email:log] to=${to} subject=${subject}\n${text}`);
    return { delivered: "log" };
  }

  // Lazy-load nodemailer only if SMTP is configured.
  // This keeps local usage simple (log mode) without forcing SMTP.
  // eslint-disable-next-line global-require
  const nodemailer = require("nodemailer");
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });

  return { delivered: "smtp" };
}

module.exports = { sendEmail };
