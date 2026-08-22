import React from 'react';

export interface FilterControlOption {
  label: string;
  value: string;
}

export interface FilterControlBarProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  groupByOptions?: FilterControlOption[];
  selectedGroupBy?: string;
  onGroupByChange?: (val: string) => void;

  filterOptions?: FilterControlOption[];
  selectedFilter?: string;
  onFilterChange?: (val: string) => void;

  sortByOptions?: FilterControlOption[];
  selectedSortBy?: string;
  onSortByChange?: (val: string) => void;

  className?: string;
}

export const FilterControlBar: React.FC<FilterControlBarProps> = ({
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search trips, cities, activities...',

  groupByOptions = [
    { label: 'Group by: None', value: 'none' },
    { label: 'Group by: Region', value: 'region' },
    { label: 'Group by: Status', value: 'status' },
  ],
  selectedGroupBy,
  onGroupByChange,

  filterOptions = [
    { label: 'Filter: All', value: 'all' },
    { label: 'Filter: Popular', value: 'popular' },
    { label: 'Filter: Recent', value: 'recent' },
  ],
  selectedFilter,
  onFilterChange,

  sortByOptions = [
    { label: 'Sort by: Default', value: 'default' },
    { label: 'Sort by: Name (A-Z)', value: 'name_asc' },
    { label: 'Sort by: Date (Newest)', value: 'date_desc' },
  ],
  selectedSortBy,
  onSortByChange,

  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-[#E9E4F5] rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 ${className}`}
    >
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-8 py-2 bg-[#F7F5FC] border border-[#E9E4F5] rounded-xl text-xs sm:text-sm text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange?.('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#1A1523]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Control Dropdowns Row */}
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 shrink-0">
        {/* Group By Select */}
        <select
          value={selectedGroupBy || groupByOptions[0]?.value}
          onChange={(e) => onGroupByChange?.(e.target.value)}
          className="px-3 py-2 bg-[#F7F5FC] border border-[#E9E4F5] rounded-xl text-xs font-semibold text-[#1A1523] focus:outline-none focus:border-[#7C3AED] cursor-pointer hover:border-[#C4B5FD] transition-colors"
        >
          {groupByOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filter Select */}
        <select
          value={selectedFilter || filterOptions[0]?.value}
          onChange={(e) => onFilterChange?.(e.target.value)}
          className="px-3 py-2 bg-[#F7F5FC] border border-[#E9E4F5] rounded-xl text-xs font-semibold text-[#1A1523] focus:outline-none focus:border-[#7C3AED] cursor-pointer hover:border-[#C4B5FD] transition-colors"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort By Select */}
        <select
          value={selectedSortBy || sortByOptions[0]?.value}
          onChange={(e) => onSortByChange?.(e.target.value)}
          className="px-3 py-2 bg-[#F7F5FC] border border-[#E9E4F5] rounded-xl text-xs font-semibold text-[#1A1523] focus:outline-none focus:border-[#7C3AED] cursor-pointer hover:border-[#C4B5FD] transition-colors"
        >
          {sortByOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
