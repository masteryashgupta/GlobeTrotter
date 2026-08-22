import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge, useToast, Skeleton } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../lib/api';

export const SharedTripPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copying, setCopying] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentUrl = window.location.href;

  useEffect(() => {
    const fetchSharedTrip = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/share/${token}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'This trip is not available or is no longer shared.');
        }
        const data = await res.json();
        setTrip(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Shared trip link is invalid or has been unshared.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTrip();
  }, [token]);

  const handleCopyTrip = async () => {
    if (!user) {
      addToast('warning', 'Sign In Required', 'Please sign in or create an account to copy this trip.');
      navigate(`/login?redirectTo=${encodeURIComponent(`/share/${token}`)}`);
      return;
    }

    if (!token) return;

    try {
      setCopying(true);
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(`${API_BASE_URL}/share/${token}/copy`, {
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
      addToast('success', 'Trip Copied!', `"${trip?.name}" was cloned into your account.`);
      navigate(`/trips/${newTrip.id}`);
    } catch (err: any) {
      addToast('error', 'Copy Failed', err.message || 'Could not copy this trip.');
    } finally {
      setCopying(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    addToast('success', 'Link Copied', 'Public trip link copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#1A1523] p-6 flex justify-center items-center font-sans">
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
      <div className="min-h-screen bg-white text-[#1A1523] p-6 flex flex-col justify-center items-center text-center font-sans">
        <div className="max-w-md p-8 rounded-2xl bg-[#F7F5FC] border border-[#E9E4F5] space-y-4 shadow-md">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold text-[#1A1523] font-heading">Trip Unavailable</h2>
          <p className="text-sm text-[#6B7280]">
            {errorMsg || 'This trip is not available or is no longer shared.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Explore GlobeTrotter
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
    <div className="min-h-screen bg-white text-[#1A1523] pb-12 font-sans">
      {/* Public Top Banner */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E9E4F5] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] flex items-center justify-center text-white font-black text-base font-heading">
              G
            </span>
            <span className="text-lg font-black tracking-tight text-[#1A1523] font-heading">GlobeTrotter</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copiedLink ? '✓ Copied' : '🔗 Copy Link'}
            </Button>
            <Button variant="primary" size="sm" isLoading={copying} onClick={handleCopyTrip}>
              ⚡ Copy Trip
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 py-8 animate-fade-up">
        {/* Trip Cover Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E9E4F5] bg-[#F7F5FC] shadow-[0_8px_32px_rgba(124,58,237,0.12)]">
          <div className="h-64 sm:h-80 w-full relative">
            <img
              src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1523]/80 via-[#1A1523]/30 to-transparent" />
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src={creatorAvatar} alt={creatorName} className="h-8 w-8 rounded-full border border-white/40" />
                <span className="text-xs font-semibold text-white/90">
                  Shared by <span className="text-white font-bold">{creatorName}</span>
                </span>
                <Badge variant="success">Public Itinerary</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">{trip.name}</h1>
              <p className="text-sm text-white/80 mt-1">📅 {trip.start_date} &rarr; {trip.end_date}</p>
            </div>

            <div className="bg-white/90 backdrop-blur border border-[#E9E4F5] p-4 rounded-2xl text-right shadow-sm">
              <span className="text-xs uppercase text-[#6B7280] font-bold tracking-wider">Est. Activity Cost</span>
              <p className="text-2xl font-mono font-extrabold text-[#22C55E]">₹{totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Description & Social Share */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-[#F7F5FC] border border-[#E9E4F5] p-6 rounded-2xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2 font-heading">About This Trip</h3>
            <p className="text-[#1A1523] leading-relaxed">
              {trip.description || 'No description provided for this itinerary.'}
            </p>
          </Card>

          {/* Social Share Box */}
          <Card className="bg-[#F7F5FC] border border-[#E9E4F5] p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] font-heading">Share This Trip</h3>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this trip "${trip.name}": ${currentUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 text-xs font-medium text-center rounded-xl bg-[#22C55E]/10 text-[#15803D] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 transition-colors"
              >
                Share on WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this trip "${trip.name}":`)}&url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 text-xs font-medium text-center rounded-xl bg-[#7C3AED]/10 text-[#5B21B6] border border-[#7C3AED]/20 hover:bg-[#7C3AED]/20 transition-colors"
              >
                Share on Twitter / X
              </a>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="w-full">
                {copiedLink ? '✓ Copied to Clipboard' : '🔗 Copy Share Link'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Read-Only Itinerary Stops & Activities */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Itinerary Timeline ({stops.length} Stops)</h2>
            <span className="text-xs text-[#6B7280]">Read-Only Preview</span>
          </div>

          {stops.length === 0 ? (
            <Card className="p-8 text-center bg-[#F7F5FC] border border-[#E9E4F5] rounded-2xl">
              <p className="text-[#6B7280] text-sm">No destination stops published yet for this itinerary.</p>
            </Card>
          ) : (
            stops.map((stop: any, idx: number) => {
              const cityName = stop.cities?.name || `Stop ${idx + 1}`;
              const cityCountry = stop.cities?.country || '';
              const activities = stop.activities || [];

              return (
                <Card key={stop.id} className="bg-[#F7F5FC] border border-[#E9E4F5] p-6 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E4F5] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-extrabold text-sm border border-[#7C3AED]/20">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-[#1A1523] font-heading">
                          {cityName} {cityCountry && <span className="text-[#6B7280] font-normal">({cityCountry})</span>}
                        </h3>
                        <p className="text-xs text-[#6B7280]">
                          📅 {stop.arrival_date} to {stop.departure_date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Activities */}
                  {activities.length === 0 ? (
                    <p className="text-xs text-[#6B7280] italic">No scheduled activities for this destination.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {activities.map((act: any) => {
                        const actName = act.activities?.name || 'Scheduled Activity';
                        const cat = act.activities?.category || 'other';
                        const cost = act.custom_cost ?? act.activities?.cost ?? 0;

                        return (
                          <div
                            key={act.id}
                            className="p-4 rounded-xl bg-white border border-[#E9E4F5] space-y-2 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F7F5FC] text-[#7C3AED] border border-[#E9E4F5]">
                                {cat}
                              </span>
                              <span className="text-xs font-mono font-bold text-[#15803D]">
                                ₹{Number(cost).toFixed(2)}
                              </span>
                            </div>

                            <h4 className="font-semibold text-[#1A1523] text-sm">{actName}</h4>
                            {act.activities?.description && (
                              <p className="text-xs text-[#6B7280] line-clamp-2">{act.activities.description}</p>
                            )}

                            <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
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

        {/* Floating / Sticky Bottom Call to Action */}
        <div className="sticky bottom-6 bg-white/95 backdrop-blur border border-[#E9E4F5] p-4 rounded-2xl shadow-[0_8px_32px_rgba(124,58,237,0.15)] flex items-center justify-between gap-4 z-20">
          <div>
            <h4 className="font-bold text-[#1A1523] text-sm font-heading">Want to customize this trip?</h4>
            <p className="text-xs text-[#6B7280]">Copy this itinerary into your account to edit stops, dates, and budget tracking.</p>
          </div>
          <Button variant="primary" isLoading={copying} onClick={handleCopyTrip} className="whitespace-nowrap">
            ⚡ Copy Trip
          </Button>
        </div>
      </main>
    </div>
  );
};
