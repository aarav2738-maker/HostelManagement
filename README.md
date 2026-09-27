# HostelCare

A hostel management web app with a clearly separated **frontend** and **backend**.
Students can sign up with their room details, raise complaints (with optional photo
attachments), check the mess menu and submit feedback. Admins get a dashboard to review
complaints, update their status, manage the mess menu and handle room allotment requests.

## Project structure

```
HostelManagement/
├── frontend/     React + Vite + Tailwind app (UI only — talks to the API)
├── backend/      Express + Supabase PostgreSQL + JWT REST API
└── supabase/     PostgreSQL migrations for the backend schema
```

- **frontend/** — React 18, TypeScript, Vite, Tailwind + shadcn/ui, React Query.
  All data is fetched from the backend API (`frontend/src/lib/api.ts`); auth state is a
  JWT persisted in localStorage (`frontend/src/hooks/useAuth.ts`).
- **backend/** — Node + Express + TypeScript. App data is stored in Supabase PostgreSQL.
   Passwords are bcrypt-hashed and every protected route verifies a JWT.

## Getting started

1. Install dependencies (workspaces — installs both folders):

   ```sh
   npm install
   ```

2. Start backend + frontend together:

   ```sh
   npm run dev
   ```

   - Frontend: http://localhost:8080 (Vite proxies `/api` to the backend)
   - Backend API: http://localhost:4000

3. Sign in with the seeded admin account, or create a student account from the signup page:

   | Role    | Email             | Password  |
   | ------- | ----------------- | --------- |
   | Admin   | admin@hostel.com  | admin123  |

## API overview (backend)

| Method | Route                        | Access   | Purpose                              |
| ------ | ---------------------------- | -------- | ------------------------------------ |
| POST   | `/api/auth/signup`           | public   | Create student account               |
| POST   | `/api/auth/login`            | public   | Sign in, returns JWT                 |
| GET    | `/api/auth/me`               | any user | Current user + role                  |
| PATCH  | `/api/auth/profile`          | any user | Update own profile                   |
| GET    | `/api/complaints`            | any user | Admin: all · Student: own            |
| POST   | `/api/complaints`            | any user | Create complaint                     |
| PATCH  | `/api/complaints/:id`        | role-    | Admin: status/notes · Student: edit own pending |
| GET    | `/api/feedback`              | any user | Feedback list                        |
| POST   | `/api/feedback`              | any user | Rate a resolved complaint            |
| GET    | `/api/mess-menu`             | public   | Weekly menu                          |
| PUT    | `/api/mess-menu`             | admin    | Edit a meal                          |
| GET    | `/api/room-requests`         | any user | Admin: all · Student: own            |
| POST   | `/api/room-requests`         | student  | Request room change                  |
| PATCH  | `/api/room-requests/:id/decide` | admin | Approve/reject (approval moves the student) |
| GET    | `/api/health`                | public   | Health check                         |

## Backend configuration

Copy `backend/.env.example` to `backend/.env` and adjust as needed:

| Variable        | Default             | Purpose                          |
| --------------- | ------------------- | -------------------------------- |
| `PORT`          | `4000`              | API port                         |
| `JWT_SECRET`    | dev fallback        | Set a strong random value in prod|
| `ADMIN_EMAIL`   | `admin@hostel.com`  | Seeded admin account             |
| `ADMIN_PASSWORD`| `admin123`          | Seeded admin password            |
| `DATABASE_URL`  | required            | Supabase PostgreSQL session-pooler URI |

## Deployment

### Backend on Render

1. In the Supabase SQL Editor, run `supabase/migrations/20260927000000_hostel_backend.sql` to create the app's PostgreSQL tables.
2. In Supabase **Connect**, copy the **Session pooler** connection string. In Render, create a Blueprint from this repository using `render.yaml` and set that string as the secret `DATABASE_URL`.
3. Set `ADMIN_PASSWORD` to a strong password when Render prompts for it. The Blueprint generates `JWT_SECRET`; the free Render instance can connect to the Supabase database without a Render disk.
4. Deploy and copy the service URL, for example `https://hostelcare-api.onrender.com`.

The backend connects to Supabase over PostgreSQL. Keep `DATABASE_URL` only in Render/backend secrets; never put it in the Vercel frontend environment or commit it to the repository. The browser-safe Supabase anon key is not used for this backend connection.

### Frontend on Vercel

1. Import the repository into Vercel and set **Root Directory** to `frontend`.
2. Use the Vite defaults: build command `npm run build` and output directory `dist`. `frontend/vercel.json` handles client-side route fallback.
3. Add this Environment Variable for Production (and Preview if needed):

   ```text
   VITE_API_URL=https://<your-render-service>.onrender.com/api
   ```

   Replace the API URL with the actual Render service URL. Vite variables are public in the built frontend; never put passwords or other secrets in them.
4. Redeploy after adding or changing environment variables, then check `https://<your-render-service>.onrender.com/api/health` and sign in through the Vercel site.

The backend currently permits cross-origin requests, so no Vercel origin setting is required.

## Scripts

| Command                  | What it does                          |
| ------------------------ | ------------------------------------- |
| `npm run dev`            | Start backend + frontend together     |
| `npm run dev:backend`    | Start only the API server             |
| `npm run dev:frontend`   | Start only the web app                |
| `npm run build`          | Production build of the frontend      |
| `npm run typecheck`      | Typecheck the backend                 |
| `npm run lint`           | Lint the frontend                     |
| `npm run test`           | Run the frontend test suite (41 tests)|
