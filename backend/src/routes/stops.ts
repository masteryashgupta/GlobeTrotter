import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { stopCreateSchema } from '../shared/validation';
import { StopService } from '../services/stopService';
import { TripActivityService } from '../services/tripActivityService';

export const stopsRouter = Router();

/**
 * GET /api/stops?trip_id=...
 * List all stops for a specific trip, ordered by order_index ASC.
 */
stopsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = req.query.trip_id as string;
    if (!tripId) {
      return res.status(400).json({ error: 'Missing trip_id query parameter' });
    }

    const stops = await StopService.getStopsByTripId(tripId);
    return res.json(stops);
  } catch (err: any) {
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message || 'Server error fetching stops' });
  }
});

/**
 * GET /api/stops/:id
 * Fetch single stop with joined city info.
 */
stopsRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const stop = await StopService.getStopById(id);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    return res.json(stop);
  } catch (err: any) {
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message || 'Server error fetching stop' });
  }
});

/**
 * POST /api/stops
 * Create a new stop for a trip (with overlap validation and auto order_index).
 */
stopsRouter.post(
  '/',
  requireAuth,
  validateBody(stopCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { trip_id, city_id, arrival_date, departure_date, order_index } = req.body;
      const userId = req.user!.id;

      const stop = await StopService.createStop({
        tripId: trip_id,
        cityId: city_id,
        arrivalDate: arrival_date,
        departureDate: departure_date,
        orderIndex: order_index,
        userId,
      });

      return res.status(201).json(stop);
    } catch (err: any) {
      return res
        .status(err.statusCode || 500)
        .json({ error: err.message || 'Server error creating stop' });
    }
  }
);

/**
 * PATCH /api/stops/:id
 * Update stop dates, city, or order_index, re-running overlap check excluding itself.
 */
stopsRouter.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const { city_id, custom_city_name, arrival_date, departure_date, order_index } = req.body;
    const userId = req.user!.id;

    const updated = await StopService.updateStop(
      id,
      {
        city_id,
        custom_city_name,
        arrival_date,
        departure_date,
        order_index,
      },
      userId
    );

    return res.json(updated);
  } catch (err: any) {
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message || 'Server error updating stop' });
  }
});

/**
 * DELETE /api/stops/:id
 * Delete stop (cascades to trip_activities).
 */
stopsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const userId = req.user!.id;

    const result = await StopService.deleteStop(id, userId);
    return res.json(result);
  } catch (err: any) {
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message || 'Server error deleting stop' });
  }
});

/**
 * GET /api/stops/:stopId/activities
 * List activities assigned to a stop, joined with activity details.
 */
stopsRouter.get('/:stopId/activities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stopId = Array.isArray(req.params.stopId) ? req.params.stopId[0] : (req.params.stopId as string);
    const activities = await TripActivityService.getActivitiesByStopId(stopId);
    return res.json(activities);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error fetching stop activities' });
  }
});

/**
 * POST /api/stops/:stopId/activities
 * Assign an activity to a stop with scheduled_date boundary validation.
 */
stopsRouter.post('/:stopId/activities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stopId = Array.isArray(req.params.stopId) ? req.params.stopId[0] : (req.params.stopId as string);
    const { activity_id, scheduled_date, scheduled_time, custom_cost, notes, order_index } = req.body;
    const userId = req.user!.id;

    const assigned = await TripActivityService.assignActivityToStop({
      stopId,
      activityId: activity_id,
      scheduledDate: scheduled_date,
      scheduledTime: scheduled_time,
      customCost: custom_cost !== undefined ? parseFloat(custom_cost) : undefined,
      notes,
      orderIndex: order_index !== undefined ? parseInt(order_index, 10) : undefined,
      userId,
    });

    return res.status(201).json(assigned);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error assigning activity' });
  }
});

/**
 * PATCH /api/stops/:stopId/activities/reorder
 * Bulk reorder activities for a stop.
 */
stopsRouter.patch('/:stopId/activities/reorder', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stopId = Array.isArray(req.params.stopId) ? req.params.stopId[0] : (req.params.stopId as string);
    const activityIds = req.body.activity_ids || req.body.activityIds || req.body;
    const userId = req.user!.id;

    if (!Array.isArray(activityIds)) {
      return res.status(400).json({ error: 'activity_ids must be an array of IDs' });
    }

    const reordered = await TripActivityService.reorderTripActivities(stopId, activityIds, userId);
    return res.json(reordered);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error reordering activities' });
  }
});
