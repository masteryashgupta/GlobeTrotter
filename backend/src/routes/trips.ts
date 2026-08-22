import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { tripCreateSchema, tripUpdateSchema, TripCreateInput, TripUpdateInput } from '../../../shared/validation';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { StopService } from '../services/stopService';
import { TripActivityService } from '../services/tripActivityService';

export const tripsRouter = Router();

// 1. POST /api/trips - Create trip
tripsRouter.post(
  '/',
  requireAuth,
  validateBody(tripCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const payload: TripCreateInput = req.body;
      const ownerId = req.user!.id;

      const { data: trip, error } = await supabaseAdmin
        .from('trips')
        .insert({
          owner_id: ownerId,
          name: payload.name,
          description: payload.description,
          start_date: payload.start_date,
          end_date: payload.end_date,
          cover_photo_url: payload.cover_photo_url,
          is_public: payload.is_public ?? false,
        } as any)
        .select('*')
        .single();

      if (error) {
        return res.status(400).json({ error: 'Failed to create trip', details: error.message });
      }

      return res.status(201).json(trip);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error creating trip', details: err.message });
    }
  }
);

// 2. GET /api/trips - List current user's trips
tripsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.user!.id;

    const { data: trips, error } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'Failed to fetch trips', details: error.message });
    }

    return res.json(trips || []);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching trips', details: err.message });
  }
});

// 3. GET /api/trips/:id - Get single trip with nested stops/activities
tripsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.params.id;

    // Fetch trip
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Check authorization if trip is private
    if (!trip.is_public) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Private trip' });
      }
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user || user.id !== trip.owner_id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
      }
    }

    // Fetch nested stops and activities
    const { data: stops } = await supabaseAdmin
      .from('stops')
      .select('*, cities(*)')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true });

    let nestedStops: any[] = stops || [];
    if (nestedStops.length > 0) {
      const stopIds = nestedStops.map((s) => s.id);
      const { data: tripActivities } = await supabaseAdmin
        .from('trip_activities')
        .select('*, activities(*)')
        .in('stop_id', stopIds)
        .order('order_index', { ascending: true });

      const activityMap: Record<string, any[]> = {};
      (tripActivities || []).forEach((act: any) => {
        if (!activityMap[act.stop_id]) activityMap[act.stop_id] = [];
        activityMap[act.stop_id].push(act);
      });

      nestedStops = nestedStops.map((s) => ({
        ...s,
        activities: activityMap[s.id] || [],
      }));
    }

    return res.json({
      ...trip,
      stops: nestedStops,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching trip details', details: err.message });
  }
});

// 4. PATCH /api/trips/:id - Update trip
tripsRouter.patch(
  '/:id',
  requireAuth,
  validateBody(tripUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tripId = req.params.id;
      const ownerId = req.user!.id;
      const payload: TripUpdateInput = req.body;

      // Ownership check
      const { data: existingTrip } = await supabaseAdmin
        .from('trips')
        .select('owner_id')
        .eq('id', tripId)
        .single();

      if (!existingTrip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      if ((existingTrip as any).owner_id !== ownerId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
      }

      const { data: updatedTrip, error } = await supabaseAdmin
        .from('trips')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', tripId)
        .select('*')
        .single();

      if (error) {
        return res.status(400).json({ error: 'Failed to update trip', details: error.message });
      }

      return res.json(updatedTrip);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error updating trip', details: err.message });
    }
  }
);

// 5. DELETE /api/trips/:id - Delete trip
tripsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.params.id;
    const ownerId = req.user!.id;

    // Ownership check
    const { data: existingTrip } = await supabaseAdmin
      .from('trips')
      .select('owner_id')
      .eq('id', tripId)
      .single();

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if ((existingTrip as any).owner_id !== ownerId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
    }

    const { error } = await supabaseAdmin.from('trips').delete().eq('id', tripId);

    if (error) {
      return res.status(400).json({ error: 'Failed to delete trip', details: error.message });
    }

    return res.status(200).json({ message: 'Trip deleted successfully', id: tripId });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error deleting trip', details: err.message });
  }
});

// 6. GET /api/trips/:tripId/stops - List stops for a trip
tripsRouter.get('/:tripId/stops', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : (req.params.tripId as string);
    const stops = await StopService.getStopsByTripId(tripId);
    return res.json(stops);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error fetching trip stops' });
  }
});

