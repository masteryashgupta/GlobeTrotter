import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { Stop, City } from '../../../shared/types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { SortableStopCard } from '../components/builder/SortableStopCard';
import { StopModal } from '../components/builder/StopModal';
import { DeleteStopModal } from '../components/builder/DeleteStopModal';
import { Button, Skeleton, EmptyState, Badge, useToast } from '../components/ui';

export const ItineraryBuilderPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isAddStopOpen, setIsAddStopOpen] = useState<boolean>(false);
  const [editingStop, setEditingStop] = useState<(Stop & { cities?: City }) | null>(null);
  const [deletingStop, setDeletingStop] = useState<(Stop & { cities?: City }) | null>(null);

  // Configure DND Sensors for both Mouse & Mobile Touch gestures
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // 6px movement required to prevent accidental drag during clicks
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms hold on touch devices
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      .channel(`builder_realtime_${tripId}`)
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
          queryClient.invalidateQueries({ queryKey: ['trip-timeline', tripId] });
          queryClient.invalidateQueries({ queryKey: ['stop-activities'] });
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
          // Invalidate cache when activities change in real-time
          queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
          queryClient.invalidateQueries({ queryKey: ['trip-timeline', tripId] });
          queryClient.invalidateQueries({ queryKey: ['stop-activities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  // Handle Drag to Reorder with Optimistic Updates & Server Sync
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !tripId) return;

    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate reordered array with updated order_index
    const previousStops = [...stops];
    const newStops = arrayMove(stops, oldIndex, newIndex).map((s, idx) => ({
      ...s,
      order_index: idx,
    }));

    // 1. Optimistically update local query cache immediately
    queryClient.setQueryData(['trip-stops', tripId], newStops);

    // 2. Call backend PATCH /api/trips/:tripId/stops/reorder
    try {
      await api.reorderTripStops(
        tripId,
        newStops.map((s) => s.id)
      );
      addToast(
        'success',
        'Stops Sequence Updated',
        'Your itinerary stop order was saved successfully.'
      );
    } catch (err: any) {
      // 3. Roll back to previous state on failure
      queryClient.setQueryData(['trip-stops', tripId], previousStops);
      addToast(
        'error',
        'Failed to Reorder Stops',
        err.message || 'Could not save new stop sequence. Reverting changes.'
      );
    }
  };

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
      <div className="relative rounded-3xl bg-gradient-to-br from-[#7C3AED]/8 via-[#F7F5FC] to-white border border-[#E9E4F5] p-6 sm:p-8 overflow-hidden shadow-[0_8px_32px_rgba(124,58,237,0.10)]">
        <div
          className="absolute -top-12 -right-12 w-72 h-72 rounded-full pointer-events-none animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle at center, rgba(124,58,237,0.14) 0%, rgba(192,132,252,0.07) 45%, transparent 70%)',
            filter: 'blur(28px)',
          }}
        />

        {isTripLoading ? (
          <div className="space-y-3">
            <Skeleton variant="text" width={200} height={20} />
            <Skeleton variant="text" width={320} height={36} />
            <Skeleton variant="text" width={240} height={20} />
          </div>
        ) : (
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
                <Link to="/trips" className="hover:text-[#7C3AED] transition-colors">My Trips</Link>
                <span>/</span>
                <span>Itinerary Builder</span>
              </div>
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
                  <span className="text-xs text-[#6B7280] font-medium">
                    📅 {trip.start_date} → {trip.end_date}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1523] tracking-tight leading-tight font-heading">
                {trip?.name || 'My Adventure'}
              </h1>

              {trip?.description && (
                <p className="text-sm text-[#6B7280] line-clamp-2">
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
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E9E4F5]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">
              Itinerary Stops ({stops.length})
            </h2>
            {isStopsFetching && !isStopsLoading && (
              <div className="flex items-center gap-1 text-xs text-[#7C3AED] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-ping" />
                <span>Syncing live...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#6B7280]">
            {stops.length > 1 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[#6B7280]">
                <svg className="w-4 h-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
                </svg>
                Drag handles to reorder
              </span>
            )}
            <Link
              to="/cities/search"
              className="text-[#7C3AED] hover:text-[#5B21B6] font-semibold transition-colors"
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
                className="bg-[#F7F5FC] border border-[#E9E4F5] rounded-2xl p-5 space-y-4 shadow-sm"
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
          /* Drag-and-Drop Sortable Stops List */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stops.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {stops.map((stop, idx) => (
                  <SortableStopCard
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
            </SortableContext>

            {/* Bottom "+ Add another Section" CTA Button (Screen 5 Spec) */}
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setEditingStop(null);
                  setIsAddStopOpen(true);
                }}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                + Add another Section
              </Button>
            </div>
          </DndContext>
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
