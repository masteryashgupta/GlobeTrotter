import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import {
  profileUpdateSchema,
  profileDeleteSchema,
  ProfileUpdateInput,
} from '../shared/validation';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const profileRouter = Router();

/**
 * 1. GET /api/profile
 * Returns current authenticated user's profile.
 */
profileRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json(profile);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching profile', details: err.message });
  }
});

/**
 * 2. PATCH /api/profile
 * Updates full_name, avatar_url, language_pref for the current user.
 */
profileRouter.patch(
  '/',
  requireAuth,
  validateBody(profileUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const payload: ProfileUpdateInput = req.body;

      // Filter payload to defined properties
      const updateData: Record<string, any> = {};
      if (payload.full_name !== undefined) updateData.full_name = payload.full_name;
      if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url;
      if (payload.language_pref !== undefined) updateData.language_pref = payload.language_pref;
      if (payload.currency !== undefined) updateData.currency = payload.currency;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
      }

      const { data: updatedProfile, error } = await supabaseAdmin
        .from('profiles')
        .update(updateData as any)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        return res.status(400).json({ error: 'Failed to update profile', details: error.message });
      }

      return res.json(updatedProfile);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error updating profile', details: err.message });
    }
  }
);

/**
 * 3. DELETE /api/profile
 * Deletes user's account via Supabase Admin API (`auth.admin.deleteUser`).
 * Database FK ON DELETE CASCADE removes profiles, trips, stops, trip_activities, expenses, trip_copies.
 * Requires `confirm: true` in request body to prevent accidental deletion.
 */
profileRouter.delete(
  '/',
  requireAuth,
  validateBody(profileDeleteSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Execute Supabase Auth Admin delete (cascades to profiles and all owner resources in Postgres)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        return res.status(400).json({ error: 'Failed to delete account', details: deleteError.message });
      }

      return res.status(200).json({ message: 'Account deleted successfully', id: userId });
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error deleting account', details: err.message });
    }
  }
);

/**
 * 4. GET /api/profile/saved-destinations
 * Returns distinct set of cities the user has included as stops across any of their trips.
 * (Defined via relational join on trips -> stops -> cities).
 */
profileRouter.get('/saved-destinations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch user's trips
    const { data: userTrips, error: tripsError } = await supabaseAdmin
      .from('trips')
      .select('id')
      .eq('owner_id', userId);

    if (tripsError) {
      return res.status(400).json({ error: 'Failed to fetch user trips', details: tripsError.message });
    }

    if (!userTrips || userTrips.length === 0) {
      return res.json([]);
    }

    const tripIds = userTrips.map((t) => t.id);

    // Query stops for these trips with joined city info
    const { data: stops, error: stopsError } = await supabaseAdmin
      .from('stops')
      .select('city_id, cities(*)')
      .in('trip_id', tripIds);

    if (stopsError) {
      return res.status(400).json({ error: 'Failed to fetch saved destinations', details: stopsError.message });
    }

    // Extract unique cities
    const cityMap = new Map<string, any>();
    (stops || []).forEach((stop: any) => {
      if (stop.cities && stop.cities.id) {
        cityMap.set(stop.cities.id, stop.cities);
      }
    });

    const uniqueCities = Array.from(cityMap.values());
    return res.json(uniqueCities);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching saved destinations', details: err.message });
  }
});
