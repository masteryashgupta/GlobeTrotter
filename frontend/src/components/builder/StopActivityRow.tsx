import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stop, City } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Badge, useToast } from '../ui';
import { formatCost, getCategoryBadgeVariant } from '../activities/ActivityCard';

interface StopActivityRowProps {
  tripActivity: any;
  stop: Stop & { cities?: City };
  tripId: string;
  dragHandleProps?: Record<string, any>;
  isDragging?: boolean;
}

export const StopActivityRow: React.FC<StopActivityRowProps> = ({
  tripActivity,
  stop,
  tripId,
  dragHandleProps,
  isDragging = false,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [scheduledDate, setScheduledDate] = useState<string>(tripActivity.scheduled_date || '');
  const [scheduledTime, setScheduledTime] = useState<string>(tripActivity.scheduled_time || '');
  const [inlineDateError, setInlineDateError] = useState<string>('');

  const activity = tripActivity.activities || {};
  const isCustomActivity = !tripActivity.activities;
  const activityName = activity.name || tripActivity.custom_activity_name || 'Custom Activity';
  const categoryVariant = getCategoryBadgeVariant(activity.category);

  // Update Activity Mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { scheduled_date?: string; scheduled_time?: string }) => {
      return api.updateTripActivity(tripActivity.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-activities', stop.id] });
      queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
    onError: (err: any) => {
      setInlineDateError(err.message || 'Date invalid');
      addToast('error', 'Update Failed', err.message || 'Could not update activity schedule.');
    },
  });

  // Delete Activity Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.deleteTripActivity(tripActivity.id);
    },
    onSuccess: () => {
      addToast('success', 'Activity Removed', `"${activity.name || 'Activity'}" was removed from the stop.`);
      queryClient.invalidateQueries({ queryKey: ['stop-activities', stop.id] });
      queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
    onError: (err: any) => {
      addToast('error', 'Delete Failed', err.message || 'Could not remove activity.');
    },
  });

  const handleDateBlur = () => {
    if (!scheduledDate) return;
    if (scheduledDate < stop.arrival_date || scheduledDate > stop.departure_date) {
      setInlineDateError(`Must be ${stop.arrival_date} – ${stop.departure_date}`);
      return;
    }
    setInlineDateError('');
    updateMutation.mutate({ scheduled_date: scheduledDate });
  };

  const handleTimeBlur = () => {
    updateMutation.mutate({ scheduled_time: scheduledTime });
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-white border rounded-xl gap-3 transition-all font-sans ${
        isDragging
          ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/30 shadow-lg bg-[#F7F5FC]'
          : 'border-[#E9E4F5] hover:border-[#7C3AED]/30'
      }`}
    >
      {/* Left: Drag Handle & Info */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Grip Drag Handle */}
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 min-w-[32px] min-h-[32px] flex items-center justify-center text-[#6B7280] hover:text-[#7C3AED] hover:bg-[#F7F5FC] rounded transition-colors touch-none select-none shrink-0"
            title="Drag to reorder activity"
            aria-label="Drag to reorder activity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"
              />
            </svg>
          </button>
        )}

        <img
          src={
            activity.image_url ||
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'
          }
          alt={activity.name || 'Experience'}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover bg-[#F7F5FC] shrink-0 border border-[#E9E4F5]"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80';
          }}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-bold text-[#1A1523] truncate">
              {activityName}
            </h5>
            {isCustomActivity && (
              <Badge variant="neutral" size="sm">
                Custom
              </Badge>
            )}
          </div>
          {activity.category && (
            <Badge variant={categoryVariant} size="sm" className="capitalize text-[10px]">
              {activity.category}
            </Badge>
          )}
          {tripActivity.notes && (
            <p className="text-[11px] text-[#6B7280] truncate max-w-xs">
              📝 {tripActivity.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right: Inline Schedulers, Cost & Remove */}
      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center flex-wrap">
        {/* Inline Date Picker */}
        <div className="relative">
          <input
            type="date"
            value={scheduledDate}
            min={stop.arrival_date}
            max={stop.departure_date}
            onChange={(e) => {
              setScheduledDate(e.target.value);
              setInlineDateError('');
            }}
            onBlur={handleDateBlur}
            className={`px-2 py-1 text-xs bg-[#F7F5FC] border rounded-lg text-[#1A1523] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] ${
              inlineDateError ? 'border-[#EF4444] text-[#EF4444]' : 'border-[#E9E4F5]'
            }`}
            title={`Stay range: ${stop.arrival_date} to ${stop.departure_date}`}
          />
          {inlineDateError && (
            <span className="absolute -bottom-4 right-0 text-[10px] text-[#EF4444] font-bold whitespace-nowrap">
              {inlineDateError}
            </span>
          )}
        </div>

        {/* Inline Time Picker */}
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          onBlur={handleTimeBlur}
          className="px-2 py-1 text-xs bg-[#F7F5FC] border border-[#E9E4F5] rounded-lg text-[#1A1523] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          title="Scheduled time"
        />

        {/* Cost */}
        <span className="text-xs font-extrabold text-[#15803D] px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20">
          {formatCost(tripActivity.custom_cost !== null && tripActivity.custom_cost !== undefined ? tripActivity.custom_cost : activity.cost)}
        </span>

        {/* Remove Activity Button */}
        <button
          type="button"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
          title="Remove activity from stop"
          aria-label="Remove activity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
