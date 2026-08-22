import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const TripSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_public: z.boolean().default(false),
  budget: z.number().nonnegative().optional(),
});

export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  trip_id: z.string().uuid(),
  category: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  date: z.string().optional(),
});
