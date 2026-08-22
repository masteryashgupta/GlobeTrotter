-- 0001_initial_schema.sql
-- GlobeTrotter Relational Database Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  language_pref TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cities Table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  cost_index INT CHECK (cost_index BETWEEN 1 AND 5),
  popularity INT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('sightseeing', 'food', 'adventure', 'nightlife', 'culture', 'shopping', 'other')),
  description TEXT,
  cost NUMERIC(10,2) CHECK (cost >= 0),
  duration_minutes INT CHECK (duration_minutes > 0),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  cover_photo_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Stops Table
CREATE TABLE IF NOT EXISTS public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.cities(id),
  order_index INT NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL CHECK (departure_date >= arrival_date),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trip Activities Table
CREATE TABLE IF NOT EXISTS public.trip_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id),
  scheduled_date DATE,
  scheduled_time TIME,
  custom_cost NUMERIC(10,2) CHECK (custom_cost >= 0),
  notes TEXT,
  order_index INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES public.stops(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('transport', 'stay', 'activity', 'meals', 'misc')),
  label TEXT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Trip Copies Table
CREATE TABLE IF NOT EXISTS public.trip_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  copied_trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  copied_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stops_trip_order ON public.stops(trip_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trip_activities_stop_date ON public.trip_activities(stop_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON public.trips(share_token);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_activities_city_category ON public.activities(city_id, category);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_copies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Master Data (Cities & Activities)
CREATE POLICY "Cities are viewable by everyone" ON public.cities
  FOR SELECT USING (true);
CREATE POLICY "Activities are viewable by everyone" ON public.activities
  FOR SELECT USING (true);

-- RLS Policies for Trips
CREATE POLICY "Users can manage own trips" ON public.trips
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Anyone can view public trips" ON public.trips
  FOR SELECT USING (is_public = true);

-- RLS Policies for Stops
CREATE POLICY "Users can manage stops of own trips" ON public.stops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = stops.trip_id AND trips.owner_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can view stops of public trips" ON public.stops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = stops.trip_id AND trips.is_public = true
    )
  );

-- RLS Policies for Trip Activities
CREATE POLICY "Users can manage activities of own trips" ON public.trip_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stops
      JOIN public.trips ON trips.id = stops.trip_id
      WHERE stops.id = trip_activities.stop_id AND trips.owner_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can view activities of public trips" ON public.trip_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stops
      JOIN public.trips ON trips.id = stops.trip_id
      WHERE stops.id = trip_activities.stop_id AND trips.is_public = true
    )
  );

-- RLS Policies for Expenses
CREATE POLICY "Users can manage expenses of own trips" ON public.expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id AND trips.owner_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can view expenses of public trips" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id AND trips.is_public = true
    )
  );

-- RLS Policies for Trip Copies
CREATE POLICY "Users can view own trip copies" ON public.trip_copies
  FOR SELECT USING (auth.uid() = copied_by);
CREATE POLICY "Users can insert own trip copies" ON public.trip_copies
  FOR INSERT WITH CHECK (auth.uid() = copied_by);

-- Enable Supabase Realtime for trips, stops, trip_activities, expenses
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
