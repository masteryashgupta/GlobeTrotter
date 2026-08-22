import { z } from 'zod';

const isDateBeforeOrEqual = (start: string, end: string) => {
  return new Date(start) <= new Date(end);
};

export const signUpSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
});

export const signInSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address format'),
});

export const profileUpdateSchema = z.object({
  full_name: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().trim().min(1, 'Full name cannot be empty').optional()
  ),
  avatar_url: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
    z.string().url('Must be a valid image URL (https://...)').nullable().optional()
  ),
  language_pref: z.enum(['en', 'es', 'fr', 'de', 'ja', 'hi']).optional(),
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP', 'JPY', 'AUD']).optional(),
});

export const profileDeleteSchema = z.object({
  confirm: z.literal(true, { message: 'Confirmation flag (confirm: true) is required to delete account' }),
});

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

export const stopCreateSchema = z
  .object({
    trip_id: z.string().uuid('Invalid trip ID format'),
    city_id: z.string().uuid('Invalid city ID format').nullable().optional(),
    custom_city_name: z.string().trim().optional(),
    order_index: z.number().int().min(0, 'Order index must be non-negative').optional(),
    arrival_date: z.string().min(1, 'Arrival date is required'),
    departure_date: z.string().min(1, 'Departure date is required'),
  })
  .refine((data: { arrival_date: string; departure_date: string }) => isDateBeforeOrEqual(data.arrival_date, data.departure_date), {
    message: 'Departure date must be on or after arrival date',
    path: ['departure_date'],
  });

export const tripActivityCreateSchema = z.object({
  stop_id: z.string().uuid('Invalid stop ID format'),
  activity_id: z.string().uuid('Invalid activity ID format').optional(),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  custom_cost: z.number().min(0, 'Cost must be non-negative').optional(),
  notes: z.string().trim().optional(),
  order_index: z.number().int().min(0).optional(),
});

export const expenseCreateSchema = z.object({
  trip_id: z.string().min(1, 'Invalid trip ID format').optional(),
  stop_id: z.string().min(1, 'Invalid stop ID format').nullable().optional(),
  category: z.enum(['transport', 'stay', 'activity', 'meals', 'misc']),
  label: z.string().trim().min(1, 'Label/description is required'),
  amount: z.number().gt(0, 'Amount must be greater than zero'),
});

export const expenseUpdateSchema = z.object({
  stop_id: z.string().min(1, 'Invalid stop ID format').nullable().optional(),
  category: z.enum(['transport', 'stay', 'activity', 'meals', 'misc']).optional(),
  label: z.string().trim().min(1, 'Label cannot be empty').optional(),
  amount: z.number().gt(0, 'Amount must be greater than zero').optional(),
});

export const tripShareSchema = z.object({
  is_public: z.boolean(),
});

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
