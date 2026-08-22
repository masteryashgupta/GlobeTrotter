import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Button, Badge, Skeleton, EmptyState, Card } from '../components/ui';
import { formatCost, getCategoryBadgeVariant } from '../components/activities/ActivityCard';
import { Activity } from '../../../shared/types';

export const ItineraryViewPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'timeline' | 'grouped'>('timeline');

  // Fetch aggregated trip timeline
  const {
    data: timelineData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['trip-timeline', tripId],
    queryFn: () => api.getTripTimeline(tripId!),
    enabled: Boolean(tripId),
  });

  // Supabase Realtime Subscription for live updates across clients/tabs
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`view_realtime_${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stops',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          // Live sync timeline when stops are added, edited, reordered, or deleted
          queryClient.invalidateQueries({ queryKey: ['trip-timeline', tripId] });
          queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
          queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_activities',
        },
        () => {
          // Live sync timeline when activities are scheduled, edited, reordered, or deleted
          queryClient.invalidateQueries({ queryKey: ['trip-timeline', tripId] });
          queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  if (error) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <EmptyState
          title="Trip Timeline Unavailable"
          description="We couldn't retrieve the itinerary timeline. You may not have access or the trip does not exist."
          action={
            <Button variant="primary" onClick={() => navigate('/trips')}>
              Back to My Trips
            </Button>
          }
        />
      </div>
    );
  }

  const trip = timelineData?.trip;
  const days = timelineData?.days || [];
  const stops = timelineData?.stops || [];
  const summary = timelineData?.summary;

  const formatDateTitle = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeStr = (timeStr?: string | null) => {
    if (!timeStr) return 'Flexible Time';
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="py-6 space-y-8 font-sans">
      {/* Trip Overview Header Hero */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton variant="text" width={220} height={24} />
            <Skeleton variant="text" width={380} height={40} />
            <Skeleton variant="rectangular" width="100%" height={60} className="rounded-2xl" />
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Trip Title & Subtitle */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant="primary" size="sm">
                    ✈️ Full Itinerary View
                  </Badge>
                  {trip?.is_public && (
                    <Badge variant="success" size="sm">
                      Public Trip
                    </Badge>
                  )}
                  {trip && (
                    <span className="text-xs text-slate-400 font-medium">
                      📅 {trip.start_date} → {trip.end_date}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {trip?.name || 'Itinerary'}
                </h1>

                {trip?.description && (
                  <p className="text-sm text-slate-300 max-w-xl">
                    {trip.description}
                  </p>
                )}
              </div>

              {/* Header Action CTAs */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link to={`/trips/${tripId}/build`}>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    }
                  >
                    Edit in Builder
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="md"
                  className="border-slate-700"
                  onClick={() => window.print()}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  }
                >
                  Print
                </Button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
              <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Duration</span>
                <span className="text-lg font-extrabold text-white">
                  {summary?.total_days || days.length} Days
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Destinations</span>
                <span className="text-lg font-extrabold text-teal-400">
                  {summary?.total_stops || stops.length} Cities
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Activities</span>
                <span className="text-lg font-extrabold text-white">
                  {summary?.total_activities || 0} Scheduled
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Est. Activity Cost</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {formatCost(summary?.total_estimated_cost || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Controls Bar: View Mode Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📅</span>
              <span>Day-by-Day Timeline</span>
            </button>

            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grouped'
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🏙️</span>
              <span>Grouped by City</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {viewMode === 'timeline'
              ? `Showing ${days.length} days of adventure`
              : `Showing ${stops.length} destination stops`}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton variant="circular" width={44} height={44} />
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="20%" height={16} />
                  </div>
                </div>
                <Skeleton variant="rectangular" height={80} className="rounded-2xl" />
              </div>
            ))}
          </div>
        ) : stops.length === 0 ? (
          /* Empty State */
          <EmptyState
            title="Your Itinerary is Empty"
            description="You haven't added any destinations or activities yet. Jump into the Itinerary Builder to plan your trip!"
            action={
              <Link to={`/trips/${tripId}/build`}>
                <Button variant="primary">
                  Open Itinerary Builder
                </Button>
              </Link>
            }
          />
        ) : viewMode === 'timeline' ? (
          /* 1. Day-by-Day Timeline View */
          <div className="space-y-6">
            {days.map((day) => {
              const activities = day.activities || [];
              return (
                <div
                  key={day.date}
                  className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl transition-all hover:border-slate-700/80"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                        D{day.day_number}
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-extrabold text-white tracking-tight">
                            {formatDateTitle(day.date)}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">({day.date})</span>
                        </div>

                        {day.city ? (
                          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold mt-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{day.city.name}, {day.city.country}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Transit / Free Date</span>
                        )}
                      </div>
                    </div>

                    {/* Activities count pill */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Badge variant={activities.length > 0 ? 'primary' : 'neutral'} size="sm">
                        {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                      </Badge>
                    </div>
                  </div>

                  {/* Day Activities List */}
                  {activities.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
                      <p className="text-xs text-slate-400">
                        {day.city
                          ? `Free day in ${day.city.name} — explore at your own leisure or add experiences in the builder.`
                          : 'No destination stop active on this date.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {activities.map((act) => {
                        const activityObj = (act.activities || {}) as Partial<Activity>;
                        const categoryVariant = getCategoryBadgeVariant(activityObj.category);
                        return (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-2xl gap-3 transition-all hover:border-slate-700"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={
                                  activityObj.image_url ||
                                  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'
                                }
                                alt={activityObj.name || 'Activity'}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80';
                                }}
                              />

                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                    {activityObj.name || 'Experience'}
                                  </h4>
                                  {activityObj.category && (
                                    <Badge variant={categoryVariant} size="sm" className="capitalize text-[10px]">
                                      {activityObj.category}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                  <span className="text-teal-300 font-semibold flex items-center gap-1">
                                    🕒 {formatTimeStr(act.scheduled_time)}
                                  </span>
                                  {act.notes && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-xs text-slate-400">
                                        📝 {act.notes}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <span className="text-xs font-extrabold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 block">
                                {formatCost(act.custom_cost !== null && act.custom_cost !== undefined ? act.custom_cost : activityObj.cost)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. Grouped-by-City View Mode */
          <div className="space-y-6">
            {stops.map((stop, stopIdx) => {
              const activities = stop.trip_activities || [];
              const arrival = new Date(stop.arrival_date);
              const departure = new Date(stop.departure_date);
              const nights = Math.max(1, Math.ceil(Math.abs(departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={stop.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl transition-all hover:border-slate-700/80"
                >
                  {/* City Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                        {stopIdx + 1}
                      </div>

                      <img
                        src={
                          stop.cities?.image_url ||
                          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={stop.cities?.name || 'City'}
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';
                        }}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-extrabold text-white tracking-tight">
                            {stop.cities?.name || 'Destination'}
                          </h3>
                          {stop.cities?.region && (
                            <Badge variant="neutral" size="sm">
                              {stop.cities.region}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                          {stop.cities?.country}
                        </p>
                      </div>
                    </div>

                    {/* Stay Dates Pill */}
                    <div className="flex items-center gap-3 self-start sm:self-center bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                      <div className="text-left">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Stay Window</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-200">
                          {stop.arrival_date} → {stop.departure_date}
                        </span>
                      </div>
                      <Badge variant="primary" size="sm">
                        {nights} {nights === 1 ? 'Night' : 'Nights'}
                      </Badge>
                    </div>
                  </div>

                  {/* Scheduled Activities for this City */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Scheduled Experiences ({activities.length})
                    </h4>

                    {activities.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
                        <p className="text-xs text-slate-400">
                          No activities scheduled in {stop.cities?.name} yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activities.map((act) => {
                          const actObj = (act.activities || {}) as Partial<Activity>;
                          return (
                            <div
                              key={act.id}
                              className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={actObj.image_url || ''}
                                  alt={actObj.name}
                                  className="w-10 h-10 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                                />
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-white truncate">{actObj.name}</h5>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                    {act.scheduled_date && <span>📅 {act.scheduled_date}</span>}
                                    {act.scheduled_time && <span>🕒 {formatTimeStr(act.scheduled_time)}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0">
                                <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                  {formatCost(act.custom_cost !== null && act.custom_cost !== undefined ? act.custom_cost : actObj.cost)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default ItineraryViewPage;
