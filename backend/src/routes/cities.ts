import { Router, Request, Response } from 'express';
import { CatalogService } from '../services/catalogService';

export const citiesRouter = Router();

/**
 * GET /api/cities/search?q=&country=&region=&limit=
 * Full-text search on cities.name, optional filters on country & region, ordered by popularity desc.
 * Public route (no auth required).
 */
citiesRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || (req.query.query as string);
    const country = req.query.country as string;
    const region = req.query.region as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const cities = await CatalogService.searchCities({
      q,
      country,
      region,
      limit: isNaN(limit) ? 20 : limit,
    });

    return res.json(cities);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error searching cities', details: err.message });
  }
});

/**
 * GET /api/cities/popular?limit=
 * Top cities by popularity, used by Dashboard and City Search's default view.
 * Public route.
 */
citiesRouter.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const cities = await CatalogService.getPopularCities(isNaN(limit) ? 10 : limit);
    return res.json(cities);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching popular cities', details: err.message });
  }
});

/**
 * GET /api/cities/:id
 * Single city detail.
 * Public route.
 */
citiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const city = await CatalogService.getCityById(id);

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    return res.json(city);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching city', details: err.message });
  }
});
