const { Router } = require("express");
const { z } = require("zod");
const { validate } = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const { register, login, logout, refresh } = require("../controllers/auth.controller");
const { getMe } = require("../controllers/me.controller");
const { requestEmailOtp, verifyEmailOtp } = require("../controllers/emailOtp.controller");
const { googleAuth } = require("../controllers/googleAuth.controller");

const r = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
    adminInviteKey: z.string().optional(),
    teacherInviteKey: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional(),
    })
    .optional()
    .default({}),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

r.post("/register", validate(registerSchema), register);
r.post("/login", validate(loginSchema), login);
r.post(
  "/google",
  validate(z.object({ body: z.object({ credential: z.string().min(10) }) })),
  googleAuth
);
r.post(
  "/otp/request",
  validate(z.object({ body: z.object({ email: z.string().email(), purpose: z.string().optional().default("verify") }) })),
  requestEmailOtp
);
r.post(
  "/otp/verify",
  validate(
    z.object({
      body: z.object({
        email: z.string().email(),
        code: z.string().min(4),
        purpose: z.string().optional().default("verify"),
      }),
    })
  ),
  verifyEmailOtp
);
r.post("/logout", logout);
r.post("/refresh", validate(refreshSchema), refresh);
r.get("/me", protect, getMe);

module.exports = r;
