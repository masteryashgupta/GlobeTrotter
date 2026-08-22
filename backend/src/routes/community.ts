import { Router, Response, Request } from 'express';
import { requireAuth, AuthenticatedRequest, optionalAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { communityPostSchema, CommunityPostInput } from '../shared/validation';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const communityRouter = Router();

/**
 * 1. GET /api/community
 * List all community posts, optionally filtered by search/category.
 */
communityRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('community_posts')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. POST /api/community
 * Create a new community post
 */
communityRouter.post(
  '/',
  requireAuth,
  validateBody(communityPostSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const payload: CommunityPostInput = req.body;

      const { data, error } = await supabaseAdmin
        .from('community_posts')
        .insert({
          user_id: userId,
          location: payload.location,
          trip_title: payload.trip_title,
          content: payload.content,
          category: payload.category,
          image_url: payload.image_url || null,
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * 3. POST /api/community/:id/like
 * Like a post
 */
communityRouter.post('/:id/like', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.id;

    // Fetch current likes to increment. In a real app we'd use an RPC or a junction table.
    // For simplicity, we just use RPC or increment here.
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('community_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { data, error } = await supabaseAdmin
      .from('community_posts')
      .update({ likes_count: post.likes_count + 1 })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
