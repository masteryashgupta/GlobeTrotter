import React from 'react';
import { Activity, City } from '../../../../shared/types';
import { Modal, Badge, Button } from '../ui';
import { getCategoryBadgeVariant, formatDuration } from './ActivityCard';
import { useCurrency } from '../../hooks/useCurrency';

interface ActivityDetailModalProps {
  activity: (Activity & { cities?: City }) | null;
  isOpen: boolean;
  onClose: () => void;
  onAddClick: (activity: Activity & { cities?: City }) => void;
  isAdding?: boolean;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  onAddClick,
  isAdding = false,
}) => {
  const { formatCost } = useCurrency();
  if (!activity) return null;

  const categoryVariant = getCategoryBadgeVariant(activity.category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Details"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            isLoading={isAdding}
            onClick={() => onAddClick(activity)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add to Itinerary
          </Button>
        </>
      }
    >
      <div className="space-y-5 font-sans">
        {/* Large Hero Image */}
        <div className="relative h-60 w-full overflow-hidden rounded-xl bg-[#F7F5FC] border border-[#E9E4F5]">
          <img
            src={
              activity.image_url ||
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
            }
            alt={activity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1523]/80 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={categoryVariant} size="md" className="capitalize shadow-sm backdrop-blur-md bg-white/90">
              {activity.category || 'Activity'}
            </Badge>
          </div>

          <div className="absolute top-3 right-3">
            <span className="px-3 py-1.5 rounded-full text-sm font-black backdrop-blur-md bg-white/90 text-[#15803D] border border-[#22C55E]/30 shadow-sm">
              {formatCost(activity.cost)}
            </span>
          </div>

          {activity.cities && (
            <div className="absolute bottom-3 left-4">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5 drop-shadow">
                <svg className="w-4 h-4 text-[#C084FC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {activity.cities.name}, {activity.cities.country} • {activity.cities.region}
              </span>
            </div>
          )}
        </div>

        {/* Title & Key Specs */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1523] tracking-tight font-heading">{activity.name}</h2>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[#F7F5FC] p-3 rounded-xl border border-[#E9E4F5] text-center">
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block mb-0.5">Estimated Cost</span>
              <span className="text-base font-bold text-[#15803D]">{formatCost(activity.cost)}</span>
            </div>

            <div className="bg-[#F7F5FC] p-3 rounded-xl border border-[#E9E4F5] text-center">
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block mb-0.5">Duration</span>
              <span className="text-base font-bold text-[#1A1523]">{formatDuration(activity.duration_minutes)}</span>
            </div>

            <div className="bg-[#F7F5FC] p-3 rounded-xl border border-[#E9E4F5] text-center">
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block mb-0.5">Experience Type</span>
              <span className="text-base font-bold text-[#7C3AED] capitalize">{activity.category || 'General'}</span>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-2 pt-2 border-t border-[#E9E4F5]">
          <h3 className="text-xs font-semibold text-[#1A1523] uppercase tracking-wider">Description &amp; Details</h3>
          <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">
            {activity.description || 'No detailed description provided for this activity.'}
          </p>
        </div>
      </div>
    </Modal>
  );
};
