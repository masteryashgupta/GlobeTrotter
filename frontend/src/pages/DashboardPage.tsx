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
      {/* ── Hero Banner — gradient lavender with ambient violet glow ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED]/8 via-[#F7F5FC] to-white border border-[#E9E4F5] rounded-3xl p-8 shadow-[0_8px_32px_rgba(124,58,237,0.10)]">
        {/* Ambient glow blob — the signature element */}
        <div
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle at center, rgba(124,58,237,0.15) 0%, rgba(192,132,252,0.08) 45%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#5B21B6] text-xs font-semibold mb-1">
              ✨ Smart Travel Concierge
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1523] tracking-tight font-heading">
              Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Traveler'}! ✈️
            </h1>
            <p className="text-sm text-[#6B7280] max-w-xl leading-relaxed">
              Where is your next adventure? Build itineraries, organize budgets, or discover top regional destinations.
            </p>
          </div>
          <Link to="/trips/new" className="shrink-0">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              + Plan New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Trips Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Recent Trips</h2>
          {trips.length > 0 && (
            <Link to="/trips" className="text-xs text-[#7C3AED] font-semibold hover:text-[#5B21B6] hover:underline transition-colors">
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
            {recentTrips.map((trip, i) => (
              // [STYLING] Added stagger animation via animate-fade-up + animate-stagger-N classes
              <Card
                key={trip.id}
                hoverable
                className={`cursor-pointer flex flex-col justify-between group overflow-hidden animate-fade-up animate-stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}
                onClick={() => navigate(`/trips/${trip.id}/view`)}
              >
                <div>
                  <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-[#E9E4F5] relative">
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
                  <Card.Title className="group-hover:text-[#7C3AED] transition-colors">
                    {trip.name || 'Untitled Trip'}
                  </Card.Title>
                  <p className="text-xs text-[#6B7280] mt-1">
                    📅 {trip.start_date} to {trip.end_date}
                  </p>
                  {trip.description && (
                    <p className="text-xs text-[#6B7280] mt-2 line-clamp-2">{trip.description}</p>
                  )}
                </div>
                <Card.Footer className="mt-4 pt-3">
                  <span className="text-xs text-[#7C3AED] font-semibold group-hover:underline">
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
            <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Recommended Destinations</h2>
            <p className="text-xs text-[#6B7280]">Popular cities hand-picked for your next adventure</p>
          </div>
          <Link to="/cities/search" className="text-xs text-[#7C3AED] font-semibold hover:text-[#5B21B6] hover:underline transition-colors">
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
            {popularCities.map((city, i) => (
              // [STYLING] Added stagger animation classes
              <Card
                key={city.id}
                hoverable
                className={`cursor-pointer group overflow-hidden animate-fade-up animate-stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}
                onClick={() => navigate('/cities/search')}
              >
                <div className="h-36 -mx-6 -mt-6 mb-3 overflow-hidden bg-[#E9E4F5] relative">
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
                    <h3 className="font-bold text-[#1A1523] group-hover:text-[#7C3AED] transition-colors font-heading">
                      {city.name}
                    </h3>
                    <p className="text-xs text-[#6B7280]">{city.country} • {city.region}</p>
                  </div>
                  {city.cost_index && (
                    <span className="text-xs text-[#7C3AED] font-semibold">
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
        <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Budget Highlights</h2>
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
