const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const adminRoutes = require("./routes/admin.routes");
const teacherRoutes = require("./routes/teacher.routes");
const batchRoutes = require("./routes/batch.routes");
const paymentsRoutes = require("./routes/payments.routes");
const paymentsWebhookRoutes = require("./routes/payments.webhook.routes");
const aiRoutes = require("./routes/ai.routes");
const projectsRoutes = require("./routes/projects.routes");
const catalogRoutes = require("./routes/catalog.routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function isOriginAllowed(origin, rules) {
  const o = normalizeOrigin(origin);
  if (!o) return true;
  if (!Array.isArray(rules) || rules.length === 0) return true;

  for (const rawRule of rules) {
    const rule = normalizeOrigin(rawRule);
    if (!rule) continue;
    if (rule === "*") return true;

    if (rule === o) return true;

    // Support wildcard domains:
    // - "*.vercel.app" (any scheme)
    // - "https://*.vercel.app" (scheme-specific)
    // - "http://*.example.com:3000" (scheme/port-specific)
    if (rule.includes("*")) {
      try {
        const r = rule.startsWith("http") ? rule : `https://${rule}`;
        const ru = new URL(r);
        const ou = new URL(o);

        const schemeOk = !rule.startsWith("http") || ru.protocol === ou.protocol;
        const portOk = !ru.port || ru.port === ou.port;
        const hostPattern = ru.hostname;

        if (schemeOk && portOk && hostPattern.startsWith("*.")) {
          const suffix = hostPattern.slice(1); // ".vercel.app"
          if (ou.hostname.endsWith(suffix)) return true;
        }
      } catch {
        // ignore malformed rules
      }
    }

    // Support regex rules: "regex:^https://.+\\.vercel\\.app$"
    if (rule.toLowerCase().startsWith("regex:")) {
      const pattern = rule.slice(6);
      try {
        const re = new RegExp(pattern);
        if (re.test(o)) return true;
      } catch {
        // ignore invalid regex
      }
    }
  }

  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = String(process.env.CORS_ORIGIN || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin, allowed)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(compression());

// Payment provider webhooks.
app.use("/api/payments/webhook", paymentsWebhookRoutes);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api", batchRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api", catalogRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
