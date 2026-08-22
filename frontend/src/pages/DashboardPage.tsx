import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { Trip, City } from '../../../shared/types';
import { Card, Button, Badge, Skeleton, EmptyState } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { user, profile, session } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1. Fetch Recent Trips via backend API or Supabase client
  const {
    data: trips = [],
    isLoading: isTripsLoading,
    error: tripsError,
  } = useQuery<Trip[]>({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const token = session?.access_token;

      try {
        const res = await fetch(`${API_BASE_URL}/trips`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend fetch failed, falling back to direct Supabase query');
      }

      // Fallback direct query if backend is offline
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!user,
  });

  // 2. Fetch Recommended Destinations (Popular Cities)
  const { data: popularCities = [], isLoading: isCitiesLoading } = useQuery<City[]>({
    queryKey: ['popular-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as City[];
    },
  });

  // 3. Supabase Realtime Subscription on trips table for current user
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`public:trips:owner=${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `owner_id=eq.${user.id}`,
        },
        () => {
          // Refetch trips query automatically when a trip is added, updated, or deleted
          queryClient.invalidateQueries({ queryKey: ['trips', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const recentTrips = trips.slice(0, 4);

  return (
    <div className="space-y-10 font-sans pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Traveler'}! ✈️
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Where is your next destination? Manage your trips or explore new places below.
          </p>
        </div>
        <Link to="/trips/new" className="shrink-0">
          <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-teal-900/30">
            + Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Recent Trips Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Recent Trips</h2>
          {trips.length > 0 && (
            <Link to="/trips" className="text-xs text-teal-400 font-semibold hover:underline">
              View all trips ({trips.length}) →
            </Link>
          )}
        </div>

        {isTripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n}>
                <Skeleton variant="rectangular" height={160} className="mb-4" />
                <Skeleton variant="text" width="70%" className="mb-2" />
                <Skeleton variant="text" width="40%" />
              </Card>
            ))}
          </div>
        ) : recentTrips.length === 0 ? (
          <EmptyState
            title="No trips created yet"
            description="Start building your first custom travel itinerary today."
            action={
              <Link to="/trips/new">
                <Button variant="primary">Create First Trip</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTrips.map((trip) => (
              <Card
                key={trip.id}
                hoverable
                className="cursor-pointer flex flex-col justify-between group overflow-hidden"
                onClick={() => navigate(`/trips/${trip.id}/view`)}
              >
                <div>
                  <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-slate-800 relative">
                    <img
                      src={
                        trip.cover_photo_url ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={trip.name || 'Trip Cover'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant={trip.is_public ? 'success' : 'neutral'}>
                        {trip.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </div>
                  <Card.Title className="group-hover:text-teal-400 transition-colors">
                    {trip.name || 'Untitled Trip'}
                  </Card.Title>
                  <p className="text-xs text-slate-400 mt-1">
                    📅 {trip.start_date} to {trip.end_date}
                  </p>
                  {trip.description && (
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{trip.description}</p>
                  )}
                </div>
                <Card.Footer className="mt-4 pt-3">
                  <span className="text-xs text-teal-400 font-semibold group-hover:underline">
                    View Itinerary →
                  </span>
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Destinations Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recommended Destinations</h2>
            <p className="text-xs text-slate-400">Popular cities hand-picked for your next adventure</p>
          </div>
          <Link to="/cities/search" className="text-xs text-teal-400 font-semibold hover:underline">
            Explore all cities →
          </Link>
        </div>

        {isCitiesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card key={n}>
                <Skeleton variant="rectangular" height={140} className="mb-3" />
                <Skeleton variant="text" width="60%" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCities.map((city) => (
              <Card
                key={city.id}
                hoverable
                className="cursor-pointer group overflow-hidden"
                onClick={() => navigate('/cities/search')}
              >
                <div className="h-36 -mx-6 -mt-6 mb-3 overflow-hidden bg-slate-800 relative">
                  <img
                    src={
                      city.image_url ||
                      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Popularity {city.popularity}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs text-slate-400">{city.country} • {city.region}</p>
                  </div>
                  {city.cost_index && (
                    <span className="text-xs text-amber-400 font-semibold">
                      {'₹'.repeat(city.cost_index)}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Budget Highlights Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Budget Highlights</h2>
        <Card>
          <Card.Header>
            <Card.Title>Expense Summary</Card.Title>
            <Card.Description>Track your travel spending and budget limits</Card.Description>
          </Card.Header>
          <Card.Content>
            {/* TODO: Wire to real expense data once Part C budget endpoints (GET /api/budget/trips/:tripId/expenses) exist */}
            <EmptyState
              title="No Expense Data Yet"
              description="Once you start adding stops and expenses to your itineraries, your budget breakdown will appear here."
              action={
                <Link to="/trips">
                  <Button variant="outline" size="sm">
                    Manage Trips
                  </Button>
                </Link>
              }
            />
          </Card.Content>
        </Card>
      </section>
    </div>
  );
};
