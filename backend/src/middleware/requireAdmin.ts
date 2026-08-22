import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './requireAuth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

/**
 * requireAdmin middleware
 *
 * Must run AFTER requireAuth (so req.user is populated).
 * Fetches the requesting user's profile from the DB using the service-role client
 * and checks is_admin === true. Never trusts a client-sent flag.
 * Rejects with 403 if the user is not an admin.
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No authenticated user' });
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Forbidden: Could not verify admin status' });
    }

    if (!profile.is_admin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error verifying admin status', details: err.message });
  }
};
