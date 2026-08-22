import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const activitiesRouter = Router();

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
