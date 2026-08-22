import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const adminRouter = Router();

/**
 * GET /api/admin/stats
 * requireAuth + requireAdmin
 *
 * Returns:
 *  - total_users: count of all profiles
 *  - total_trips: count of all trips
 *  - trips_last_7_days: trips created in past 7 days
 *  - trips_last_30_days: trips created in past 30 days
 *  - avg_trip_duration_days: average (end_date - start_date) across all trips
 *  - top_cities: top 10 cities by stop count (joined via stops -> cities)
 *  - top_activities: top 10 activities by trip_activity count (joined via trip_activities -> activities)
 */
adminRouter.get('/stats', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Run all queries in parallel
    const [
      usersResult,
      tripsResult,
      trips7Result,
      trips30Result,
      avgDurationResult,
      topCitiesResult,
      topActivitiesResult,
    ] = await Promise.all([
      // Total user count
      supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true }),

      // Total trip count
      supabaseAdmin
        .from('trips')
        .select('*', { count: 'exact', head: true }),

      // Trips last 7 days
      supabaseAdmin
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),

      // Trips last 30 days
      supabaseAdmin
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo),

      // Average trip duration via raw rpc (postgres function or select computed)
      // Use a raw query via supabaseAdmin.rpc or manual fetch with pg math
      supabaseAdmin
        .from('trips')
        .select('start_date, end_date'),

      // Top 10 most-added cities by stop count
      supabaseAdmin
        .from('stops')
        .select('city_id, cities(id, name, country, image_url)')
        .not('city_id', 'is', null),

      // Top 10 most-booked activities by trip_activity count
      supabaseAdmin
        .from('trip_activities')
        .select('activity_id, activities(id, name, category, image_url)')
        .not('activity_id', 'is', null),
    ]);

    // --- Compute average trip duration from fetched rows ---
    let avg_trip_duration_days: number | null = null;
    if (!avgDurationResult.error && avgDurationResult.data && avgDurationResult.data.length > 0) {
      const durations = (avgDurationResult.data as Array<{ start_date: string; end_date: string }>)
        .map((t) => {
          const start = new Date(t.start_date).getTime();
          const end = new Date(t.end_date).getTime();
          return (end - start) / (1000 * 60 * 60 * 24); // days
        })
        .filter((d) => d >= 0);

      if (durations.length > 0) {
        avg_trip_duration_days = Math.round(
          (durations.reduce((sum, d) => sum + d, 0) / durations.length) * 10
        ) / 10;
      }
    }

    // --- Aggregate top cities ---
    const cityCountMap = new Map<string, { city: any; count: number }>();
    if (!topCitiesResult.error && topCitiesResult.data) {
      for (const row of topCitiesResult.data as Array<{ city_id: string; cities: any }>) {
        if (!row.cities) continue;
        const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;
        if (!city?.id) continue;
        const existing = cityCountMap.get(city.id);
        if (existing) {
          existing.count++;
        } else {
          cityCountMap.set(city.id, { city, count: 1 });
        }
      }
    }
    const top_cities = Array.from(cityCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ city, count }) => ({
        city_id: city.id,
        name: city.name,
        country: city.country,
        image_url: city.image_url,
        stop_count: count,
      }));

    // --- Aggregate top activities ---
    const activityCountMap = new Map<string, { activity: any; count: number }>();
    if (!topActivitiesResult.error && topActivitiesResult.data) {
      for (const row of topActivitiesResult.data as Array<{ activity_id: string; activities: any }>) {
        if (!row.activities) continue;
        const activity = Array.isArray(row.activities) ? row.activities[0] : row.activities;
        if (!activity?.id) continue;
        const existing = activityCountMap.get(activity.id);
        if (existing) {
          existing.count++;
        } else {
          activityCountMap.set(activity.id, { activity, count: 1 });
        }
      }
    }
    const top_activities = Array.from(activityCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ activity, count }) => ({
        activity_id: activity.id,
        name: activity.name,
        category: activity.category,
        image_url: activity.image_url,
        booking_count: count,
      }));

    return res.json({
      total_users: usersResult.count ?? 0,
      total_trips: tripsResult.count ?? 0,
      trips_last_7_days: trips7Result.count ?? 0,
      trips_last_30_days: trips30Result.count ?? 0,
      avg_trip_duration_days,
      top_cities,
      top_activities,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching admin stats', details: err.message });
  }
});

/**
 * GET /api/admin/users?page=1&limit=20
 * requireAuth + requireAdmin
 *
 * Returns a paginated list of users with:
 *  - id, full_name, email (from auth.users via admin API), created_at, trip_count
 *
 * Strategy:
 *  1. Fetch paginated profiles rows (id, full_name, is_admin, created_at).
 *  2. Fetch trip counts for those user IDs.
 *  3. Fetch auth.users emails via supabaseAdmin.auth.admin.listUsers().
 *  4. Join in-memory and return.
 */
adminRouter.get('/users', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;

    // 1. Paginated profiles
    const { data: profiles, error: profilesError, count: totalCount } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, is_admin, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (profilesError) {
      return res.status(400).json({ error: 'Failed to fetch users', details: profilesError.message });
    }

    const userIds = (profiles || []).map((p) => p.id);

    // 2. Trip counts for these user IDs
    const tripCountMap = new Map<string, number>();
    if (userIds.length > 0) {
      const { data: trips } = await supabaseAdmin
        .from('trips')
        .select('owner_id')
        .in('owner_id', userIds);

      for (const trip of trips || []) {
        if (!trip.owner_id) continue;
        tripCountMap.set(trip.owner_id, (tripCountMap.get(trip.owner_id) || 0) + 1);
      }
    }

    // 3. Fetch auth user emails via admin API (listUsers returns all users; filter by page IDs)
    //    Note: listUsers has its own pagination; we pull enough pages to find our IDs.
    const emailMap = new Map<string, string>();
    if (userIds.length > 0) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000, // generous ceiling — for larger deployments, iterate pages
        });
        for (const authUser of authData?.users || []) {
          if (authUser.email) {
            emailMap.set(authUser.id, authUser.email);
          }
        }
      } catch {
        // Email fetch is best-effort; continue without it
      }
    }

    // 4. Join and return
    const users = (profiles || []).map((profile: any) => ({
      id: profile.id,
      full_name: profile.full_name,
      email: emailMap.get(profile.id) || null,
      is_admin: profile.is_admin,
      created_at: profile.created_at,
      trip_count: tripCountMap.get(profile.id) || 0,
    }));

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount ?? 0,
        total_pages: Math.ceil((totalCount ?? 0) / limit),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching users', details: err.message });
  }
});
