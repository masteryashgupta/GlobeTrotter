import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

export const adminRouter = Router();

// TODO: Part D - Admin panel routes
adminRouter.get('/stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: GET /api/admin/stats - Assigned to Part D' });
});
