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

## 2. Trips Endpoints (Part A & C - Fully Implemented)

### `POST /api/trips`
- **Auth Required:** Yes (`requireAuth`)
- **Body Validation:** `tripCreateSchema`
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

### `POST /api/trips/:id/share`
- **Auth Required:** Yes (`requireAuth` + Owner Check)
- **Response (200 OK):** `{ id, is_public: true, share_token, share_url }`

### `POST /api/trips/:id/unshare`
- **Auth Required:** Yes (`requireAuth` + Owner Check)
- **Response (200 OK):** `{ id, is_public: false, share_token }`

### `GET /api/share/:token`
- **Auth Required:** None (Public read-only)
- **Response (200 OK):** Full trip object with nested `stops` and `activities`.

### `POST /api/share/:token/copy`
- **Auth Required:** Yes (`requireAuth`)
- **Response (201 Created):** Cloned `Trip` object owned by caller.

### `GET /api/trips/:tripId/timeline`
- **Auth Required:** Yes (`requireAuth` + Owner/Public Check)
- **Response (200 OK):** Aggregated timeline object (days, stops, activities, summary).

---

## 3. Cities Endpoints (Part B - Fully Implemented)

### `GET /api/cities/search`
- **Auth Required:** None (Public)
- **Query Params:** `q`, `country`, `region`, `limit`
- **Response (200 OK):** Array of `City` objects sorted by `popularity DESC`.

### `GET /api/cities/popular`
- **Auth Required:** None (Public)
- **Response (200 OK):** Top `City` objects.

### `GET /api/cities/:id`
- **Auth Required:** None (Public)
- **Response (200 OK):** Single `City` object.

---

## 4. Activities & Stops Endpoints (Part B - Fully Implemented)

### `GET /api/activities/search`
- **Auth Required:** None (Public)
- **Response (200 OK):** Array of `Activity` objects.

### `POST /api/stops/:stopId/activities` (and `POST /api/activities/trip-activities`)
- **Auth Required:** Yes (`requireAuth` + `validateBody(tripActivityCreateSchema)`)
- **Response (201 Created):** `TripActivity` object.

### `PATCH /api/trip-activities/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Updated `TripActivity` object.

### `DELETE /api/trip-activities/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `{ "message": "Trip activity deleted successfully", "id": "<id>" }`

### `POST /api/trips/:tripId/stops`
- **Auth Required:** Yes (`requireAuth` + `validateBody(stopCreateSchema)`)
- **Response (201 Created):** `Stop` object.

### `DELETE /api/stops/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `{ "message": "Stop deleted successfully", "id": "<stopId>" }`

---

## 5. Budget & Expense Endpoints (Part C - Implemented)

### `POST /api/trips/:tripId/expenses`
- **Auth Required:** Yes (`requireAuth` + `validateBody(expenseCreateSchema)`)
- **Response (201 Created):** `Expense` object.

### `GET /api/trips/:tripId/expenses`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of manual `Expense` objects.

### `GET /api/trips/:tripId/budget`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `{ byCategory, total, tripDurationDays, perDayAverage, perDay }`.

### `GET /api/trips/:id/calendar`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of calendar event objects.

---

## 6. Admin Endpoints (Part D - Planned Stubs)

### `GET /api/admin/stats`
- **Auth Required:** Yes (`requireAuth` + Admin Check)
- **Response (200 OK):** Application platform metrics.
