import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { stopCreateSchema } from '../../../shared/validation';
import { StopService } from '../services/stopService';

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
    const { city_id, arrival_date, departure_date, order_index } = req.body;
    const userId = req.user!.id;

    const updated = await StopService.updateStop(
      id,
      {
        city_id,
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
