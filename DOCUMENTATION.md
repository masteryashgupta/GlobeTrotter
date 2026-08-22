# GlobeTrotter - Comprehensive Documentation

## 🚀 Live Production Deployments
- **Frontend (GitHub Pages):** [https://masteryashgupta.github.io/GlobeTrotter](https://masteryashgupta.github.io/GlobeTrotter)
- **Backend API (Railway):** [https://globetrotter-production-4300.up.railway.app/api](https://globetrotter-production-4300.up.railway.app/api)

---

## ✨ Features

### 1. Smart Itinerary Builder
- Create complex multi-stop trips with specific arrival and departure dates.
- Add activities to individual stops.
- Manage custom cities and unlisted activities manually.

### 2. Multi-Currency Support
- Switch between multiple global currencies (USD, INR, EUR, GBP, JPY, AUD) seamlessly.
- Automatically handles front-end conversions and formatting while keeping data normalized in the backend.

### 3. Community Feed
- A global feed where travelers can share their experiences.
- Upload trip photos securely.
- "Like" posts from other users (with real-time optimistic UI updates).
- Categorize stories (Foodie, Adventure, Sightseeing, etc.).

### 4. Search & Discovery
- Explore pre-seeded global cities and top tourist activities.
- Filter activities by category, duration, and maximum budget.

### 5. Budget & Expense Tracking
- Track overall trip budgets versus actual spending.
- Visualize expenses using interactive charts across multiple categories.

### 6. Collaboration & Sharing
- Mark trips as "Public" to generate a read-only link.
- Share itineraries with family and friends instantly.

### 7. User Profile Management
- Secure authentication managed by Supabase.
- Upload and manage custom avatars.
- Configure default language and currency preferences.

---

## 💻 How to Run the Project Locally

### 1. Prerequisites
- **Node.js**: v18+ (v22 recommended)
- **Git**: For cloning the repository
- **Supabase**: You will need a Supabase project (for the database, auth, and storage).

### 2. Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Database Setup (Supabase)
Ensure your Supabase database has all the necessary tables and RLS policies.
You can run the SQL files located in `supabase/migrations/` sequentially against your Supabase SQL editor:
- `0001_initial_schema.sql`
- `0002_create_profile_trigger.sql`
- `0003_storage_trip_covers.sql`
- `0004_trip_collaboration_sharing.sql`
- `0005_profile_currency.sql`
- `0006_community_posts.sql`

Make sure the following Supabase Storage buckets are created and set to **Public**:
- `avatars`
- `trip-covers`

### 4. Installation

Open a terminal at the root of the project and install dependencies for both the frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 5. Running the Application

You need two terminal windows to run both the frontend and the backend simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*The backend API will start at `http://localhost:5000`.*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*The frontend application will start at `http://localhost:5173`.*

Open `http://localhost:5173` in your browser. You can now sign up, log in, and use GlobeTrotter locally!
