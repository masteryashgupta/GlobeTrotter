import { z } from 'zod';

// Helper for date string comparisons (YYYY-MM-DD)
const isDateBeforeOrEqual = (start: string, end: string) => {
  return new Date(start) <= new Date(end);
};

// 1. Sign Up Schema
export const signUpSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
});

// 2. Sign In Schema
export const signInSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

// 3. Reset Password Schema
export const resetPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address format'),
});

// 4. Profile Update Schema
export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  avatar_url: z.string().trim().url('Invalid image URL format').optional().or(z.literal('')),
  language_pref: z.enum(['en', 'es', 'fr', 'de', 'ja']).default('en'),
});

// 5. Trip Create Schema
export const tripCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Trip name is required')
      .max(100, 'Trip name must not exceed 100 characters'),
    description: z.string().trim().max(1000, 'Description must not exceed 1000 characters').optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    cover_photo_url: z.string().trim().url('Invalid image URL format').optional().or(z.literal('')),
    is_public: z.boolean().optional(),
  })
  .refine((data: { start_date: string; end_date: string }) => isDateBeforeOrEqual(data.start_date, data.end_date), {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

// 6. Trip Update Schema
export const tripUpdateSchema = z
  .object({
    name: z.string().trim().min(1, 'Trip name cannot be empty').max(100, 'Trip name must not exceed 100 characters').optional(),
    description: z.string().trim().max(1000, 'Description must not exceed 1000 characters').optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    cover_photo_url: z.string().trim().url('Invalid image URL format').optional().or(z.literal('')),
    is_public: z.boolean().optional(),
  })
  .refine(
    (data: { start_date?: string; end_date?: string }) => {
      if (data.start_date && data.end_date) {
        return isDateBeforeOrEqual(data.start_date, data.end_date);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['end_date'],
    }
  );

// 7. Stop Create Schema
export const stopCreateSchema = z
  .object({
    trip_id: z.string().uuid('Invalid trip ID format'),
    city_id: z.string().uuid('Invalid city ID format'),
    order_index: z.number().int().min(0, 'Order index must be non-negative'),
    arrival_date: z.string().min(1, 'Arrival date is required'),
    departure_date: z.string().min(1, 'Departure date is required'),
  })
  .refine((data: { arrival_date: string; departure_date: string }) => isDateBeforeOrEqual(data.arrival_date, data.departure_date), {
    message: 'Departure date must be on or after arrival date',
    path: ['departure_date'],
  });

// 8. Trip Activity Create Schema
export const tripActivityCreateSchema = z.object({
  stop_id: z.string().uuid('Invalid stop ID format'),
  activity_id: z.string().uuid('Invalid activity ID format').optional(),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  custom_cost: z.number().min(0, 'Cost must be non-negative').optional(),
  notes: z.string().trim().optional(),
  order_index: z.number().int().min(0).optional(),
});

// 9. Expense Create Schema
export const expenseCreateSchema = z.object({
  trip_id: z.string().uuid('Invalid trip ID format'),
  stop_id: z.string().uuid('Invalid stop ID format').optional(),
  category: z.enum(['transport', 'stay', 'activity', 'meals', 'misc']),
  label: z.string().trim().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
});

// Inferred TypeScript Types
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type TripCreateInput = z.infer<typeof tripCreateSchema>;
export type TripUpdateInput = z.infer<typeof tripUpdateSchema>;
export type StopCreateInput = z.infer<typeof stopCreateSchema>;
export type TripActivityCreateInput = z.infer<typeof tripActivityCreateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
