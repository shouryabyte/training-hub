# Backend (Express + MongoDB)

This backend powers the Nexchakra frontend in `../frontend/`:
- Auth (JWT + refresh cookie)
- Public catalog (batches, courses, plans)
- Student enrollments
- Admin dashboard + course CRUD
- Payments (Razorpay only)
- AI Labs (Groq only)

## Setup

1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - Copy `.env.example` to `.env` and fill values.
3. Start the server:
   - `npm run dev`

Health check:
- `GET /health`

Smoke test (starts app on an ephemeral port and validates key endpoints):
- `npm run smoke`

## Environment variables

- `PORT`: server port
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: long random string
- `JWT_EXPIRES_IN`: e.g. `7d`
- `REFRESH_TOKEN_EXPIRES_IN`: e.g. `30d`
- `CORS_ORIGIN`: comma-separated allowlist, e.g. `https://your-frontend.com,http://localhost:3000`
- `ADMIN_INVITE_KEY`: optional secret to allow creating `ADMIN` accounts during registration
- `COOKIE_SECURE`: optional `true|false` override for refresh cookie `secure` flag
- `SYNC_INDEXES`: `true|false` (default `true`) to sync/dedupe critical DB indexes on startup

AI (Groq only):
- `GROQ_API_KEY`: required for AI Labs
- `GROQ_MODEL`: optional

Payments (Razorpay only):
- `PAYMENT_PROVIDER`: should be `razorpay`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: required
- `RAZORPAY_WEBHOOK_SECRET`: optional (webhook signature validation)
- `APP_URL`: frontend base URL for post-payment redirects

## API (high-level)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Public
- `GET /api/public/catalog`
- `GET /api/public/courses?batch=ALPHA|DELTA`
- `GET /api/projects`

### Student (protected)
Header: `Authorization: Bearer <token>`
- `POST /api/student/enroll`
- `GET /api/student/enrollments`

### Admin (protected + ADMIN role)
Header: `Authorization: Bearer <token>`
- `GET /api/admin/dashboard`
- `GET /api/admin/students`
- `POST /api/admin/assign-batch`
- `GET /api/admin/courses`
- `POST /api/admin/courses`
- `PATCH /api/admin/courses/:id`
- `DELETE /api/admin/courses/:id`

### Payments (protected)
Header: `Authorization: Bearer <token>`
- `POST /api/payments/checkout` (creates Razorpay order)
- `POST /api/payments/razorpay/confirm` (verifies signature and fulfills purchase)

Webhook:
- `POST /api/payments/webhook/razorpay`

## Deployment (Render / Railway)

Common settings:
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add env vars from `.env.example`

