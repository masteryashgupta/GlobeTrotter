# GlobeTrotter

GlobeTrotter is a full-stack travel planning platform designed to allow users to explore destinations, build dynamic itineraries, manage travel budgets, and share plans seamlessly.

## Directory Structure

```text
/globetrotter
  /frontend        (Vite + React + TypeScript + Tailwind CSS)
  /backend         (Node.js + Express + TypeScript)
  /shared          (shared TypeScript types + Zod validation schemas)
  /supabase        (Supabase CLI project: migrations/, seed.sql)
  README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start at `http://localhost:5173`.

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend API server will start at `http://localhost:5000`. You can verify it by navigating to `http://localhost:5000/api/health`.

## Environment Variables

Copy `.env.example` to `.env` in both `/frontend` and `/backend` directories and configure your environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT`

## Database Setup & Local Docker / Cloud Seeding

### 1. Local Supabase Docker Stack (Offline Development)
To run a complete local Postgres + Auth + Storage stack in Docker for offline development:
```bash
npx supabase start
```

To stop the local Supabase stack:
```bash
npx supabase stop
```

### 2. Database Seeding (`cities` & `activities`)
Master data (56 cities, 224 activities) is seeded directly into Postgres tables. The seed is **idempotent** (using `ON CONFLICT DO UPDATE` / `ON CONFLICT DO NOTHING`), so running it multiple times will not duplicate records.

- **Seed Local Docker Postgres:**
  ```bash
  cd backend
  npm run seed:local
  ```
  *(Alternatively: `npx supabase db reset` or `npx supabase db seed`)*

- **Seed Cloud Supabase:**
  ```bash
  cd backend
  npm run seed:cloud
  ```

## Git Workflow & Branch Strategy

This project follows a 4-branch parallel development workflow across contributors:
- `part-a/auth-dashboard`: Authentication, user profiles, and main dashboard features.
- `part-b/itinerary-search`: City search, activity discovery, and itinerary builders.
- `part-c/budget-calendar-share`: Calendar views, expense tracking, and social trip sharing.
- `part-d/settings-admin-polish`: Settings, admin controls, and UI polish.

All feature branches sync into `main` hourly with formal reviewed Pull Requests at final integration.