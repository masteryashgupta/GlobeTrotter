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

### `GET /api/trips/:tripId/timeline`
- **Auth Required:** Yes (`requireAuth` + Owner/Public Check)
- **Response (200 OK):** Aggregated timeline object containing:
  - `trip`: Full trip metadata
  - `days`: Array of day objects from `start_date` to `end_date` with `day_number`, `date`, `city`, `stop`, and `activities` sorted by `scheduled_time`
  - `stops`: Array of stops with nested `trip_activities`
  - `summary`: Total days, total stops, total activities, and total estimated cost

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

### `POST /api/stops/:stopId/activities` (and `POST /api/activities/trip-activities`)
- **Auth Required:** Yes (`requireAuth` + `validateBody(tripActivityCreateSchema)`)
- **Business Rules:** `scheduled_date` must fall within parent stop's `[arrival_date, departure_date]` range. Automatically sets `order_index`.
- **Response (201 Created):** `TripActivity` object with joined `activities(*)` details.
- **Response (400 Bad Request):** `{ "error": "Scheduled date (YYYY-MM-DD) must fall within stop stay dates" }`

### `GET /api/stops/:stopId/activities`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of `TripActivity` objects assigned to `:stopId`, ordered by `order_index ASC` / `scheduled_time`.

### `PATCH /api/trip-activities/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Body:** `{ "scheduled_date"?: string, "scheduled_time"?: string, "custom_cost"?: number, "notes"?: string, "order_index"?: number }`
- **Business Rules:** Re-validates `scheduled_date` against parent stop's stay range.
- **Response (200 OK):** Updated `TripActivity` object.

### `DELETE /api/trip-activities/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `{ "message": "Trip activity deleted successfully", "id": "<id>" }`

### `PATCH /api/stops/:stopId/activities/reorder`
- **Auth Required:** Yes (`requireAuth`)
- **Body:** `{ "activity_ids": ["uuid1", "uuid2"] }`
- **Response (200 OK):** Array of reordered `TripActivity` objects.

---

## 5. Itinerary & Stops Endpoints (Part B - Fully Implemented)

### `POST /api/trips/:tripId/stops` (and `POST /api/stops`)
- **Auth Required:** Yes (`requireAuth` + `validateBody(stopCreateSchema)`)
- **Ownership:** User must own `:tripId`.
- **Business Rules:**
  - `[arrival_date, departure_date]` must not overlap with any existing stop in the trip.
  - Automatically calculates `order_index` to next available index if omitted.
- **Response (201 Created):** `Stop` object with joined `cities(*)` metadata.
- **Response (400 Bad Request):** `{ "error": "Stop dates overlap with existing stop in <City> (<arrival> to <departure>)" }`

### `GET /api/trips/:tripId/stops` (and `GET /api/stops?trip_id=...`)
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of `Stop` objects for the trip, sorted by `order_index ASC`, each with joined `cities(*)` data.

### `PATCH /api/stops/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Body:** `{ "city_id"?: string, "arrival_date"?: string, "departure_date"?: string, "order_index"?: number }`
- **Business Rules:** Re-runs date overlap check against other stops in the trip (excluding itself).
- **Response (200 OK):** Updated `Stop` object.

### `DELETE /api/stops/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `{ "message": "Stop deleted successfully", "id": "<stopId>" }` (cascades to child `trip_activities`).

### `PATCH /api/trips/:tripId/stops/reorder`
- **Auth Required:** Yes (`requireAuth`)
- **Body:** `{ "stop_ids": ["uuid1", "uuid2", "uuid3"] }`
- **Response (200 OK):** Array of reordered `Stop` objects with updated `order_index` values.

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
