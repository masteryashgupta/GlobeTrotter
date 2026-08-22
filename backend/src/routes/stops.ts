import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { stopCreateSchema, StopCreateInput } from '../../../shared/validation';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { Stop } from '../../../shared/types';
import { CatalogService } from '../services/catalogService';

export const stopsRouter = Router();

// In-memory fallback for local offline development
const inMemoryStops: (Stop & { cities?: any })[] = [];

/**
 * GET /api/stops?trip_id=...
 * Fetch all stops for a specific trip, ordered by order_index.
 */
stopsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.query.trip_id as string;

    if (!tripId) {
      return res.status(400).json({ error: 'Missing trip_id query parameter' });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('stops')
        .select('*, cities(*)')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (!error && data) {
        return res.json(data);
      }
    } catch {
      // Fall through to in-memory store
    }

    const matchedStops = inMemoryStops
      .filter((s) => s.trip_id === tripId)
      .sort((a, b) => a.order_index - b.order_index);

    return res.json(matchedStops);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching stops', details: err.message });
  }
});

/**
 * POST /api/stops
 * Add a stop to a trip's itinerary.
 */
stopsRouter.post(
  '/',
  requireAuth,
  validateBody(stopCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const payload: StopCreateInput = req.body;
      const ownerId = req.user!.id;

      // Verify trip exists and user is owner
      try {
        const { data: trip } = await supabaseAdmin
          .from('trips')
          .select('owner_id')
          .eq('id', payload.trip_id)
          .single();

        if (trip && (trip as any).owner_id !== ownerId) {
          return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
        }
      } catch {
        // Fall through
      }

      // Live Supabase Insert
      try {
        const { data: stop, error } = await supabaseAdmin
          .from('stops')
          .insert({
            trip_id: payload.trip_id,
            city_id: payload.city_id,
            order_index: payload.order_index,
            arrival_date: payload.arrival_date,
            departure_date: payload.departure_date,
          } as any)
          .select('*, cities(*)')
          .single();

        if (!error && stop) {
          return res.status(201).json(stop);
        }
      } catch {
        // Fall through to in-memory
      }

      // In-Memory Fallback
      const city = await CatalogService.getCityById(payload.city_id);
      const newStop: Stop & { cities?: any } = {
        id: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        trip_id: payload.trip_id,
        city_id: payload.city_id,
        order_index: payload.order_index,
        arrival_date: payload.arrival_date,
        departure_date: payload.departure_date,
        created_at: new Date().toISOString(),
        cities: city,
      };

      inMemoryStops.push(newStop);
      return res.status(201).json(newStop);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error creating stop', details: err.message });
    }
  }
);

/**
 * DELETE /api/stops/:id
 * Remove a stop from a trip.
 */
stopsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

    try {
      const { error } = await supabaseAdmin.from('stops').delete().eq('id', id);
      if (!error) {
        return res.json({ message: 'Stop deleted successfully', id });
      }
    } catch {
      // Fall through to in-memory
    }

    const idx = inMemoryStops.findIndex((s) => s.id === id);
    if (idx !== -1) {
      inMemoryStops.splice(idx, 1);
    }

    return res.json({ message: 'Stop deleted successfully', id });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error deleting stop', details: err.message });
  }
});