// 7. POST /api/trips/:tripId/stops - Create stop for a trip with overlap validation
tripsRouter.post('/:tripId/stops', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : (req.params.tripId as string);
    const { city_id, arrival_date, departure_date, order_index } = req.body;
    const userId = req.user!.id;

    if (!city_id || !arrival_date || !departure_date) {
      return res.status(400).json({ error: 'city_id, arrival_date, and departure_date are required' });
    }

    const stop = await StopService.createStop({
      tripId,
      cityId: city_id,
      arrivalDate: arrival_date,
      departureDate: departure_date,
      orderIndex: order_index,
      userId,
    });

    return res.status(201).json(stop);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error creating stop' });
  }
});

// 8. PATCH /api/trips/:tripId/stops/reorder - Bulk reorder stops
tripsRouter.patch('/:tripId/stops/reorder', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : (req.params.tripId as string);
    const stopIds = req.body.stop_ids || req.body.stopIds || req.body;
    const userId = req.user!.id;

    if (!Array.isArray(stopIds)) {
      return res.status(400).json({ error: 'stop_ids must be an array of stop UUIDs' });
    }

    const reordered = await StopService.reorderStops(tripId, stopIds, userId);
    return res.json(reordered);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error reordering stops' });
  }
});

// 9. GET /api/trips/:tripId/timeline - Aggregated day-by-day & grouped-by-city timeline
tripsRouter.get('/:tripId/timeline', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : (req.params.tripId as string);
    const userId = req.user!.id;

    // 1. Fetch trip
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Permission check: owner or public trip
    if (!trip.is_public && trip.owner_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this trip' });
    }

    // 2. Fetch stops for trip
    const rawStops = await StopService.getStopsByTripId(tripId);

    // 3. Fetch activities for each stop
    const stopsWithActivities = await Promise.all(
      rawStops.map(async (stop) => {
        const activities = await TripActivityService.getActivitiesByStopId(stop.id);
        return {
          ...stop,
          trip_activities: activities,
        };
      })
    );

    // 4. Generate Day-by-Day Timeline
    const days: any[] = [];
    let totalEstimatedCost = 0;
    let totalActivities = 0;

    // Determine timeline date bounds
    const startDateStr = trip.start_date || (stopsWithActivities.length > 0 ? stopsWithActivities[0].arrival_date : new Date().toISOString().split('T')[0]);
    const endDateStr = trip.end_date || (stopsWithActivities.length > 0 ? stopsWithActivities[stopsWithActivities.length - 1].departure_date : startDateStr);

    const curr = new Date(startDateStr);
    const end = new Date(endDateStr);
    let dayNumber = 1;

    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];

      // Find which stop covers this date
      const currentStop = stopsWithActivities.find(
        (s) => dateStr >= s.arrival_date && dateStr <= s.departure_date
      );

      // Collect all activities scheduled on this date across stops
      const dayActivities: any[] = [];
      for (const s of stopsWithActivities) {
        const acts = (s.trip_activities || []).filter((a: any) => a.scheduled_date === dateStr);
        dayActivities.push(...acts);
      }

      // Sort by scheduled_time (nulls last)
      dayActivities.sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return a.scheduled_time.localeCompare(b.scheduled_time);
      });

      // Sum costs
      dayActivities.forEach((act) => {
        const cost = act.custom_cost !== null && act.custom_cost !== undefined
          ? Number(act.custom_cost)
          : (act.activities?.cost ? Number(act.activities.cost) : 0);
        totalEstimatedCost += cost;
        totalActivities++;
      });

      days.push({
        day_number: dayNumber,
        date: dateStr,
        stop_id: currentStop ? currentStop.id : null,
        stop: currentStop || null,
        city: currentStop ? currentStop.cities : null,
        activities: dayActivities,
      });

      curr.setDate(curr.getDate() + 1);
      dayNumber++;
    }

    // Add unassigned-date activities to the total if any
    for (const s of stopsWithActivities) {
      for (const act of s.trip_activities || []) {
        if (!act.scheduled_date) {
          const cost = act.custom_cost !== null && act.custom_cost !== undefined
            ? Number(act.custom_cost)
            : (act.activities?.cost ? Number(act.activities.cost) : 0);
          totalEstimatedCost += cost;
          totalActivities++;
        }
      }
    }

    return res.json({
      trip,
      days,
      stops: stopsWithActivities,
      summary: {
        total_days: days.length,
        total_stops: stopsWithActivities.length,
        total_activities: totalActivities,
        total_estimated_cost: totalEstimatedCost,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error generating timeline' });
  }
});
