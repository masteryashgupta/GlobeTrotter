import { Router, Request, Response } from 'express';

export const citiesRouter = Router();

// TODO: Part B - City discovery routes
citiesRouter.get('/search', (req: Request, res: Response) => {
  res.json({ message: 'STUB: GET /api/cities/search - Assigned to Part B' });
});

citiesRouter.get('/:id', (req: Request, res: Response) => {
  res.json({ message: 'STUB: GET /api/cities/:id - Assigned to Part B' });
});
