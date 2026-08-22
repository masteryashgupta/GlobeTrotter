import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { tripCreateSchema, tripUpdateSchema, TripCreateInput, TripUpdateInput } from '../../../shared/validation';
import { supabaseAdmin } from '../lib/supabaseAdmin';

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

// 6. POST /api/trips/:id/share - Toggle public sharing & generate share token
tripsRouter.post('/:id/share', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.params.id;
    const userId = req.user!.id;
    const { is_public } = req.body;

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
    if (is_public && !shareToken) {
      shareToken = crypto.randomUUID();
    }

    const { data: updatedTrip, error } = await supabaseAdmin
      .from('trips')
      .update({
        is_public: !!is_public,
        share_token: shareToken,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', tripId)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update share settings', details: error.message });
    }

    return res.json({
      id: updatedTrip.id,
      is_public: updatedTrip.is_public,
      share_token: updatedTrip.share_token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error updating share settings', details: err.message });
  }
});

// 7. GET /api/trips/share/:token - Get public shared trip by token
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

    // Fetch nested stops & activities
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

// 8. POST /api/trips/:id/copy - Copy/clone a trip to user's account
tripsRouter.post('/:id/copy', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sourceTripId = req.params.id;
    const newOwnerId = req.user!.id;

    // Fetch source trip
    const { data: sourceTrip } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', sourceTripId)
      .single();

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Source trip not found' });
    }

    // Check authorization: must be owner OR public
    if (!sourceTrip.is_public && sourceTrip.owner_id !== newOwnerId) {
      return res.status(403).json({ error: 'Forbidden: Cannot copy private trip' });
    }

    // Create new trip
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

    // Copy stops & activities
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

    // Record copy lineage in trip_copies
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

