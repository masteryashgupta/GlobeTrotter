import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const authRouter = Router();

/**
 * POST /api/auth/signup
 * Admin signup endpoint that bypasses Supabase Cloud Auth email rate limits
 * and auto-confirms user accounts immediately.
 */
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use admin client to bypass rate limits and auto-confirm email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.status === 422) {
        return res.status(400).json({ error: 'User already registered. Please sign in instead.' });
      }
      return res.status(400).json({ error: error.message });
    }

    // Ensure profile row exists in public.profiles
    if (data.user) {
      await supabaseAdmin.from('profiles').upsert(
        {
          id: data.user.id,
          full_name: fullName || '',
          language_pref: 'en',
          is_admin: false,
        },
        { onConflict: 'id' }
      );
    }

    return res.status(201).json({
      message: 'Account created successfully',
      user: data.user,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error during signup', details: err.message });
  }
});
