import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import withDragAndDropFromLib from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Card, Button, Badge, Modal, Input, useToast, Skeleton, EmptyState } from '../components/ui';
import { ShareTripModal } from '../components/trips/ShareTripModal';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { Trip } from '../../../shared/types';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const withDragAndDrop = (withDragAndDropFromLib as any).default || withDragAndDropFromLib;
const DnDCalendar = withDragAndDrop(Calendar as any);

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: '#3b82f6',
  food: '#f59e0b',
  adventure: '#10b981',
  nightlife: '#ec4899',
  culture: '#8b5cf6',
  shopping: '#06b6d4',
  other: '#64748b',
};

export interface RawCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  stopCity: string;
  cost: number;
  category: string;
  notes: string;
  stopArrival?: string;
  stopDeparture?: string;
}

export interface BigCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    stopCity: string;
    cost: number;
    category: string;
    notes: string;
    stopArrival?: string;
    stopDeparture?: string;
  };
}

export const CalendarPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Screen width responsive check
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);
  const [calendarView, setCalendarView] = useState<View>(() => (window.innerWidth < 768 ? Views.AGENDA : Views.MONTH));

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modals & Edit state
  const [selectedEvent, setSelectedEvent] = useState<BigCalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    custom_cost: '',
    notes: '',
    scheduled_time: '09:00',
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Helper auth token
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // 1. Fetch Trip details
  const { data: trip, isLoading: isTripLoading } = useQuery<Trip>({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load trip details');
      return res.json();
    },
    enabled: !!tripId,
  });

  // 2. Fetch Calendar Events from GET /api/trips/:tripId/calendar
  const { data: rawEvents = [], isLoading: isEventsLoading } = useQuery<RawCalendarEvent[]>({
    queryKey: ['trip-calendar', tripId],
    queryFn: async () => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/calendar`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load calendar events');
      return res.json();
    },
    enabled: !!tripId,
  });

  // Convert raw events to Date object events for BigCalendar
  const events = useMemo<BigCalendarEvent[]>(() => {
    return rawEvents.map((evt) => ({
      id: evt.id,
      title: `${evt.title} (${evt.stopCity})`,
      start: new Date(evt.start),
      end: new Date(evt.end),
      resource: {
        stopCity: evt.stopCity,
        cost: evt.cost,
        category: evt.category,
        notes: evt.notes,
        stopArrival: evt.stopArrival,
        stopDeparture: evt.stopDeparture,
      },
    }));
  }, [rawEvents]);

  // Mutations for PATCH and DELETE trip-activities
  const updateActivityMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { scheduled_date?: string; scheduled_time?: string; custom_cost?: number; notes?: string };
    }) => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trip-activities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update scheduled activity');
      }
      return res.json();
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['trip-calendar', tripId] });
      const previousEvents = queryClient.getQueryData<RawCalendarEvent[]>(['trip-calendar', tripId]);

      // Optimistically update cache
      if (previousEvents && data.scheduled_date) {
        const updated = previousEvents.map((evt) => {
          if (evt.id === id) {
            const timeStr = data.scheduled_time || '09:00:00';
            const newStart = new Date(`${data.scheduled_date}T${timeStr}`);
            const durationMs = new Date(evt.end).getTime() - new Date(evt.start).getTime();
            const newEnd = new Date(newStart.getTime() + durationMs);
            return {
              ...evt,
              start: newStart.toISOString(),
              end: newEnd.toISOString(),
            };
          }
          return evt;
        });
        queryClient.setQueryData(['trip-calendar', tripId], updated);
      }

      return { previousEvents };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['trip-calendar', tripId], context.previousEvents);
      }
      addToast('error', 'Reschedule Failed', err.message);
    },
    onSuccess: () => {
      addToast('success', 'Activity Updated', 'Schedule change saved.');
      queryClient.invalidateQueries({ queryKey: ['trip-calendar', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-budget', tripId] });
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trip-activities/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to remove activity from schedule');
      return res.json();
    },
    onSuccess: () => {
      addToast('success', 'Removed', 'Activity removed from trip schedule.');
      queryClient.invalidateQueries({ queryKey: ['trip-calendar', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-budget', tripId] });
      setSelectedEvent(null);
    },
    onError: (err: any) => {
      addToast('error', 'Delete Failed', err.message);
    },
  });

  // Drag and Drop Handler
  const handleEventDrop = ({ event, start }: any) => {
    const droppedEvent = event as BigCalendarEvent;
    const newDate = new Date(start);
    const newScheduledDate = format(newDate, 'yyyy-MM-dd');
    const newScheduledTime = format(newDate, 'HH:mm:ss');

    // Validation: Stop date boundaries check if available
    const stopArrival = droppedEvent.resource.stopArrival;
    const stopDeparture = droppedEvent.resource.stopDeparture;

    if (stopArrival && stopDeparture) {
      if (newScheduledDate < stopArrival || newScheduledDate > stopDeparture) {
        addToast(
          'error',
          'Date Out of Range',
          `Cannot move activity outside stop dates (${stopArrival} to ${stopDeparture}).`
        );
        return;
      }
    }

    updateActivityMutation.mutate({
      id: droppedEvent.id,
      data: {
        scheduled_date: newScheduledDate,
        scheduled_time: newScheduledTime,
      },
    });
  };

  const handleOpenEditModal = (evt: BigCalendarEvent) => {
    setSelectedEvent(evt);
    setEditFormData({
      custom_cost: String(evt.resource.cost || ''),
      notes: evt.resource.notes || '',
      scheduled_time: format(evt.start, 'HH:mm'),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    updateActivityMutation.mutate({
      id: selectedEvent.id,
      data: {
        custom_cost: Number(editFormData.custom_cost) || 0,
        notes: editFormData.notes,
        scheduled_time: `${editFormData.scheduled_time}:00`,
      },
    });
  };

  const handleDeleteActivity = () => {
    if (!selectedEvent) return;
    if (confirm('Are you sure you want to remove this activity from your itinerary?')) {
      deleteActivityMutation.mutate(selectedEvent.id);
    }
  };

  // Event Prop Styling
  const eventPropGetter = (event: any) => {
    const cat = event.resource?.category || 'other';
    const color = CATEGORY_COLORS[cat] || '#64748b';

    return {
      style: {
        backgroundColor: `${color}25`,
        borderLeft: `4px solid ${color}`,
        color: '#ffffff',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 6px',
      },
    };
  };

  const isLoading = isTripLoading || isEventsLoading;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const defaultDate = trip?.start_date ? new Date(trip.start_date) : new Date();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <Link to="/trips" className="hover:text-emerald-400 transition-colors">Trips</Link>
            <span>/</span>
            <span>{trip?.name || 'Trip Schedule'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trip Calendar & Timeline
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher Pills */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            {[
              { id: Views.MONTH, label: 'Month' },
              { id: Views.WEEK, label: 'Week' },
              { id: Views.DAY, label: 'Day' },
              { id: Views.AGENDA, label: 'Agenda' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setCalendarView(v.id as View)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  calendarView === v.id ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            Share
          </Button>
        </div>
      </div>

      {/* Main Calendar View */}
      {events.length === 0 ? (
        <EmptyState
          title="No Scheduled Activities"
          description="Add destination stops and tours in your itinerary builder to populate your interactive trip timeline."
          action={
            <Link to={`/trips/${tripId}`}>
              <Button variant="primary">Go to Itinerary Builder</Button>
            </Link>
          }
        />
      ) : (
        <Card className="bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-2">
              💡 <span className="font-semibold text-slate-300">Drag and drop</span> activities onto any date to reschedule. Click an event to view or edit details.
            </span>
            {isMobile && (
              <Badge variant="warning" size="sm">
                Mobile View (Agenda)
              </Badge>
            )}
          </div>

          <div className="h-[520px] sm:h-[650px] font-sans text-slate-200">
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultDate={defaultDate}
              view={calendarView}
              onView={(v: View) => setCalendarView(v)}
              onEventDrop={handleEventDrop}
              onSelectEvent={(evt: any) => setSelectedEvent(evt as BigCalendarEvent)}
              eventPropGetter={eventPropGetter}
              resizable={false}
              className="custom-big-calendar"
            />
          </div>
        </Card>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && !isEditModalOpen && (
        <Modal
          isOpen={!!selectedEvent && !isEditModalOpen}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
        >
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span
                className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: CATEGORY_COLORS[selectedEvent.resource.category] || '#64748b' }}
              >
                {selectedEvent.resource.category}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                ${Number(selectedEvent.resource.cost).toFixed(2)}
              </span>
            </div>

            <div className="space-y-1 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs">
              <p className="text-slate-400">📍 Destination: <span className="text-white font-semibold">{selectedEvent.resource.stopCity}</span></p>
              <p className="text-slate-400">📅 Date: <span className="text-white font-semibold">{format(selectedEvent.start, 'yyyy-MM-dd')}</span></p>
              <p className="text-slate-400">⏰ Time: <span className="text-white font-semibold">{format(selectedEvent.start, 'hh:mm a')} &rarr; {format(selectedEvent.end, 'hh:mm a')}</span></p>
            </div>

            {selectedEvent.resource.notes && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">Notes</span>
                <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  {selectedEvent.resource.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button
                variant="ghost"
                className="text-rose-400 hover:text-rose-300 text-xs"
                onClick={handleDeleteActivity}
                isLoading={deleteActivityMutation.isPending}
              >
                Delete Activity
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => handleOpenEditModal(selectedEvent)}>
                  Edit Details
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Activity Modal */}
      {selectedEvent && isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${selectedEvent.title}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Custom Cost (₹ INR)"
              type="number"
              step="0.01"
              min="0"
              value={editFormData.custom_cost}
              onChange={(e) => setEditFormData({ ...editFormData, custom_cost: e.target.value })}
            />

            <Input
              label="Scheduled Time"
              type="time"
              value={editFormData.scheduled_time}
              onChange={(e) => setEditFormData({ ...editFormData, scheduled_time: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Notes & Reminders
              </label>
              <textarea
                rows={3}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="e.g. Bring museum confirmation email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={updateActivityMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share Modal */}
      {trip && (
        <ShareTripModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          tripId={trip.id}
          tripName={trip.name || 'Trip'}
          isPublic={trip.is_public}
          shareToken={trip.share_token}
          onShareUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
          }}
        />
      )}
    </div>
  );
};
