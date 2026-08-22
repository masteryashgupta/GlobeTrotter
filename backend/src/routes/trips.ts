import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { tripCreateSchema, tripUpdateSchema, TripCreateInput, TripUpdateInput } from '../shared/validation';
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

    // Fetch trip
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

    // Fetch stops for trip
    const rawStops = await StopService.getStopsByTripId(tripId);

    // Fetch activities for each stop
    const stopsWithActivities = await Promise.all(
      rawStops.map(async (stop) => {
        const activities = await TripActivityService.getActivitiesByStopId(stop.id);
        return {
          ...stop,
          trip_activities: activities,
        };
      })
    );

    // Generate Day-by-Day Timeline
    const days: any[] = [];
    let totalEstimatedCost = 0;
    let totalActivities = 0;

    const startDateStr = trip.start_date || (stopsWithActivities.length > 0 ? stopsWithActivities[0].arrival_date : new Date().toISOString().split('T')[0]);
    const endDateStr = trip.end_date || (stopsWithActivities.length > 0 ? stopsWithActivities[stopsWithActivities.length - 1].departure_date : startDateStr);

    const curr = new Date(startDateStr);
    const end = new Date(endDateStr);
    let dayNumber = 1;

    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];

      const currentStop = stopsWithActivities.find(
        (s) => dateStr >= s.arrival_date && dateStr <= s.departure_date
      );

      const dayActivities: any[] = [];
      for (const s of stopsWithActivities) {
        const acts = (s.trip_activities || []).filter((a: any) => a.scheduled_date === dateStr);
        dayActivities.push(...acts);
      }

      dayActivities.sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return a.scheduled_time.localeCompare(b.scheduled_time);
      });

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

