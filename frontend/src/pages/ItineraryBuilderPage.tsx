import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stop, City } from '../../../shared/types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { StopCard } from '../components/builder/StopCard';
import { StopModal } from '../components/builder/StopModal';
import { DeleteStopModal } from '../components/builder/DeleteStopModal';
import { Button, Skeleton, EmptyState, Badge } from '../components/ui';

export const ItineraryBuilderPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isAddStopOpen, setIsAddStopOpen] = useState<boolean>(false);
  const [editingStop, setEditingStop] = useState<(Stop & { cities?: City }) | null>(null);
  const [deletingStop, setDeletingStop] = useState<(Stop & { cities?: City }) | null>(null);

  // 1. Fetch Trip details
  const {
    data: trip,
    isLoading: isTripLoading,
    error: tripError,
  } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTripById(tripId!),
    enabled: Boolean(tripId),
  });

  // 2. Fetch Trip Stops
  const {
    data: stops = [],
    isLoading: isStopsLoading,
    isFetching: isStopsFetching,
  } = useQuery({
    queryKey: ['trip-stops', tripId],
    queryFn: () => api.getTripStops(tripId!),
    enabled: Boolean(tripId),
  });

  // 3. Supabase Realtime Subscription for live updates across clients/tabs
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`stops_changes_${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stops',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          // Invalidate cache when stops change in real-time
          queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
          queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  const isLoading = isTripLoading || isStopsLoading;

  if (tripError) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <EmptyState
          title="Trip Not Found"
          description="We could not find the requested trip or you do not have permission to view it."
          action={
            <Button variant="primary" onClick={() => navigate('/trips')}>
              Back to My Trips
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 font-sans">
      {/* Trip Header / Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {isTripLoading ? (
          <div className="space-y-3">
            <Skeleton variant="text" width={200} height={20} />
            <Skeleton variant="text" width={320} height={36} />
            <Skeleton variant="text" width={240} height={20} />
          </div>
        ) : (
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge variant="primary" size="sm">
                  🗺️ Itinerary Builder
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
                {trip?.name || 'My Adventure'}
              </h1>

              {trip?.description && (
                <p className="text-sm text-slate-300 line-clamp-2">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={`/trips/${tripId}/view`}>
                <Button variant="outline" size="sm" className="border-slate-700">
                  👁️ View Itinerary
                </Button>
              </Link>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingStop(null);
                  setIsAddStopOpen(true);
                }}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Stop
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Itinerary Stops Section */}
      <div className="space-y-5">
        {/* Section Title & Realtime status */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Itinerary Stops ({stops.length})
            </h2>
            {isStopsFetching && !isStopsLoading && (
              <div className="flex items-center gap-1 text-xs text-teal-400">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>Syncing live...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Link
              to="/cities/search"
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              + Browse Global Cities
            </Link>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton variant="rectangular" width={64} height={64} className="rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="25%" height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stops.length === 0 ? (
          /* Empty State */
          <EmptyState
            title="No Stops in Itinerary Yet"
            description="Your adventure awaits! Add your first destination city to begin planning dates and activities."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setEditingStop(null);
                  setIsAddStopOpen(true);
                }}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Your First Stop
              </Button>
            }
          />
        ) : (
          /* Stops List */
          <div className="space-y-4">
            {stops.map((stop, idx) => (
              <StopCard
                key={stop.id}
                stop={stop}
                index={idx}
                totalStops={stops.length}
                tripId={tripId!}
                onEdit={(targetStop) => {
                  setEditingStop(targetStop);
                  setIsAddStopOpen(true);
                }}
                onDelete={(targetStop) => {
                  setDeletingStop(targetStop);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Stop Modal */}
      <StopModal
        isOpen={isAddStopOpen}
        onClose={() => {
          setIsAddStopOpen(false);
          setEditingStop(null);
        }}
        tripId={tripId!}
        editingStop={editingStop}
        tripStartDate={trip?.start_date}
        tripEndDate={trip?.end_date}
      />

      {/* Delete Confirmation Modal */}
      <DeleteStopModal
        isOpen={Boolean(deletingStop)}
        onClose={() => setDeletingStop(null)}
        stop={deletingStop}
        tripId={tripId!}
      />
    </div>
  );
};
export default ItineraryBuilderPage;
