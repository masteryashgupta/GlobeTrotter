import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { CatalogService } from '../services/catalogService';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { TripActivity } from '../../../shared/types';

export const activitiesRouter = Router();

/**
 * GET /api/activities/search?cityId=&category=&minCost=&maxCost=&maxDuration=&limit=&q=
 * Filter activities by city, category, cost range, duration.
 * Public route (no auth required).
 */
activitiesRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const cityId = (req.query.cityId as string) || (req.query.city_id as string);
    const category = req.query.category as string;
    const minCostStr = (req.query.minCost as string) || (req.query.min_cost as string);
    const maxCostStr = (req.query.maxCost as string) || (req.query.max_cost as string);
    const maxDurationStr = (req.query.maxDuration as string) || (req.query.max_duration as string);
    const q = (req.query.q as string) || (req.query.query as string);
    const limitStr = req.query.limit as string;

    const minCost = minCostStr !== undefined ? parseFloat(minCostStr) : undefined;
    const maxCost = maxCostStr !== undefined ? parseFloat(maxCostStr) : undefined;
    const maxDuration = maxDurationStr !== undefined ? parseInt(maxDurationStr, 10) : undefined;
    const limit = limitStr !== undefined ? parseInt(limitStr, 10) : 20;

    const activities = await CatalogService.searchActivities({
      cityId,
      category,
      minCost: isNaN(minCost as number) ? undefined : minCost,
      maxCost: isNaN(maxCost as number) ? undefined : maxCost,
      maxDuration: isNaN(maxDuration as number) ? undefined : maxDuration,
      q,
      limit: isNaN(limit) ? 20 : limit,
    });

    return res.json(activities);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error searching activities', details: err.message });
  }
});

/**
 * GET /api/activities/:id
 * Single activity detail.
 * Public route.
 */
activitiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const activity = await CatalogService.getActivityById(id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    return res.json(activity);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching activity', details: err.message });
  }
});

// In-memory fallback for local offline development
const inMemoryTripActivities: (TripActivity & { activities?: any })[] = [];

/**
 * POST /api/activities/trip-activities
 * Assign an activity to a specific itinerary stop.
 */
activitiesRouter.post('/trip-activities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { stop_id, activity_id, scheduled_date, scheduled_time, custom_cost, notes, order_index } = req.body;

    if (!stop_id) {
      return res.status(400).json({ error: 'Missing stop_id' });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('trip_activities')
        .insert({
          stop_id,
          activity_id,
          scheduled_date,
          scheduled_time,
          custom_cost,
          notes,
          order_index: order_index ?? 0,
        } as any)
        .select('*, activities(*)')
        .single();

      if (!error && data) {
        return res.status(201).json(data);
      }
    } catch {
      // Fall through to memory
    }

    const activity = activity_id ? await CatalogService.getActivityById(activity_id) : null;
    const newTripActivity: TripActivity & { activities?: any } = {
      id: `trip-act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      stop_id,
      activity_id: activity_id || null,
      scheduled_date: scheduled_date || null,
      scheduled_time: scheduled_time || null,
      custom_cost: custom_cost !== undefined ? custom_cost : null,
      notes: notes || null,
      order_index: order_index ?? 0,
      created_at: new Date().toISOString(),
      activities: activity,
    };

    inMemoryTripActivities.push(newTripActivity);
    return res.status(201).json(newTripActivity);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error assigning activity to stop', details: err.message });
  }
});

// PATCH handler for trip_activities
export async function handleUpdateTripActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { scheduled_date, scheduled_time, custom_cost, notes } = req.body;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('trip_activities')
      .select('*, stops(trip_id, arrival_date, departure_date, trips(owner_id))')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Trip activity not found' });
    }

    const userId = req.user!.id;
    const ownerId = (existing as any).stops?.trips?.owner_id;
    if (ownerId && ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this trip activity' });
    }

    // Date range validation against parent stop
    if (scheduled_date && (existing as any).stops) {
      const stopArrival = (existing as any).stops.arrival_date;
      const stopDeparture = (existing as any).stops.departure_date;
      if (stopArrival && stopDeparture) {
        if (scheduled_date < stopArrival || scheduled_date > stopDeparture) {
          return res.status(400).json({
            error: `Scheduled date ${scheduled_date} is outside parent stop dates (${stopArrival} to ${stopDeparture})`,
          });
        }
      }
    }

    const updatePayload: Record<string, any> = {};
    if (scheduled_date !== undefined) updatePayload.scheduled_date = scheduled_date;
    if (scheduled_time !== undefined) updatePayload.scheduled_time = scheduled_time;
    if (custom_cost !== undefined) updatePayload.custom_cost = custom_cost;
    if (notes !== undefined) updatePayload.notes = notes;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('trip_activities')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) {
      return res.status(400).json({ error: 'Failed to update trip activity', details: updateErr.message });
    }

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error updating trip activity', details: err.message });
  }
}

// DELETE handler for trip_activities
export async function handleDeleteTripActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('trip_activities')
      .select('*, stops(trips(owner_id))')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Trip activity not found' });
    }

    const ownerId = (existing as any).stops?.trips?.owner_id;
    if (ownerId && ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this trip activity' });
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('trip_activities')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      return res.status(400).json({ error: 'Failed to delete trip activity', details: deleteErr.message });
    }

    return res.json({ message: 'Trip activity deleted successfully', id });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error deleting trip activity', details: err.message });
  }
}

activitiesRouter.patch('/trip-activities/:id', requireAuth, handleUpdateTripActivity);
activitiesRouter.delete('/trip-activities/:id', requireAuth, handleDeleteTripActivity);
