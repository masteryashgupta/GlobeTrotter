import { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type City = Database['public']['Tables']['cities']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type Trip = Database['public']['Tables']['trips']['Row'];
export type Stop = Database['public']['Tables']['stops']['Row'];
export type TripActivity = Database['public']['Tables']['trip_activities']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type TripCopy = Database['public']['Tables']['trip_copies']['Row'];

export type ActivityCategory = NonNullable<Activity['category']>;
export type ExpenseCategory = NonNullable<Expense['category']>;

export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertCity = Database['public']['Tables']['cities']['Insert'];
export type InsertActivity = Database['public']['Tables']['activities']['Insert'];
export type InsertTrip = Database['public']['Tables']['trips']['Insert'];
export type InsertStop = Database['public']['Tables']['stops']['Insert'];
export type InsertTripActivity = Database['public']['Tables']['trip_activities']['Insert'];
export type InsertExpense = Database['public']['Tables']['expenses']['Insert'];
export type InsertTripCopy = Database['public']['Tables']['trip_copies']['Insert'];
