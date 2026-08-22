import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Stop, City } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Card, Badge, Button, useToast } from '../ui';
import { SortableStopActivityRow } from './SortableStopActivityRow';
import { AddActivityToStopModal } from './AddActivityToStopModal';

interface StopCardProps {
  stop: Stop & { cities?: City; trip_activities?: any[] };
  index: number;
  totalStops: number;
  tripId: string;
  onEdit: (stop: Stop & { cities?: City }) => void;
  onDelete: (stop: Stop & { cities?: City }) => void;
  dragHandleProps?: Record<string, any>;
  isDragging?: boolean;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  index,
  tripId,
  onEdit,
  onDelete,
  dragHandleProps,
  isDragging = false,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState<boolean>(false);

  // Configure DND Sensors for Mouse + Touch
  const activitySensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch live activities assigned to this stop
  const { data: stopActivities = stop.trip_activities || [], isLoading: isActivitiesLoading } =
    useQuery({
      queryKey: ['stop-activities', stop.id],
      queryFn: () => api.getStopActivities(stop.id),
      enabled: isExpanded,
      initialData: stop.trip_activities || [],
    });

  // Calculate nights
  const arrival = new Date(stop.arrival_date);
  const departure = new Date(stop.departure_date);
  const diffTime = Math.abs(departure.getTime() - arrival.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Drag-and-drop reorder handler for this specific stop's activities
  const handleActivityDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stopActivities.findIndex((a: any) => a.id === active.id);
    const newIndex = stopActivities.findIndex((a: any) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousActivities = [...stopActivities];
    const newActivities = arrayMove(stopActivities, oldIndex, newIndex).map((a: any, idx: number) => ({
      ...a,
      order_index: idx,
    }));

    // 1. Optimistically update local query cache for this stop
    queryClient.setQueryData(['stop-activities', stop.id], newActivities);

    // 2. Call backend PATCH /api/stops/:stopId/activities/reorder
    try {
      await api.reorderStopActivities(
        stop.id,
        newActivities.map((a: any) => a.id)
      );
      addToast(
        'success',
        'Reordered',
        `Activity sequence updated for ${stop.cities?.name || stop.custom_city_name || 'this stop'}.`
      );
    } catch (err: any) {
      // 3. Roll back on failure
      queryClient.setQueryData(['stop-activities', stop.id], previousActivities);
      addToast(
        'error',
        'Reorder Failed',
        err.message || 'Could not save new activity sequence.'
      );
    }
  };

  return (
    <Card
      hoverable={!isDragging}
      className={`bg-[#F7F5FC] border-[#E9E4F5] p-0 overflow-hidden transition-all shadow-sm ${
        isDragging ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/30 shadow-lg' : ''
      }`}
    >
      {/* Top Main Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
        {/* Left: Drag Handle, Thumbnail & Destination Details */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Visible Grip Drag Handle */}
          {dragHandleProps && (
            <button
              type="button"
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-2 -ml-1 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#7C3AED] hover:bg-white rounded-lg transition-colors touch-none select-none shrink-0"
              title="Drag to reorder stop"
              aria-label="Drag to reorder stop"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"
                />
              </svg>
            </button>
          )}

          {/* Stop Index Pill */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#5B21B6] font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
            {index + 1}
          </div>

          {/* City Thumbnail */}
          <img
            src={
              stop.cities?.image_url ||
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'
            }
            alt={stop.cities?.name || stop.custom_city_name || 'City'}
            className="w-16 h-16 rounded-xl object-cover border border-[#E9E4F5]"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';
            }}
          />

          {/* City Name & Country */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-[#1A1523] truncate">
                {stop.cities?.name || stop.custom_city_name || 'Unknown City'}
              </h4>
              {stop.cities?.region && (
                <Badge variant="neutral" size="sm" className="hidden xs:inline-flex text-[10px]">
                  {stop.cities.region}
                </Badge>
              )}
            </div>
            <p className="text-xs font-semibold text-[#6B7280] flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {stop.cities?.country || 'Destination'}
            </p>
          </div>
        </div>

        {/* Center: Stay Dates & Duration */}
        <div className="flex items-center gap-3 bg-white border border-[#E9E4F5] px-3.5 py-2 rounded-xl shrink-0 shadow-sm">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-[#6B7280] block tracking-wider">Stay Window</span>
            <span className="text-xs sm:text-sm font-semibold text-[#1A1523]">
              {stop.arrival_date} → {stop.departure_date}
            </span>
          </div>
          <Badge variant="primary" size="sm" className="shrink-0">
            {nights} {nights === 1 ? 'Night' : 'Nights'}
          </Badge>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Add Activity Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddActivityOpen(true)}
            className="text-xs"
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Activity
          </Button>

          {/* Edit Stop button */}
          <button
            onClick={() => onEdit(stop)}
            className="p-2 rounded-lg text-[#6B7280] hover:text-[#1A1523] hover:bg-white transition-colors"
            title="Edit stop dates"
            aria-label="Edit stop"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Delete Stop button */}
          <button
            onClick={() => onDelete(stop)}
            className="p-2 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
            title="Delete stop"
            aria-label="Delete stop"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Expand / Collapse toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg text-[#6B7280] hover:text-[#1A1523] hover:bg-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            aria-label="Toggle activities list"
          >
            <span className="text-[#6B7280] text-[11px]">
              {stopActivities.length} {stopActivities.length === 1 ? 'activity' : 'activities'}
            </span>
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable Activities Drawer */}
      {isExpanded && (
        <div className="bg-white border-t border-[#E9E4F5] p-4 sm:p-5 space-y-4 font-sans">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h4 className="text-xs font-bold text-[#1A1523] uppercase tracking-wider flex items-center gap-2">
                <span>Scheduled Experiences ({stopActivities.length})</span>
              </h4>
              {stopActivities.length > 1 && (
                <span className="hidden sm:inline text-[11px] text-[#6B7280]">
                  (Drag ⋮⋮ to reorder)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddActivityOpen(true)}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#5B21B6] transition-colors flex items-center gap-1"
              >
                <span>+ Add Experience</span>
              </button>
              <span className="text-[#E9E4F5]">|</span>
              <Link
                to={`/activities/search?cityId=${stop.city_id}&stopId=${stop.id}&tripId=${tripId}`}
                className="text-xs font-semibold text-[#6B7280] hover:text-[#1A1523] transition-colors"
              >
                Browse Catalog →
              </Link>
            </div>
          </div>

          {stopActivities.length === 0 ? (
            <div className="p-5 rounded-xl bg-[#F7F5FC] border border-dashed border-[#E9E4F5] text-center space-y-2">
              <div className="py-4 text-center">
                <p className="text-xs text-[#6B7280]">
                  No activities scheduled for {stop.cities?.name || stop.custom_city_name || 'this stop'} yet.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddActivityOpen(true)}
                className="text-xs"
              >
                Schedule First Activity
              </Button>
            </div>
          ) : (
            /* Drag-and-drop sortable activities list scoped to this stop */
            <DndContext
              id={`dnd-activities-${stop.id}`}
              sensors={activitySensors}
              collisionDetection={closestCenter}
              onDragEnd={handleActivityDragEnd}
            >
              <SortableContext
                items={stopActivities.map((a: any) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {stopActivities.map((act: any) => (
                    <SortableStopActivityRow
                      key={act.id}
                      tripActivity={act}
                      stop={stop}
                      tripId={tripId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* In-Context Add Activity Modal */}
      <AddActivityToStopModal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        stop={stop}
        tripId={tripId}
      />
    </Card>
  );
};
