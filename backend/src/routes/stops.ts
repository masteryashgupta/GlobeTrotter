import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

export const stopsRouter = Router();

// TODO: Part B - Itinerary Builder Stops routes
stopsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: GET /api/stops - Assigned to Part B' });
});

stopsRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: POST /api/stops - Assigned to Part B' });
});

stopsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: DELETE /api/stops/:id - Assigned to Part B' });
});
