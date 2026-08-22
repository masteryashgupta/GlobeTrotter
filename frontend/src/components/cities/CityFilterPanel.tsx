import React from 'react';
import { Select, Button, Badge } from '../ui';

interface CityFilterPanelProps {
  country: string;
  region: string;
  countries: string[];
  regions: string[];
  onCountryChange: (val: string) => void;
  onRegionChange: (val: string) => void;
  onClearFilters: () => void;
  activeCount: number;
}

export const CityFilterPanel: React.FC<CityFilterPanelProps> = ({
  country,
  region,
  countries,
  regions,
  onCountryChange,
  onRegionChange,
  onClearFilters,
  activeCount,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="text-sm font-bold text-white tracking-tight">Filter Destinations</h3>
          {activeCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeCount} active
            </Badge>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Region Filter */}
      <div>
        <Select
          label="Region"
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          options={[
            { label: 'All Regions (Global)', value: '' },
            ...regions.map((r) => ({ label: r, value: r })),
          ]}
        />
      </div>

      {/* Country Filter */}
      <div>
        <Select
          label="Country"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          options={[
            { label: 'All Countries', value: '' },
            ...countries.map((c) => ({ label: c, value: c })),
          ]}
        />
      </div>

      {/* Quick Region Pills */}
      <div>
        <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase block mb-2">
          Popular Continents
        </label>
        <div className="flex flex-wrap gap-1.5">
          {['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'].map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => onRegionChange(region === reg ? '' : reg)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                region === reg
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-semibold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
