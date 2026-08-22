import React from 'react';
import { City } from '../../../../shared/types';
import { Select, Badge } from '../ui';

export const ALL_CATEGORIES = [
  { id: 'sightseeing', label: 'Sightseeing', icon: '🏛️' },
  { id: 'food', label: 'Food & Dining', icon: '🍜' },
  { id: 'adventure', label: 'Adventure', icon: '🧗' },
  { id: 'culture', label: 'Culture & Arts', icon: '🎨' },
  { id: 'nightlife', label: 'Nightlife', icon: '🍸' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'other', label: 'Other Experiences', icon: '✨' },
];

interface ActivityFilterPanelProps {
  selectedCityId: string;
  selectedCategories: string[];
  maxCost: string;
  maxDuration: string;
  cities: City[];
  onCityChange: (cityId: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onMaxCostChange: (cost: string) => void;
  onMaxDurationChange: (duration: string) => void;
  onClearFilters: () => void;
  activeCount: number;
}

export const ActivityFilterPanel: React.FC<ActivityFilterPanelProps> = ({
  selectedCityId,
  selectedCategories,
  maxCost,
  maxDuration,
  cities,
  onCityChange,
  onCategoryToggle,
  onMaxCostChange,
  onMaxDurationChange,
  onClearFilters,
  activeCount,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
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
          <h3 className="text-sm font-bold text-white tracking-tight">Filter Activities</h3>
          {activeCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeCount}
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

      {/* City Selector */}
      <div>
        <Select
          label="Destination City"
          value={selectedCityId}
          onChange={(e) => onCityChange(e.target.value)}
          options={[
            { label: 'All Worldwide Cities', value: '' },
            ...cities.map((c) => ({
              label: `${c.name}, ${c.country}`,
              value: c.id,
            })),
          ]}
        />
      </div>

      {/* Categories (Multi-select pills) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Categories
          </label>
          {selectedCategories.length > 0 && (
            <span className="text-[11px] text-teal-400 font-medium">
              {selectedCategories.length} selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryToggle(cat.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Cost Filter */}
      <div>
        <Select
          label="Budget / Max Cost"
          value={maxCost}
          onChange={(e) => onMaxCostChange(e.target.value)}
          options={[
            { label: 'Any Cost (All Activities)', value: '' },
            { label: 'Free Activities Only ($0)', value: '0' },
            { label: 'Under $25 (Budget-Friendly)', value: '25' },
            { label: 'Under $50 (Moderate)', value: '50' },
            { label: 'Under $100 (Standard)', value: '100' },
            { label: 'Under $250 (Premium / Day Tours)', value: '250' },
          ]}
        />
      </div>

      {/* Max Duration Filter */}
      <div>
        <Select
          label="Maximum Duration"
          value={maxDuration}
          onChange={(e) => onMaxDurationChange(e.target.value)}
          options={[
            { label: 'Any Duration', value: '' },
            { label: 'Quick Visit (≤ 1 hour / 60m)', value: '60' },
            { label: 'Half-day Tour (≤ 2 hours / 120m)', value: '120' },
            { label: 'Extended Exploration (≤ 4 hours / 240m)', value: '240' },
            { label: 'Full Day Experience (≤ 8 hours / 480m)', value: '480' },
          ]}
        />
      </div>
    </div>
  );
};