// 10. POST /api/trips/:id/share - Generate share token
tripsRouter.post('/:id/share', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.params.id;
    const userId = req.user!.id;

    const { data: existingTrip } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if ((existingTrip as any).owner_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
    }

    let shareToken = (existingTrip as any).share_token;
    if (!shareToken) {
      shareToken = crypto.randomUUID();
    }

    const { data: updatedTrip, error } = await supabaseAdmin
      .from('trips')
      .update({
        is_public: true,
        share_token: shareToken,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', tripId)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to share trip', details: error.message });
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'https://masteryashgupta.github.io/GlobeTrotter').replace(/\/$/, '');

    return res.json({
      id: updatedTrip.id,
      is_public: true,
      share_token: updatedTrip.share_token,
      share_url: `${frontendUrl}/share/${updatedTrip.share_token}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error sharing trip', details: err.message });
  }
});

// 11. POST /api/trips/:id/unshare - Set is_public = false
tripsRouter.post('/:id/unshare', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.params.id;
    const userId = req.user!.id;

    const { data: existingTrip } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if ((existingTrip as any).owner_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
    }

    const { data: updatedTrip, error } = await supabaseAdmin
      .from('trips')
      .update({
        is_public: false,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', tripId)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to unshare trip', details: error.message });
    }

    return res.json({
      id: updatedTrip.id,
      is_public: false,
      share_token: updatedTrip.share_token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error unsharing trip', details: err.message });
  }
});

// 12. GET /api/trips/share/:token - Get public shared trip by token
tripsRouter.get('/share/:token', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.params;

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('*, profiles(full_name, avatar_url)')
      .eq('share_token', token)
      .eq('is_public', true)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Shared trip not found or link is private' });
    }

    const { data: stops } = await supabaseAdmin
      .from('stops')
      .select('*, cities(*)')
      .eq('trip_id', trip.id)
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
    return res.status(500).json({ error: 'Server error fetching shared trip', details: err.message });
  }
});

// 13. POST /api/trips/:id/copy - Copy/clone a trip
tripsRouter.post('/:id/copy', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sourceTripId = req.params.id;
    const newOwnerId = req.user!.id;

    const { data: sourceTrip } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', sourceTripId)
      .single();

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Source trip not found' });
    }

    if (!sourceTrip.is_public && sourceTrip.owner_id !== newOwnerId) {
      return res.status(403).json({ error: 'Forbidden: Cannot copy private trip' });
    }

    const { data: newTrip, error: createTripErr } = await supabaseAdmin
      .from('trips')
      .insert({
        owner_id: newOwnerId,
        name: `${sourceTrip.name} (Copy)`,
        description: sourceTrip.description,
        start_date: sourceTrip.start_date,
        end_date: sourceTrip.end_date,
        cover_photo_url: sourceTrip.cover_photo_url,
        is_public: false,
      } as any)
      .select('*')
      .single();

    if (createTripErr || !newTrip) {
      return res.status(400).json({ error: 'Failed to create cloned trip', details: createTripErr?.message });
    }

    const { data: sourceStops } = await supabaseAdmin
      .from('stops')
      .select('*')
      .eq('trip_id', sourceTripId);

    if (sourceStops && sourceStops.length > 0) {
      for (const stop of sourceStops) {
        const { data: newStop } = await supabaseAdmin
          .from('stops')
          .insert({
            trip_id: newTrip.id,
            city_id: stop.city_id,
            order_index: stop.order_index,
            arrival_date: stop.arrival_date,
            departure_date: stop.departure_date,
          } as any)
          .select('*')
          .single();

        if (newStop) {
          const { data: sourceActivities } = await supabaseAdmin
            .from('trip_activities')
            .select('*')
            .eq('stop_id', stop.id);

          if (sourceActivities && sourceActivities.length > 0) {
            const newActivities = sourceActivities.map((act) => ({
              stop_id: newStop.id,
              activity_id: act.activity_id,
              scheduled_date: act.scheduled_date,
              scheduled_time: act.scheduled_time,
              custom_cost: act.custom_cost,
              notes: act.notes,
              order_index: act.order_index,
            }));

            await supabaseAdmin.from('trip_activities').insert(newActivities as any);
          }
        }
      }
    }

    await supabaseAdmin.from('trip_copies').insert({
      original_trip_id: sourceTripId,
      copied_trip_id: newTrip.id,
      copied_by: newOwnerId,
    } as any);

    return res.status(201).json(newTrip);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error copying trip', details: err.message });
  }
});

// 14. GET /api/trips/:id/budget - Budget aggregation
tripsRouter.get('/:id/budget', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.params.id;
    const userId = req.user!.id;

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('id, owner_id, is_public, start_date, end_date')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if ((trip as any).owner_id !== userId && !trip.is_public) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this trip' });
    }

    const startMs = new Date(trip.start_date).getTime();
    const endMs = new Date(trip.end_date).getTime();
    const tripDurationDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

    const { data: expenses } = await supabaseAdmin
      .from('expenses')
      .select('category, amount, created_at, stop_id, stops(arrival_date)')
      .eq('trip_id', tripId);

    const byCategory: Record<string, number> = {
      transport: 0,
      stay: 0,
      activity: 0,
      meals: 0,
      misc: 0,
    };

    const perDayMap: Record<string, number> = {};

    (expenses || []).forEach((exp: any) => {
      const amt = Number(exp.amount || 0);
      const cat = exp.category || 'misc';
      if (byCategory[cat] !== undefined) {
        byCategory[cat] += amt;
      } else {
        byCategory.misc += amt;
      }

      let dateKey = trip.start_date;
      if (exp.stops?.arrival_date) {
        dateKey = exp.stops.arrival_date;
      } else if (exp.created_at) {
        dateKey = exp.created_at.split('T')[0];
      }

      perDayMap[dateKey] = (perDayMap[dateKey] || 0) + amt;
    });

    const { data: stops } = await supabaseAdmin
      .from('stops')
      .select('id, arrival_date')
      .eq('trip_id', tripId);

    let scheduledActivitiesCost = 0;

    if (stops && stops.length > 0) {
      const stopIds = stops.map((s) => s.id);
      const stopDateMap: Record<string, string> = {};
      stops.forEach((s) => {
        stopDateMap[s.id] = s.arrival_date;
      });

      const { data: tripActivities } = await supabaseAdmin
        .from('trip_activities')
        .select('stop_id, scheduled_date, custom_cost, activities(cost)')
        .in('stop_id', stopIds);

      (tripActivities || []).forEach((act: any) => {
        const cost = Number(act.custom_cost ?? act.activities?.cost ?? 0);
        scheduledActivitiesCost += cost;

        const dateKey = act.scheduled_date || stopDateMap[act.stop_id] || trip.start_date;
        if (dateKey) {
          perDayMap[dateKey] = (perDayMap[dateKey] || 0) + cost;
        }
      });
    }

    byCategory.activity += scheduledActivitiesCost;

    Object.keys(byCategory).forEach((key) => {
      byCategory[key] = Number(byCategory[key].toFixed(2));
    });

    const total = Number(
      (byCategory.transport + byCategory.stay + byCategory.activity + byCategory.meals + byCategory.misc).toFixed(2)
    );
    const perDayAverage = Number((total / tripDurationDays).toFixed(2));

    const perDay: Array<{ date: string; total: number }> = [];
    const startDate = new Date(trip.start_date);
    for (let i = 0; i < tripDurationDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTotal = Number((perDayMap[dateStr] || 0).toFixed(2));
      perDay.push({ date: dateStr, total: dayTotal });
    }

    return res.json({
      byCategory,
      total,
      tripDurationDays,
      perDayAverage,
      perDay,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error computing trip budget breakdown', details: err.message });
  }
});

// 15. GET /api/trips/:id/calendar - Scheduled activities for calendar view
tripsRouter.get('/:id/calendar', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.params.id;
    const userId = req.user!.id;

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('id, owner_id, is_public, start_date, end_date')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if ((trip as any).owner_id !== userId && !trip.is_public) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this trip' });
    }

    const { data: stops } = await supabaseAdmin
      .from('stops')
      .select('id, arrival_date, departure_date, cities(name)')
      .eq('trip_id', tripId);

    if (!stops || stops.length === 0) {
      return res.json([]);
    }

    const stopIds = stops.map((s) => s.id);
    const stopMap: Record<string, any> = {};
    stops.forEach((s) => {
      stopMap[s.id] = s;
    });

    const { data: tripActivities, error: actError } = await supabaseAdmin
      .from('trip_activities')
      .select('id, stop_id, scheduled_date, scheduled_time, custom_cost, notes, order_index, activities(id, name, category, duration_minutes, cost)')
      .in('stop_id', stopIds);

    if (actError) {
      return res.status(400).json({ error: 'Failed to fetch trip activities', details: actError.message });
    }

    const calendarEvents = (tripActivities || []).map((ta: any) => {
      const parentStop = stopMap[ta.stop_id];
      const dateStr = ta.scheduled_date || parentStop?.arrival_date || trip.start_date;
      const timeStr = ta.scheduled_time || '09:00:00';

      const startDateTimeStr = `${dateStr}T${timeStr.length === 5 ? `${timeStr}:00` : timeStr}`;
      const startDateObj = new Date(startDateTimeStr);

      const durationMins = ta.activities?.duration_minutes || 60;
      const endDateObj = new Date(startDateObj.getTime() + durationMins * 60 * 1000);

      const cost = Number(ta.custom_cost ?? ta.activities?.cost ?? 0);
      const stopCity = parentStop?.cities?.name || 'Destination';

      return {
        id: ta.id,
        title: ta.activities?.name || 'Scheduled Activity',
        start: startDateObj.toISOString(),
        end: endDateObj.toISOString(),
        stopCity,
        cost,
        category: ta.activities?.category || 'sightseeing',
        notes: ta.notes || '',
      };
    });

    return res.json(calendarEvents);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching calendar events', details: err.message });
  }
});
