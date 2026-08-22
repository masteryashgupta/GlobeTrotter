import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

export const budgetRouter = Router();

// TODO: Part C - Budget & Expense routes
budgetRouter.get('/trips/:tripId/expenses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: GET /api/budget/trips/:tripId/expenses - Assigned to Part C' });
});

budgetRouter.post('/expenses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'STUB: POST /api/budget/expenses - Assigned to Part C' });
});
