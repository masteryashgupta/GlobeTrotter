import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const shareRouter = Router();

// GET /api/share/:token - Public read access to shared trip by token
shareRouter.get('/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('id, owner_id, name, description, start_date, end_date, cover_photo_url, is_public, share_token, created_at, profiles(full_name, avatar_url)')
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

// POST /api/share/:token/copy - Deep copy shared trip into authenticated user account
shareRouter.post('/:token/copy', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.params;
    const newOwnerId = req.user!.id;

    // Fetch original trip by token
    const { data: sourceTrip } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('share_token', token)
      .single();

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Shared trip not found' });
    }

    if (!sourceTrip.is_public && sourceTrip.owner_id !== newOwnerId) {
      return res.status(403).json({ error: 'Forbidden: Cannot copy private trip' });
    }

    const copyName = sourceTrip.name.startsWith('Copy of ')
      ? sourceTrip.name
      : `Copy of ${sourceTrip.name}`;

    // Create cloned trip
    const { data: newTrip, error: createTripErr } = await supabaseAdmin
      .from('trips')
      .insert({
        owner_id: newOwnerId,
        name: copyName,
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
      .eq('trip_id', sourceTrip.id);

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

    // Insert audit record
    await supabaseAdmin.from('trip_copies').insert({
      original_trip_id: sourceTrip.id,
      copied_trip_id: newTrip.id,
      copied_by: newOwnerId,
    } as any);

    return res.status(201).json(newTrip);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error copying trip', details: err.message });
  }
});
