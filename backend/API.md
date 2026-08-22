# GlobeTrotter Backend API Contract

This document outlines the REST API endpoints provided by the Node.js + Express backend service (`/backend`).

## Base URL
- **Local Development:** `http://localhost:5000/api`

---

## Authentication & Headers

Protected routes require a valid Supabase JWT passed in the request headers:
```http
Authorization: Bearer <supabase_access_token>
```

---

## 1. System & Health

### `GET /api/health`
- **Auth Required:** None
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-08-22T09:45:00.000Z",
    "service": "GlobeTrotter Backend API"
  }
  ```

---

## 2. Trips Endpoints (Part A - Fully Implemented)

### `POST /api/trips`
- **Auth Required:** Yes (`requireAuth`)
- **Body Validation:** `tripCreateSchema`
  ```json
  {
    "name": "Japan Autumn Discovery",
    "description": "7-day journey across Tokyo and Kyoto",
    "start_date": "2026-10-15",
    "end_date": "2026-10-22",
    "cover_photo_url": "https://images.unsplash.com/photo-1540959733332",
    "is_public": true
  }
  ```
- **Response (201 Created):** `Trip` object

### `GET /api/trips`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of `Trip` objects belonging to the authenticated user.

### `GET /api/trips/:id`
- **Auth Required:** Optional (Public if `is_public = true`, else requires owner JWT)
- **Response (200 OK):** `Trip` object with nested `stops` array containing nested `activities`.

### `PATCH /api/trips/:id`
- **Auth Required:** Yes (`requireAuth` + Owner Check)
- **Body Validation:** `tripUpdateSchema`
- **Response (200 OK):** Updated `Trip` object

### `DELETE /api/trips/:id`
- **Auth Required:** Yes (`requireAuth` + Owner Check)
- **Response (200 OK):** `{ "message": "Trip deleted successfully", "id": "<trip_id>" }`

---

## 3. Cities Endpoints (Part B - Fully Implemented)

### `GET /api/cities/search`
- **Auth Required:** None (Public)
- **Query Params:**
  - `q` or `query`: (optional) Case-insensitive search on city name (e.g. `?q=paris`)
  - `country`: (optional) Filter by country name (e.g. `?country=France`)
  - `region`: (optional) Filter by region (e.g. `?region=Europe`)
  - `limit`: (optional, default 20) Maximum number of cities to return
- **Response (200 OK):** Array of matching `City` objects sorted by `popularity DESC`.

### `GET /api/cities/popular`
- **Auth Required:** None (Public)
- **Query Params:**
  - `limit`: (optional, default 10)
- **Response (200 OK):** Top `City` objects ordered by `popularity DESC`.

### `GET /api/cities/:id`
- **Auth Required:** None (Public)
- **Response (200 OK):** Single `City` object.
- **Response (404 Not Found):** `{ "error": "City not found" }`

---

## 4. Activities Endpoints (Part B - Search Implemented)

### `GET /api/activities/search`
- **Auth Required:** None (Public)
- **Query Params:**
  - `cityId` or `city_id`: (optional) UUID or name of the city
  - `category`: (optional) One of `sightseeing`, `food`, `adventure`, `nightlife`, `culture`, `shopping`, `other`
  - `minCost` or `min_cost`: (optional) Minimum activity cost
  - `maxCost` or `max_cost`: (optional) Maximum activity cost
  - `maxDuration` or `max_duration`: (optional) Maximum duration in minutes
  - `q` or `query`: (optional) Full-text search on activity name or description
  - `limit`: (optional, default 20) Maximum results
- **Response (200 OK):** Array of `Activity` objects (with nested `cities` details).

### `GET /api/activities/:id`
- **Auth Required:** None (Public)
- **Response (200 OK):** Single `Activity` object with city details.
- **Response (404 Not Found):** `{ "error": "Activity not found" }`

### `POST /api/activities/trip-activities`
- **Auth Required:** Yes (`requireAuth` + `validateBody(tripActivityCreateSchema)`)
- **Response (201 Created):** `TripActivity` object.

---

## 5. Itinerary & Stops Endpoints (Part B - Planned Stubs)

### `POST /api/stops`
- **Auth Required:** Yes (`requireAuth` + `validateBody(stopCreateSchema)`)
- **Response (201 Created):** `Stop` object.

### `DELETE /api/stops/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `{ "message": "Stop deleted" }`

---

## 6. Budget & Expense Endpoints (Part C - Planned Stubs)

### `GET /api/budget/trips/:tripId/expenses`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of `Expense` objects + total cost summary.

### `POST /api/budget/expenses`
- **Auth Required:** Yes (`requireAuth` + `validateBody(expenseCreateSchema)`)
- **Response (201 Created):** `Expense` object.

---

## 7. Admin Endpoints (Part D - Planned Stubs)

### `GET /api/admin/stats`
- **Auth Required:** Yes (`requireAuth` + Service Role/Admin Check)
- **Response (200 OK):** Application platform metrics (total users, total trips, popular cities).
