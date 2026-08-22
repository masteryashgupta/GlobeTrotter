import React from 'react';
import { Activity, City } from '../../../../shared/types';
import { Card, Badge, Button } from '../ui';

interface ActivityCardProps {
  activity: Activity & { cities?: City };
  onCardClick: (activity: Activity & { cities?: City }) => void;
  onAddClick: (activity: Activity & { cities?: City }) => void;
  isAdding?: boolean;
}

export const getCategoryBadgeVariant = (
  category?: string | null
): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' => {
  switch (category?.toLowerCase()) {
    case 'sightseeing':
      return 'primary';
    case 'food':
      return 'warning';
    case 'adventure':
      return 'success';
    case 'nightlife':
      return 'danger';
    case 'culture':
      return 'secondary';
    case 'shopping':
      return 'neutral';
    default:
      return 'neutral';
  }
};

export const formatDuration = (minutes?: number | null): string => {
  if (!minutes || minutes <= 0) return 'Flexible';
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

import { useCurrency } from '../../hooks/useCurrency';

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onCardClick,
  onAddClick,
  isAdding = false,
}) => {
  const { formatCost } = useCurrency();
  const categoryVariant = getCategoryBadgeVariant(activity.category);

  return (
    <Card
      hoverable
      className="flex flex-col h-full overflow-hidden p-0 bg-[#F7F5FC] border-[#E9E4F5] cursor-pointer group"
      onClick={() => onCardClick(activity)}
    >
      {/* Image Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-[#F7F5FC]">
        <img
          src={
            activity.image_url ||
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
          }
          alt={activity.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1523]/80 via-[#1A1523]/30 to-transparent" />

        {/* Category & City overlays */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <Badge variant={categoryVariant} size="sm" className="capitalize backdrop-blur-md bg-white/90 shadow-sm">
            {activity.category || 'Activity'}
          </Badge>
        </div>

        {/* Cost Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold backdrop-blur-md bg-white/90 text-[#15803D] border border-[#22C55E]/30 shadow-sm">
            {formatCost(activity.cost)}
          </span>
        </div>

        {/* City tag if attached */}
        {activity.cities && (
          <div className="absolute bottom-2.5 left-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 drop-shadow">
              <svg className="w-3 h-3 text-[#C084FC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {activity.cities.name}, {activity.cities.country}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-[#1A1523] tracking-tight group-hover:text-[#7C3AED] transition-colors line-clamp-1 font-heading">
              {activity.name}
            </h3>
          </div>

          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
            {activity.description || 'Explore this experience during your trip itinerary.'}
          </p>
        </div>

        {/* Metrics & Action */}
        <div className="pt-2 border-t border-[#E9E4F5] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
            <svg className="w-3.5 h-3.5 text-[#6B7280] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDuration(activity.duration_minutes)}</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            isLoading={isAdding}
            onClick={(e) => {
              e.stopPropagation();
              onAddClick(activity);
            }}
            className="shadow-sm font-semibold"
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};
