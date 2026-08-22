import React from 'react';
import { City } from '../../../../shared/types';
import { Card, Badge, Button } from '../ui';

interface CityCardProps {
  city: City;
  onAddToTrip: (city: City) => void;
}

export const CityCard: React.FC<CityCardProps> = ({ city, onAddToTrip }) => {
  const costIndex = city.cost_index || 1;

  return (
    <Card hoverable className="flex flex-col h-full overflow-hidden p-0 bg-[#F7F5FC] border-[#E9E4F5]">
      {/* Image with overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-[#F7F5FC]">
        <img
          src={city.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
          alt={`${city.name}, ${city.country}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Fallback image on error
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1523]/80 via-[#1A1523]/20 to-transparent" />

        {/* Region & Popularity Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {city.region && (
            <Badge variant="neutral" size="sm" className="backdrop-blur-md bg-white/80">
              {city.region}
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="primary" size="sm" className="backdrop-blur-md bg-[#7C3AED]/90 shadow-md text-white">
            🔥 {city.popularity ?? 0}%
          </Badge>
        </div>

        {/* City & Country at the bottom of image header */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-md font-heading">
            {city.name}
          </h3>
          <p className="text-xs font-semibold text-white/90 flex items-center gap-1 drop-shadow">
            <svg className="w-3.5 h-3.5 text-[#C084FC] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {city.country}
          </p>
        </div>
      </div>

      {/* Card Content & Metrics */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4 font-sans">
        {/* Equal 2-Column Grid for Stat Boxes (1fr 1fr, gap-3) */}
        <div className="grid grid-cols-2 gap-3 pt-1 w-full">
          {/* Box 1: Affordability */}
          <div className="bg-white rounded-xl p-2.5 border border-[#E9E4F5] shadow-sm flex flex-col justify-between min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block truncate">
              Affordability
            </span>
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center gap-0.5 text-xs sm:text-sm font-black tracking-tight">
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    className={level <= costIndex ? 'text-[#15803D]' : 'text-[#E9E4F5]'}
                  >
                    $
                  </span>
                ))}
              </div>
              <div className="flex items-center">
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#7C3AED]/10 text-[#5B21B6] border border-[#7C3AED]/20 truncate max-w-full">
                  {costIndex <= 1
                    ? 'Budget'
                    : costIndex <= 3
                    ? 'Moderate'
                    : 'Premium'}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Popularity Score */}
          <div className="bg-white rounded-xl p-2.5 border border-[#E9E4F5] shadow-sm flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block truncate">
                Popularity
              </span>
              <span className="text-xs font-extrabold text-[#7C3AED] shrink-0">
                {city.popularity ?? 0}%
              </span>
            </div>
            <div className="space-y-1.5 mt-1">
              <div className="w-full bg-[#F7F5FC] rounded-full h-2 overflow-hidden border border-[#E9E4F5]">
                <div
                  className="bg-gradient-to-r from-[#7C3AED] to-[#C084FC] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${city.popularity || 50}%` }}
                />
              </div>
              <span className="text-[10px] text-[#6B7280] font-medium block truncate">
                {(city.popularity ?? 0) >= 80 ? 'High Demand' : (city.popularity ?? 0) >= 50 ? 'Popular' : 'Trending'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onAddToTrip(city)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add to Trip
          </Button>
        </div>
      </div>
    </Card>
  );
};
