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

### `POST /api/trips/:id/share`
- **Auth Required:** Yes (`requireAuth` + Owner Check)
- **Response (200 OK):** `{ id, is_public: true, share_token, share_url }`

### `POST /api/trips/:id/unshare`
- **Auth Required:** Yes (`requireAuth` + Owner Check)
- **Response (200 OK):** `{ id, is_public: false, share_token }`

### `GET /api/share/:token`
- **Auth Required:** None (Public read-only)
- **Response (200 OK):** Full trip object with nested `stops` and `activities`. Excludes owner private info.

### `POST /api/share/:token/copy`
- **Auth Required:** Yes (`requireAuth`)
- **Response (201 Created):** Cloned `Trip` object owned by caller, prefixed with `"Copy of "`, including all copied stops, activities, and audit record in `trip_copies`.

---

## 3. Cities Endpoints (Part B - Planned Stubs)

### `GET /api/cities/search`
- **Auth Required:** Optional
- **Query Params:** `?query=paris`
- **Response (200 OK):** Array of matching `City` objects.

### `GET /api/cities/:id`
- **Auth Required:** Optional
- **Response (200 OK):** `City` object with detailed description and image.

---

## 4. Itinerary & Stops Endpoints (Part B - Planned Stubs)

### `POST /api/stops`
- **Auth Required:** Yes (`requireAuth` + `validateBody(stopCreateSchema)`)
- **Response (201 Created):** `Stop` object.

### `DELETE /api/stops/:id`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `{ "message": "Stop deleted" }`

### `POST /api/activities/trip-activities`
- **Auth Required:** Yes (`requireAuth` + `validateBody(tripActivityCreateSchema)`)
- **Response (201 Created):** `TripActivity` object.

---

## 5. Budget & Expense Endpoints (Part C - Implemented)

### `POST /api/trips/:tripId/expenses`
- **Auth Required:** Yes (`requireAuth` + `validateBody(expenseCreateSchema)` + Owner Check)
- **Response (201 Created):** Created `Expense` object.

### `GET /api/trips/:tripId/expenses`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of manual `Expense` objects for the trip.

### `PATCH /api/expenses/:id`
- **Auth Required:** Yes (`requireAuth` + `validateBody(expenseUpdateSchema)` + Owner Check)
- **Response (200 OK):** Updated `Expense` object.

### `DELETE /api/expenses/:id`
- **Auth Required:** Yes (`requireAuth` + Owner Check)
- **Response (200 OK):** `{ "message": "Expense deleted successfully", "id": "<expense_id>" }`

### `GET /api/budget/trips/:tripId/expenses`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of `Expense` objects + category breakdown + total cost summary.

### `GET /api/trips/:tripId/budget`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Comprehensive JSON shape `{ byCategory, total, tripDurationDays, perDayAverage, perDay }`.

### `GET /api/trips/:tripId/calendar`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of calendar event objects `{ id, title, start, end, stopCity, cost, category, notes }`.


---

## 6. Admin Endpoints (Part D - Planned Stubs)

### `GET /api/admin/stats`
- **Auth Required:** Yes (`requireAuth` + Service Role/Admin Check)
- **Response (200 OK):** Application platform metrics (total users, total trips, popular cities).
