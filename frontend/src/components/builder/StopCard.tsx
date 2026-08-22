import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stop, City } from '../../../../shared/types';
import { Card, Badge, Button } from '../ui';

interface StopCardProps {
  stop: Stop & { cities?: City; trip_activities?: any[] };
  index: number;
  totalStops: number;
  tripId: string;
  onEdit: (stop: Stop & { cities?: City }) => void;
  onDelete: (stop: Stop & { cities?: City }) => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  index,
  tripId,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Calculate nights
  const arrival = new Date(stop.arrival_date);
  const departure = new Date(stop.departure_date);
  const diffTime = Math.abs(departure.getTime() - arrival.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const activities = stop.trip_activities || [];

  return (
    <Card hoverable className="bg-slate-900/90 border-slate-800 p-0 overflow-hidden transition-all shadow-xl">
      {/* Top Main Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Destination Details */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Stop Index Pill */}
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 font-black text-sm flex items-center justify-center shrink-0">
            {index + 1}
          </div>

          {/* City Thumbnail */}
          <img
            src={
              stop.cities?.image_url ||
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'
            }
            alt={stop.cities?.name || 'City'}
            className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';
            }}
          />

          {/* City Name & Country */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
                {stop.cities?.name || 'Unknown City'}
              </h3>
              {stop.cities?.region && (
                <Badge variant="neutral" size="sm" className="hidden xs:inline-flex">
                  {stop.cities.region}
                </Badge>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {stop.cities?.country || 'Destination'}
            </p>
          </div>
        </div>

        {/* Center: Stay Dates & Duration */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 px-3.5 py-2 rounded-xl shrink-0">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Stay Window</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {stop.arrival_date} → {stop.departure_date}
            </span>
          </div>
          <Badge variant="primary" size="sm" className="shrink-0">
            {nights} {nights === 1 ? 'Night' : 'Nights'}
          </Badge>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Add Activities shortcut button */}
          <Link
            to={`/activities/search?cityId=${stop.city_id}&stopId=${stop.id}&tripId=${tripId}`}
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-teal-500/40 text-teal-300 hover:bg-teal-500/10"
              leftIcon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add Activity
            </Button>
          </Link>

          {/* Edit Stop button */}
          <button
            onClick={() => onEdit(stop)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle activities list"
          >
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
        <div className="bg-slate-950/80 border-t border-slate-800 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Assigned Activities ({activities.length})
            </h4>
            <Link
              to={`/activities/search?cityId=${stop.city_id}&stopId=${stop.id}&tripId=${tripId}`}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
            >
              <span>Explore more in {stop.cities?.name}</span>
              <span>→</span>
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                No activities scheduled for this stop yet. Click "Add Activity" to browse sightseeing and tours.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activities.map((act: any, actIdx: number) => (
                <div
                  key={act.id || actIdx}
                  className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">
                      {act.activities?.name || act.name || 'Experience'}
                    </span>
                  </div>
                  {act.scheduled_date && (
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {act.scheduled_date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
