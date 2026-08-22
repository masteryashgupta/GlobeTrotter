import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge, useToast, Skeleton } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const SharedTripPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copying, setCopying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/trips/share/${token}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Shared trip not found or private');
        }
        const data = await res.json();
        setTrip(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Shared trip link is invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTrip();
  }, [token]);

  const handleCopyTrip = async () => {
    if (!user) {
      addToast(
        'warning',
        'Sign In Required',
        'Please sign in or create an account to copy this trip itinerary.'
      );
      navigate('/login');
      return;
    }

    if (!trip) return;

    try {
      setCopying(true);
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(`http://localhost:5000/api/trips/${trip.id}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to copy trip');
      }

      const newTrip = await res.json();
      addToast(
        'success',
        'Trip Copied!',
        `"${trip.name}" was cloned into your My Trips dashboard!`
      );

      navigate(`/trips`);
    } catch (err: any) {
      addToast(
        'error',
        'Copy Failed',
        err.message || 'Could not copy this trip.'
      );
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex justify-center items-center">
        <div className="max-w-4xl w-full space-y-6">
          <Skeleton className="h-64 rounded-2xl w-full" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (errorMsg || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-center items-center text-center">
        <div className="max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold text-white">Trip Unavailable</h2>
          <p className="text-sm text-slate-400">{errorMsg || 'This trip is private or link has expired.'}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const creatorName = trip.profiles?.full_name || 'GlobeTrotter Traveler';
  const creatorAvatar = trip.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  const stops = trip.stops || [];

  // Total activity cost calculation
  let totalCost = 0;
  stops.forEach((stop: any) => {
    (stop.activities || []).forEach((act: any) => {
      totalCost += Number(act.custom_cost ?? act.activities?.cost ?? 0);
    });
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
            <span>🌐</span>
            <span>GlobeTrotter</span>
          </Link>
          <Button variant="primary" isLoading={copying} onClick={handleCopyTrip}>
            ⚡ Copy Trip to My Account
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 py-8">
        {/* Trip Cover Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
          <div className="h-64 sm:h-80 w-full relative">
            <img
              src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src={creatorAvatar} alt={creatorName} className="h-8 w-8 rounded-full border border-emerald-500/40" />
                <span className="text-xs font-semibold text-slate-300">Shared by <span className="text-emerald-400 font-bold">{creatorName}</span></span>
                <Badge variant="success">Public Itinerary</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{trip.name}</h1>
              <p className="text-sm text-slate-300 mt-1">📅 {trip.start_date} &rarr; {trip.end_date}</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-xl text-right">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Est. Activity Cost</span>
              <p className="text-2xl font-mono font-extrabold text-emerald-400">${totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">About This Trip</h3>
            <p className="text-slate-300 leading-relaxed">{trip.description}</p>
          </Card>
        )}

        {/* Stops & Activities Timeline */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Itinerary Timeline ({stops.length} Stops)</h2>

          {stops.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">No stops published yet for this itinerary.</p>
            </Card>
          ) : (
            stops.map((stop: any, idx: number) => {
              const cityName = stop.cities?.name || `Stop ${idx + 1}`;
              const cityCountry = stop.cities?.country || '';
              const activities = stop.activities || [];

              return (
                <Card key={stop.id} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-sm border border-emerald-500/20">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {cityName} {cityCountry && <span className="text-slate-400 font-normal">({cityCountry})</span>}
                        </h3>
                        <p className="text-xs text-slate-400">
                          📅 {stop.arrival_date} to {stop.departure_date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Activities */}
                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No scheduled activities for this destination.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {activities.map((act: any) => {
                        const actName = act.activities?.name || 'Scheduled Activity';
                        const cat = act.activities?.category || 'other';
                        const cost = act.custom_cost ?? act.activities?.cost ?? 0;

                        return (
                          <div
                            key={act.id}
                            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                                {cat}
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                ${Number(cost).toFixed(2)}
                              </span>
                            </div>

                            <h4 className="font-semibold text-white text-sm">{actName}</h4>
                            {act.activities?.description && (
                              <p className="text-xs text-slate-400 line-clamp-2">{act.activities.description}</p>
                            )}

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                              <span>📅 {act.scheduled_date || stop.arrival_date}</span>
                              <span>⏰ {act.scheduled_time || '10:00'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Floating / Bottom Call to Action */}
        <div className="sticky bottom-6 bg-slate-900/90 backdrop-blur border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-sm">Love this itinerary?</h4>
            <p className="text-xs text-slate-400">Copy it into your account to customize stops, dates, and budgets.</p>
          </div>
          <Button variant="primary" isLoading={copying} onClick={handleCopyTrip} className="whitespace-nowrap">
            Copy Trip
          </Button>
        </div>
      </main>
    </div>
  );
};
