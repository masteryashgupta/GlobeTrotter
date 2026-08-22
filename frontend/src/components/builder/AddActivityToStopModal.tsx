import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stop, City, Activity } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Modal, Button, Input, Select, Badge, useToast, Skeleton } from '../ui';
import { useDebounce } from '../../hooks/useDebounce';
import { ALL_CATEGORIES } from '../activities/ActivityFilterPanel';
import { formatCost, formatDuration, getCategoryBadgeVariant } from '../activities/ActivityCard';

interface AddActivityToStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stop: (Stop & { cities?: City }) | null;
  tripId: string;
}

export const AddActivityToStopModal: React.FC<AddActivityToStopModalProps> = ({
  isOpen,
  onClose,
  stop,
  tripId,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>(stop?.arrival_date || '');
  const [scheduledTime, setScheduledTime] = useState<string>('10:00');
  const [customCost, setCustomCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Sync scheduled date when stop changes
  React.useEffect(() => {
    if (stop && isOpen) {
      setScheduledDate(stop.arrival_date);
      setSelectedActivity(null);
      setDateError('');
      setNotes('');
      setCustomCost('');
    }
  }, [stop, isOpen]);

  // Fetch activities filtered to this stop's city
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['stop-city-activities', stop?.city_id, debouncedSearch, selectedCategory],
    queryFn: () =>
      api.searchActivities({
        cityId: stop?.city_id || undefined,
        q: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        limit: 40,
      }),
    enabled: isOpen && Boolean(stop?.city_id),
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!stop) throw new Error('Missing stop');
      if (!selectedActivity) throw new Error('Please select an activity');

      if (scheduledDate) {
        if (scheduledDate < stop.arrival_date || scheduledDate > stop.departure_date) {
          throw new Error(
            `Scheduled date (${scheduledDate}) must be within stay dates (${stop.arrival_date} to ${stop.departure_date})`
          );
        }
      }

      return api.assignActivityToStop({
        stop_id: stop.id,
        activity_id: selectedActivity.id,
        scheduled_date: scheduledDate || undefined,
        scheduled_time: scheduledTime || undefined,
        custom_cost: customCost ? parseFloat(customCost) : undefined,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      addToast(
        'success',
        'Activity Added!',
        `"${selectedActivity?.name}" was added to ${stop?.cities?.name || 'this stop'}.`
      );
      queryClient.invalidateQueries({ queryKey: ['stop-activities', stop?.id] });
      queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      onClose();
    },
    onError: (err: any) => {
      setDateError(err.message || 'Failed to add activity.');
    },
  });

  const handleDateChange = (newDate: string) => {
    setScheduledDate(newDate);
    if (stop && newDate) {
      if (newDate < stop.arrival_date || newDate > stop.departure_date) {
        setDateError(
          `Date must be between ${stop.arrival_date} and ${stop.departure_date}`
        );
      } else {
        setDateError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) {
      setDateError('Please select an activity from the list.');
      return;
    }
    if (stop && scheduledDate) {
      if (scheduledDate < stop.arrival_date || scheduledDate > stop.departure_date) {
        setDateError(
          `Scheduled date must fall within ${stop.arrival_date} to ${stop.departure_date}`
        );
        return;
      }
    }
    assignMutation.mutate();
  };

  if (!stop) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Activity in ${stop.cities?.name || 'Destination'}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Destination Header Banner */}
        <div className="flex items-center justify-between p-3 bg-[#F7F5FC] border border-[#E9E4F5] rounded-xl text-xs">
          <div className="flex items-center gap-2 text-[#6B7280]">
            <span className="font-bold text-[#1A1523]">📍 {stop.cities?.name}</span>
            <span>({stop.cities?.country})</span>
          </div>
          <div className="text-[#7C3AED] font-semibold">
            Stay window: {stop.arrival_date} → {stop.departure_date}
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities in city..."
            className="w-full px-3.5 py-2 bg-white border border-[#E9E4F5] rounded-lg text-xs text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] shadow-sm"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-[#E9E4F5] rounded-lg text-xs text-[#1A1523] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] shadow-sm"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Selection List */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide">
            Select Activity {selectedActivity && <span className="text-[#7C3AED] font-bold">• 1 Selected</span>}
          </label>

          <div className="max-h-48 overflow-y-auto border border-[#E9E4F5] bg-white rounded-xl p-2 space-y-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#6B7280]">
                No activities found matching your search.
              </div>
            ) : (
              activities.map((act) => {
                const isSelected = selectedActivity?.id === act.id;
                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      setSelectedActivity(act);
                      if (!customCost) setCustomCost(act.cost ? String(act.cost) : '0');
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#7C3AED]/15 border-[#C4B5FD] ring-1 ring-[#7C3AED]/30'
                        : 'bg-[#F7F5FC] border-[#E9E4F5] hover:border-[#C4B5FD]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={act.image_url || ''}
                        alt={act.name}
                        className="w-10 h-10 rounded-lg object-cover bg-[#F7F5FC] shrink-0 border border-[#E9E4F5]"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#1A1523] truncate">{act.name}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
                          <span className="capitalize">{act.category}</span>
                          <span>•</span>
                          <span>{formatDuration(act.duration_minutes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-[#15803D]">{formatCost(act.cost)}</span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-[#7C3AED] text-white' : 'bg-[#E9E4F5] text-[#6B7280]'
                        }`}
                      >
                        {isSelected ? '✓' : '+'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Scheduling Details (Date bounded to stop window) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E9E4F5]">
          <div>
            <Input
              type="date"
              label="Scheduled Date"
              value={scheduledDate}
              min={stop.arrival_date}
              max={stop.departure_date}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              type="time"
              label="Scheduled Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Cost ($ USD)"
              placeholder="e.g. 25"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
            />
          </div>
        </div>

        {dateError && (
          <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-xs text-[#EF4444] font-medium">
            ⚠️ {dateError}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide block mb-1">
            Notes / Booking info (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Reservation under John, meet at North Gate"
            className="w-full px-3.5 py-2 bg-white border border-[#E9E4F5] rounded-lg text-xs text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] shadow-sm"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#E9E4F5] flex justify-end gap-2.5">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={assignMutation.isPending}
            disabled={!selectedActivity || Boolean(dateError)}
          >
            Add to Itinerary Stop
          </Button>
        </div>
      </form>
    </Modal>
  );
};
