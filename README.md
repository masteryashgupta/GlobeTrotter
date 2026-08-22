# GlobeTrotter — Smart Travel Planning & Itinerary Platform

GlobeTrotter is a full-stack travel planning platform designed to allow users to explore destinations, build dynamic itineraries with drag-and-drop sequencing, manage trip budgets with visual charts, and share read-only public trip links seamlessly.

---

## 🚀 Live Production Deployments

- **Frontend (Vercel):** [https://globetrotter-app.vercel.app](https://globetrotter-app.vercel.app)
- **Backend API (Railway):** [https://globetrotter-backend-production.up.railway.app/api](https://globetrotter-backend-production.up.railway.app/api)
- **Backend Health Check:** [https://globetrotter-backend-production.up.railway.app/api/health](https://globetrotter-backend-production.up.railway.app/api/health)

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React (Vite, TypeScript), Tailwind CSS, React Query (`@tanstack/react-query`), Recharts, `@dnd-kit` (drag-and-drop), React Big Calendar.
- **Backend:** Node.js, Express, TypeScript, Zod schema validation (`validateBody` middleware).
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Supabase Auth, Supabase Storage `trip-covers` bucket, Realtime subscriptions).
- **Deployment & Hosting:** Vercel (SPA Rewrites), Railway (Express container), Supabase Cloud.

---

## 📁 Directory Structure

```text
/globetrotter
  /frontend        (Vite + React + TypeScript + Tailwind CSS + vercel.json SPA rewrites)
  /backend         (Node.js + Express + TypeScript + Zod middleware)
  /shared          (Shared TypeScript types + Zod validation schemas)
  /supabase        (Supabase CLI migrations: 0001-0003 sql files, storage bucket setup)
  README.md
```

---

## ⚡ Production Deployment Configuration

### 1. Frontend (Vercel)
- **Root Directory:** `/frontend`
- **Build Command:** `npm run build` (`tsc && vite build`)
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_SUPABASE_URL`: `<your-supabase-url>`
  - `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
  - `VITE_BACKEND_URL`: `https://globetrotter-backend-production.up.railway.app`
- **SPA Rewrites (`vercel.json`):**
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### 2. Backend (Railway)
- **Root Directory:** `/backend`
- **Start Command:** `npm start` (`node dist/index.js`)
- **Environment Variables:**
  - `PORT`: `5000` (or injected by Railway `$PORT`)
  - `SUPABASE_URL`: `<your-supabase-url>`
  - `SUPABASE_SERVICE_ROLE_KEY`: `<your-supabase-service-role-key>`
  - `FRONTEND_URL`: `https://globetrotter-app.vercel.app`

### 3. Production Database Migrations & Seeding
All database migrations (`0001_initial_schema.sql`, `0002_create_profile_trigger.sql`, `0003_storage_trip_covers.sql`) and cloud master seeds (56 cities, 224 activities) are executed against Supabase Cloud:
```bash
# Apply SQL Migrations & Seed Data
cd backend
npm run seed:cloud
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Supabase CLI / Docker (optional for offline dev)

### 2. Initialize and start Supabase:
   ```bash
   npx supabase start
   ```

   > **Note:** Running `npx supabase start` will automatically run all migrations in `supabase/migrations`. This sets up your entire schema, applies RLS policies, and provisions the **`avatars`** and **`trip-covers`** storage buckets. No manual dashboard steps are required.

### 3. Installation & Running
```bash
# Install root/sub-project dependencies
cd frontend && npm install
cd ../backend && npm install

# Start Backend (http://localhost:5000)
cd backend && npm run dev

# Start Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🌿 Git Integration Strategy & Release Milestone

This project follows a 4-part modular integration lifecycle:
- `part-a/auth-dashboard`: Auth, profiles, CRUD trips, design system.
- `part-b/itinerary-search`: City & activity catalog, drag-and-drop stops, timelines.
- `part-c/budget-calendar-share`: Recharts expense breakdown, calendar, public sharing/cloning.
- `part-d/settings-admin-polish`: User settings, admin metrics, full-app responsive/validation QA audits.

**Integrated Release Tag:** `v1.0-integrated`