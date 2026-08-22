import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { CatalogService } from '../services/catalogService';

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

/**
 * POST /api/activities/trip-activities
 * Reserved for Part B Itinerary Builder
 */
activitiesRouter.post('/trip-activities', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: POST /api/activities/trip-activities - Assigned to Part B' });
});
