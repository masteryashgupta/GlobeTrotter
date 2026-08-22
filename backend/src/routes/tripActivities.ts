import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { TripActivityService } from '../services/tripActivityService';

import { tripActivityCreateSchema } from '../../../shared/validation';
import { validateBody } from '../middleware/validateBody';

export const tripActivitiesRouter = Router({ mergeParams: true });

/**
 * GET /api/stops/:stopId/activities
 * List activities assigned to a stop, joined with activity details.
 */
tripActivitiesRouter.get('/stops/:stopId/activities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
tripActivitiesRouter.post(
  '/stops/:stopId/activities',
  requireAuth,
  validateBody(tripActivityCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
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
 * PATCH /api/trip-activities/:id
 * Update scheduled date/time, custom cost, or notes.
 */
tripActivitiesRouter.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const { scheduled_date, scheduled_time, custom_cost, notes, order_index } = req.body;
    const userId = req.user!.id;

    const updated = await TripActivityService.updateTripActivity(
      id,
      {
        scheduled_date,
        scheduled_time,
        custom_cost: custom_cost !== undefined ? (custom_cost === null ? null : parseFloat(custom_cost)) : undefined,
        notes,
        order_index: order_index !== undefined ? parseInt(order_index, 10) : undefined,
      },
      userId
    );

    return res.json(updated);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error updating trip activity' });
  }
});

/**
 * DELETE /api/trip-activities/:id
 * Remove an activity from a stop.
 */
tripActivitiesRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const userId = req.user!.id;

    const result = await TripActivityService.deleteTripActivity(id, userId);
    return res.json(result);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error deleting trip activity' });
  }
});

/**
 * PATCH /api/stops/:stopId/activities/reorder
 * Bulk reorder activities for a stop.
 */
tripActivitiesRouter.patch('/stops/:stopId/activities/reorder', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
