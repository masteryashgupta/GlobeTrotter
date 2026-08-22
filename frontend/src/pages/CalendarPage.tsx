import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, Button, Badge, Modal, useToast, Skeleton } from '../components/ui';
import { ShareTripModal } from '../components/trips/ShareTripModal';
import { supabase } from '../lib/supabase';
import { Trip, Stop } from '../../../shared/types';

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

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: '#3b82f6',
  food: '#f59e0b',
  adventure: '#10b981',
  nightlife: '#ec4899',
  culture: '#8b5cf6',
  shopping: '#06b6d4',
  other: '#64748b',
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: {
    type: 'stop' | 'activity';
    category?: string;
    description?: string;
    cost?: number;
    notes?: string;
    cityName?: string;
  };
}

export const CalendarPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [calendarView, setCalendarView] = useState<View>('month');

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const fetchTripDetails = async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Failed to load trip details');

      const data = await res.json();
      setTrip(data);
      setStops(data.stops || []);
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Could not fetch trip schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  // Convert stops & activities into Calendar Events
  const events = useMemo<CalendarEvent[]>(() => {
    const list: CalendarEvent[] = [];

    stops.forEach((stop, stopIdx) => {
      const cityName = stop.cities?.name || `Stop ${stopIdx + 1}`;

      // Stop Event (All Day range)
      if (stop.arrival_date && stop.departure_date) {
        list.push({
          id: `stop-${stop.id}`,
          title: `📍 ${cityName}`,
          start: new Date(stop.arrival_date),
          end: new Date(stop.departure_date),
          allDay: true,
          resource: {
            type: 'stop',
            cityName,
          },
        });
      }

      // Activities Events
      (stop.activities || []).forEach((act: any) => {
        const actName = act.activities?.name || 'Scheduled Activity';
        const actCategory = act.activities?.category || 'other';
        const scheduledDateStr = act.scheduled_date || stop.arrival_date;
        const scheduledTimeStr = act.scheduled_time || '10:00';

        const startDateTime = new Date(`${scheduledDateStr}T${scheduledTimeStr}:00`);
        const durationMins = act.activities?.duration_minutes || 120;
        const endDateTime = new Date(startDateTime.getTime() + durationMins * 60 * 1000);

        list.push({
          id: `act-${act.id}`,
          title: `🎟️ ${actName}`,
          start: startDateTime,
          end: endDateTime,
          allDay: false,
          resource: {
            type: 'activity',
            category: actCategory,
            description: act.activities?.description,
            cost: act.custom_cost ?? act.activities?.cost ?? 0,
            notes: act.notes,
            cityName,
          },
        });
      });
    });

    return list;
  }, [stops]);

  // Event Styling for React Big Calendar
  const eventPropGetter = (event: CalendarEvent) => {
    if (event.resource?.type === 'stop') {
      return {
        style: {
          backgroundColor: '#1e293b',
          borderLeft: '4px solid #10b981',
          color: '#f8fafc',
          borderRadius: '6px',
          padding: '2px 6px',
          fontWeight: 600,
        },
      };
    }

    const cat = event.resource?.category || 'other';
    const color = CATEGORY_COLORS[cat] || '#64748b';

    return {
      style: {
        backgroundColor: `${color}20`,
        borderLeft: `4px solid ${color}`,
        color: '#ffffff',
        borderRadius: '6px',
        padding: '2px 6px',
        fontSize: '12px',
      },
    };
  };

  if (loading) {
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
            Trip Calendar & Schedule
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'timeline' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'calendar' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Calendar Grid
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            Share Schedule
          </Button>
        </div>
      </div>

      {/* Main View Container */}
      {viewMode === 'calendar' ? (
        <Card className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="h-[650px] font-sans text-slate-200">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultDate={defaultDate}
              view={calendarView}
              onView={(v) => setCalendarView(v)}
              onSelectEvent={(evt) => setSelectedEvent(evt as CalendarEvent)}
              eventPropGetter={eventPropGetter}
              className="custom-big-calendar"
            />
          </div>
        </Card>
      ) : (
        /* Timeline Day-by-Day Grid */
        <div className="space-y-6">
          {stops.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">No destination stops added to this trip yet.</p>
            </Card>
          ) : (
            stops.map((stop, idx) => {
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
                          {stop.arrival_date} &rarr; {stop.departure_date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="neutral" className="w-fit text-slate-400 border-slate-700">
                      {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                    </Badge>
                  </div>

                  {/* Scheduled Activities */}
                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No scheduled activities for this stop.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {activities.map((act: any) => {
                        const actName = act.activities?.name || 'Scheduled Activity';
                        const cat = act.activities?.category || 'other';
                        const catColor = CATEGORY_COLORS[cat] || '#64748b';
                        const cost = act.custom_cost ?? act.activities?.cost ?? 0;

                        return (
                          <div
                            key={act.id}
                            onClick={() =>
                              setSelectedEvent({
                                id: act.id,
                                title: actName,
                                start: new Date(act.scheduled_date || stop.arrival_date),
                                end: new Date(act.scheduled_date || stop.arrival_date),
                                resource: {
                                  type: 'activity',
                                  category: cat,
                                  description: act.activities?.description,
                                  cost,
                                  notes: act.notes,
                                  cityName,
                                },
                              })
                            }
                            className="group p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                                style={{ backgroundColor: catColor }}
                              >
                                {cat}
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                ${Number(cost).toFixed(2)}
                              </span>
                            </div>

                            <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm line-clamp-1">
                              {actName}
                            </h4>

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
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
        >
          <div className="space-y-4 text-sm text-slate-300">
            {selectedEvent.resource?.category && (
              <span
                className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: CATEGORY_COLORS[selectedEvent.resource.category] || '#64748b' }}
              >
                {selectedEvent.resource.category}
              </span>
            )}

            {selectedEvent.resource?.cityName && (
              <p className="text-xs text-slate-400">📍 Destination: <span className="text-white font-semibold">{selectedEvent.resource.cityName}</span></p>
            )}

            {selectedEvent.resource?.description && (
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {selectedEvent.resource.description}
              </p>
            )}

            {selectedEvent.resource?.cost !== undefined && (
              <div className="flex items-center justify-between py-2 border-t border-b border-slate-800">
                <span className="text-xs font-semibold uppercase text-slate-400">Estimated Cost</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  ${Number(selectedEvent.resource.cost).toFixed(2)}
                </span>
              </div>
            )}

            {selectedEvent.resource?.notes && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Notes</span>
                <p className="text-xs text-slate-300 mt-1 italic">{selectedEvent.resource.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
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
          onShareUpdated={({ is_public, share_token }) => {
            setTrip({ ...trip, is_public, share_token });
          }}
        />
      )}
    </div>
  );
};
