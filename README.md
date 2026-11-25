# 🔍 VeriScope — Fake News & Misinformation Checker (MERN)

VeriScope lets users paste a news message, headline or link and get a **credibility score (0–100)**
with a clear explanation of *why*. Users can save, search, edit and delete their checks.
Admins can manage all users and see platform-wide stats.

**Tech stack:** MongoDB · Express · React (Vite) · Node.js · JWT · bcrypt

---

## ✨ Features

| Requirement | How VeriScope does it |
|---|---|
| Frontend + backend | React (Vite) frontend, Express REST API |
| REST API integrated with UI | Axios instance in `frontend/src/api/axios.js` |
| MongoDB | Mongoose models `User` and `Analysis` (one user → many checks) |
| Authentication | Register / login with JWT, passwords hashed with bcrypt |
| Authorization (RBAC) | Roles `user` and `admin`; `restrictTo('admin')` middleware |
| Full CRUD | Create, read, update, delete checks |
| User-owned data | Users only see/edit their own checks (admin sees all) |
| Validation | `express-validator` on server + simple checks in forms |
| Error handling | Central error middleware with proper status codes |
| Pagination, search, filter, sort | `GET /analyses?page=1&search=covid&verdict=false&sort=-score` |
| Dashboard | MongoDB aggregation → verdict breakdown & stats |
| Security | helmet, CORS, rate limiting, mongo-sanitize |
| Responsive UI | Works on mobile, tablet and desktop |

### How the analyzer works (`backend/src/services/analyzer.js`)
Every check starts at **60 points**, then:
- ➖ removes points for warning signs: clickbait words ("shocking", "miracle"), conspiracy phrases ("they don't want you to know"),
  exaggeration ("100%", "guaranteed"), pressure to share ("forward this"), ALL CAPS, lots of "!!!"
- ➕ adds points for trust signs: cited sources ("according to", "study"), quotes, careful wording ("however", "estimated")
- 🌐 checks the website: trusted publishers (+), `.gov`/`.edu` (+), satire sites, risky domains like `.xyz` (−)

Final score → verdict: **Credible** (75+), **Needs Verification** (55–74), **Misleading** (35–54), **False** (<35), or **Satire**.

---

## 📁 Folder structure

```
veriscope/
├── backend/
│   ├── server.js                 # starts server + connects DB
│   ├── src/
│   │   ├── app.js                # express app, middleware, routes
│   │   ├── config/               # db connection, constants
│   │   ├── models/               # User.js, Analysis.js
│   │   ├── controllers/          # auth, user (admin), analysis, dashboard
│   │   ├── routes/               # one file per resource, mounted at /api/v1
│   │   ├── middlewares/          # protect + restrictTo, validate, errors
│   │   ├── validators/           # express-validator rules
│   │   ├── services/analyzer.js  # the credibility scoring logic
│   │   ├── utils/                # ApiError, asyncHandler, generateToken
│   │   └── seed/seed.js          # demo data
│   └── tests/analyzer.test.js    # Jest unit tests
└── frontend/
    └── src/
        ├── api/axios.js          # axios + JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/           # AppLayout (sidebar), ProtectedRoute, ui.jsx
        ├── pages/                # Landing, Auth, Dashboard, NewCheck, Checks, CheckDetail, Profile, AdminUsers
        └── index.css             # all styles (design tokens at the top)
```

---

## 🚀 Run it locally

**Prerequisites:** Node.js 18+, MongoDB (local) or a free MongoDB Atlas cluster.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm run seed                # optional: demo users + sample checks
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api/v1
npm run dev                 # http://localhost:5173
```

**Demo logins (after `npm run seed`):**
- User: `demo@veriscope.dev` / `Demo@12345`
- Admin: `admin@veriscope.dev` / `Admin@12345`

Run tests: `cd backend && npm test`

---

## 🔌 API (base URL `/api/v1`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login → returns JWT |
| GET | `/auth/me` | User | Current user |
| PUT | `/auth/profile` | User | Update name |
| PUT | `/auth/change-password` | User | Change password |
| GET | `/analyses` | User | List my checks (`page, limit, search, verdict, category, sort`) |
| POST | `/analyses` | User | Analyse text/URL and save |
| GET | `/analyses/:id` | Owner/Admin | Check details |
| PUT | `/analyses/:id` | Owner/Admin | Edit (re-analyses if text changes) |
| DELETE | `/analyses/:id` | Owner/Admin | Delete |
| GET | `/dashboard/stats` | User | Stats for dashboard |
| POST | `/public/analyze` | Public | Landing-page demo (not saved) |
| GET | `/users` | Admin | List users (paginated, searchable) |
| PATCH | `/users/:id` | Admin | Change role / activate / deactivate |
| DELETE | `/users/:id` | Admin | Delete user and their checks |

Response format: `{ success, message, data, pagination? }` · Errors: `{ success: false, message }`

---

## ☁️ Deployment

**Database – MongoDB Atlas:** create a free cluster → copy the connection string → allow access from `0.0.0.0/0`.

**Backend – Render** (or Railway): New Web Service → root directory `backend` → build `npm install` → start `npm start`.
Add env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=https://your-frontend.vercel.app`.

**Frontend – Vercel** (or Netlify): import repo → root directory `frontend` → framework Vite.
Add env var `VITE_API_URL=https://your-backend.onrender.com/api/v1`. (`vercel.json` / `public/_redirects` handle page refreshes.)

**AWS option:** run the backend on an EC2 instance with `pm2 start server.js`, and upload `frontend/dist` (from `npm run build`) to an S3 bucket with static website hosting.

---

## 🧪 Manual test cases

| Test | Expected |
|---|---|
| Register with an existing email | 409 "Email already registered" |
| Login with wrong password | 401 "Invalid email or password" |
| Open `/dashboard` while logged out | Redirected to `/login` |
| Open another user's check by id | 403 "Not allowed" |
| Normal user calls `GET /users` | 403 "Access denied" |
| Submit empty check form | 400 "Please enter at least 10 characters" |
| Delete a check and refresh | Check is gone |

---

## 🔮 Future ideas
Google Fact Check API integration · browser extension · dark/light theme toggle · image (OCR) checks
