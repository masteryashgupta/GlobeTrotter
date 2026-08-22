import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

export const activitiesRouter = Router();

// TODO: Part B - Activity discovery & assignment routes
activitiesRouter.get('/search', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: GET /api/activities/search - Assigned to Part B' });
});

activitiesRouter.post('/trip-activities', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: POST /api/activities/trip-activities - Assigned to Part B' });
});
