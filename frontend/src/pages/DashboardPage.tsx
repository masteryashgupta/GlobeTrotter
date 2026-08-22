import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { Trip, City } from '../../../shared/types';
import { Card, Button, Badge, Skeleton, EmptyState, FilterControlBar } from '../components/ui';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* ── 1. Top Banner / Hero Image Area (Screen 3 Spec) ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED]/12 via-[#F7F5FC] to-white border border-[#E9E4F5] rounded-3xl h-64 sm:h-80 shadow-[0_8px_32px_rgba(124,58,237,0.10)] flex items-center justify-center text-center p-6">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        />
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full pointer-events-none animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle at center, rgba(124,58,237,0.20) 0%, rgba(192,132,252,0.10) 45%, transparent 70%)',
            filter: 'blur(36px)',
          }}
        />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#5B21B6] text-xs font-semibold">
            ✨ Smart Travel Concierge
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1A1523] tracking-tight font-heading">
            Banner Image — Explore the World
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280]">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Traveler'}! Build itineraries, discover top regional selections, and track your journeys.
          </p>
        </div>
      </div>

      {/* ── 2. Search Bar + Group by / Filter / Sort by Controls (Screen 3 Spec) ── */}
      <FilterControlBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search destinations, previous trips, activities..."
        selectedGroupBy={groupBy}
        onGroupByChange={setGroupBy}
        selectedFilter={filter}
        onFilterChange={setFilter}
        selectedSortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* ── 3. Top Regional Selections (Horizontal Row of 5 Square Cards) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Top Regional Selections</h2>
            <p className="text-xs text-[#6B7280]">Featured destination spots tailored for your next itinerary</p>
          </div>
          <Link to="/cities/search" className="text-xs text-[#7C3AED] font-semibold hover:text-[#5B21B6] hover:underline transition-colors">
            View All Cities →
          </Link>
        </div>

        {isCitiesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="aspect-square bg-[#F7F5FC] border border-[#E9E4F5] rounded-2xl p-3 flex flex-col justify-between">
                <Skeleton variant="rectangular" height="60%" className="w-full rounded-xl" />
                <Skeleton variant="text" width="80%" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {popularCities.slice(0, 5).map((city, i) => (
              <div
                key={city.id}
                onClick={() => navigate('/cities/search')}
                className={`aspect-square cursor-pointer group relative rounded-2xl overflow-hidden border border-[#E9E4F5] bg-[#F7F5FC] p-3 shadow-sm hover:border-[#7C3AED]/40 hover:-translate-y-1 transition-all flex flex-col justify-between animate-fade-up animate-stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}
              >
                <img
                  src={
                    city.image_url ||
                    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={city.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1523]/80 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex justify-end">
                  <Badge variant="secondary" size="sm" className="bg-white/90 text-[#1A1523]">
                    ⭐ {city.popularity}
                  </Badge>
                </div>
                <div className="relative z-10 text-white">
                  <h3 className="font-bold text-sm leading-tight truncate font-heading">{city.name}</h3>
                  <p className="text-[11px] text-slate-200 truncate">{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Previous Trips (Horizontal Row + Bottom-Right + Plan a Trip Button) ── */}
      <section className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Previous Trips</h2>
          {trips.length > 0 && (
            <Link to="/trips" className="text-xs text-[#7C3AED] font-semibold hover:text-[#5B21B6] hover:underline transition-colors">
              View all trips ({trips.length}) →
            </Link>
          )}
        </div>

        {isTripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Button variant="primary">+ Plan a Trip</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTrips.slice(0, 3).map((trip, i) => (
              <Card
                key={trip.id}
                hoverable
                className={`cursor-pointer flex flex-col justify-between group overflow-hidden animate-fade-up animate-stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}
                onClick={() => navigate(`/trips/${trip.id}/view`)}
              >
                <div>
                  <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-[#F7F5FC] relative">
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

        {/* Floating/Prominent "+ Plan a Trip" button (Bottom-Right of Trips section) */}
        <div className="flex justify-end pt-2">
          <Link to="/trips/new">
            <Button variant="primary" size="lg" className="shadow-[0_8px_24px_rgba(124,58,237,0.30)]">
              + Plan a Trip
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
