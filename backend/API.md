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

## 1b. User Profile & Settings Endpoints (Part D - Fully Implemented)

### `GET /api/profile`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** `Profile` object for the current user.

### `PATCH /api/profile`
- **Auth Required:** Yes (`requireAuth` + `validateBody(profileUpdateSchema)`)
- **Body:**
  ```json
  {
    "full_name": "Jane Doe",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775",
    "language_pref": "en"
  }
  ```
- **Response (200 OK):** Updated `Profile` object.

### `DELETE /api/profile`
- **Auth Required:** Yes (`requireAuth` + `validateBody(profileDeleteSchema)`)
- **Body:**
  ```json
  {
    "confirm": true
  }
  ```
- **Response (200 OK):** `{ "message": "Account deleted successfully", "id": "<user_id>" }` (Cascades to profile, trips, stops, activities, expenses, trip copies).

### `GET /api/profile/saved-destinations`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of distinct `City` objects included across the user's trip stops.

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

## 5. Budget & Expense Endpoints (Part C - Planned Stubs)

### `GET /api/budget/trips/:tripId/expenses`
- **Auth Required:** Yes (`requireAuth`)
- **Response (200 OK):** Array of `Expense` objects + total cost summary.

### `POST /api/budget/expenses`
- **Auth Required:** Yes (`requireAuth` + `validateBody(expenseCreateSchema)`)
- **Response (201 Created):** `Expense` object.

---

## 6. Admin Endpoints (Part D - Fully Implemented)

> **Auth Required:** All admin endpoints require `requireAuth` + `requireAdmin`.
> The `requireAdmin` middleware fetches `profiles.is_admin` server-side from the DB via the service-role client; no client-sent flag is trusted. Returns `403` if `is_admin = false`.

### `GET /api/admin/stats`
- **Auth Required:** Yes (`requireAuth` + `requireAdmin`)
- **Response (200 OK):**
  ```json
  {
    "total_users": 142,
    "total_trips": 389,
    "trips_last_7_days": 14,
    "trips_last_30_days": 61,
    "avg_trip_duration_days": 8.4,
    "top_cities": [
      { "city_id": "uuid", "name": "Tokyo", "country": "Japan", "image_url": "...", "stop_count": 42 }
    ],
    "top_activities": [
      { "activity_id": "uuid", "name": "Senso-ji Temple", "category": "culture", "image_url": "...", "booking_count": 31 }
    ]
  }
  ```

### `GET /api/admin/users?page=1&limit=20`
- **Auth Required:** Yes (`requireAuth` + `requireAdmin`)
- **Query Params:** `page` (default: 1), `limit` (default: 20, max: 100)
- **Response (200 OK):**
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "is_admin": false,
        "created_at": "2026-08-01T...",
        "trip_count": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "total_pages": 8
    }
  }
  ```

