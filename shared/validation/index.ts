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
// full_name: empty string → undefined (means "don't update"), so the optional() guard fires correctly.
// avatar_url: empty string → null (means "clear avatar"), a valid URL → kept as-is.
export const profileUpdateSchema = z.object({
  full_name: z.preprocess(
    (val: unknown) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().trim().min(1, 'Full name cannot be empty').optional()
  ),
  avatar_url: z.preprocess(
    (val: unknown) => (typeof val === 'string' && val.trim() === '' ? null : val),
    z.string().min(1, 'Invalid avatar image format').nullable().optional()
  ),
  language_pref: z.enum(['en', 'es', 'fr', 'de', 'ja', 'hi']).optional(),
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP', 'JPY', 'AUD']).optional(),
});

// 4b. Profile Delete Schema
export const profileDeleteSchema = z.object({
  confirm: z.literal(true, { message: 'Confirmation flag (confirm: true) is required to delete account' }),
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
    cover_photo_url: z.string().trim().min(1, 'Invalid image URL format').optional().or(z.literal('')),
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
    cover_photo_url: z.string().trim().min(1, 'Invalid image URL format').optional().or(z.literal('')),
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
    city_id: z.string().uuid('Invalid city ID format').nullable().optional(),
    custom_city_name: z.string().trim().optional(),
    order_index: z.number().int().min(0, 'Order index must be non-negative').optional(),
    arrival_date: z.string().min(1, 'Arrival date is required'),
    departure_date: z.string().min(1, 'Departure date is required'),
  })
  .refine((data) => data.city_id || data.custom_city_name, {
    message: 'Either a city ID or a custom city name is required',
    path: ['custom_city_name'],
  })
  .refine((data) => isDateBeforeOrEqual(data.arrival_date, data.departure_date), {
    message: 'Departure date must be on or after arrival date',
    path: ['departure_date'],
  });

// 8. Trip Activity Create Schema
export const tripActivityCreateSchema = z
  .object({
    stop_id: z.string().uuid('Invalid stop ID format'),
    activity_id: z.string().uuid('Invalid activity ID format').optional().nullable(),
    custom_activity_name: z.string().trim().optional(),
    scheduled_date: z.string().optional(),
    scheduled_time: z.string().optional(),
    custom_cost: z.number().min(0, 'Cost must be non-negative').optional(),
    notes: z.string().trim().optional(),
    order_index: z.number().int().min(0).optional(),
  })
  .refine((data) => data.activity_id || data.custom_activity_name, {
    message: 'Either an activity ID or a custom activity name is required',
    path: ['custom_activity_name'],
  });

// 9. Expense Create Schema
export const expenseCreateSchema = z.object({
  trip_id: z.string().min(1, 'Invalid trip ID format').optional(),
  stop_id: z.string().min(1, 'Invalid stop ID format').nullable().optional(),
  category: z.enum(['transport', 'stay', 'activity', 'meals', 'misc']),
  label: z.string().trim().min(1, 'Label/description is required'),
  amount: z.number().gt(0, 'Amount must be greater than zero'),
});

// 10. Expense Update Schema
export const expenseUpdateSchema = z.object({
  stop_id: z.string().min(1, 'Invalid stop ID format').nullable().optional(),
  category: z.enum(['transport', 'stay', 'activity', 'meals', 'misc']).optional(),
  label: z.string().trim().min(1, 'Label cannot be empty').optional(),
  amount: z.number().gt(0, 'Amount must be greater than zero').optional(),
});

// 11. Trip Share Schema
export const tripShareSchema = z.object({
  is_public: z.boolean(),
});

// Inferred TypeScript Types
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ProfileDeleteInput = z.infer<typeof profileDeleteSchema>;
export type TripCreateInput = z.infer<typeof tripCreateSchema>;
export type TripUpdateInput = z.infer<typeof tripUpdateSchema>;
export type StopCreateInput = z.infer<typeof stopCreateSchema>;
export type TripActivityCreateInput = z.infer<typeof tripActivityCreateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
export type TripShareInput = z.infer<typeof tripShareSchema>;

export const communityPostSchema = z.object({
  location: z.string().trim().min(1, 'Location is required'),
  trip_title: z.string().trim().min(1, 'Trip title is required').max(150, 'Title too long'),
  content: z.string().trim().min(1, 'Content is required').max(2000, 'Content too long'),
  category: z.string().trim().min(1, 'Category is required'),
  image_url: z.string().url().nullable().optional(),
});
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
