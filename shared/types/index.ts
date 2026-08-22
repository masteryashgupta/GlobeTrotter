export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  city_id: string;
  title: string;
  description?: string;
  category?: string;
  cost_estimate?: number;
  duration_hours?: number;
  image_url?: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_public: boolean;
  share_code?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: string;
  trip_id: string;
  city_id: string;
  order_index: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
}

export interface TripActivity {
  id: string;
  stop_id: string;
  activity_id?: string;
  title: string;
  scheduled_time?: string;
  notes?: string;
  cost?: number;
  completed: boolean;
  order_index: number;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  date?: string;
  created_at: string;
}

export interface TripCopy {
  id: string;
  original_trip_id: string;
  copied_by_user_id: string;
  new_trip_id: string;
  created_at: string;
}
