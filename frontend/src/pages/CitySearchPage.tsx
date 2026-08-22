import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { City } from '../../../shared/types';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { CityCard } from '../components/cities/CityCard';
import { CityFilterPanel } from '../components/cities/CityFilterPanel';
import { AddToTripModal } from '../components/cities/AddToTripModal';
import { Input, Skeleton, EmptyState, Button, Badge } from '../components/ui';

export const CitySearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [selectedCityForTrip, setSelectedCityForTrip] = useState<City | null>(null);

  // Debounce search query by 300ms
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch filter metadata (countries & regions dynamically populated)
  const { data: filterMeta = { countries: [], regions: [] } } = useQuery({
    queryKey: ['city-filters'],
    queryFn: () => api.getCityFilters(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Query cities using React Query
  const {
    data: cities = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['cities', { q: debouncedSearch, country: countryFilter, region: regionFilter }],
    queryFn: () =>
      api.searchCities({
        q: debouncedSearch || undefined,
        country: countryFilter || undefined,
        region: regionFilter || undefined,
        limit: 50,
      }),
  });

  const activeFilterCount =
    (countryFilter ? 1 : 0) + (regionFilter ? 1 : 0) + (debouncedSearch ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setRegionFilter('');
  };

  return (
    <div className="py-6 space-y-8 font-sans">
      {/* Hero / Header Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-slate-800/80 p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold tracking-wide">
            <span>🌍 Destination Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Explore World Destinations
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Search top-rated travel cities worldwide, explore cost indices and popularity scores, and seamlessly add stops to your itinerary.
          </p>

          {/* Search Bar Input */}
          <div className="pt-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cities (e.g. Tokyo, Paris, Rome, Barcelona)..."
                className="w-full pl-11 pr-10 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-inner transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="sticky top-24">
            <CityFilterPanel
              country={countryFilter}
              region={regionFilter}
              countries={filterMeta.countries}
              regions={filterMeta.regions}
              onCountryChange={setCountryFilter}
              onRegionChange={setRegionFilter}
              onClearFilters={handleClearAllFilters}
              activeCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Action / Status Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isLoading ? 'Searching destinations...' : `${cities.length} Cities Found`}
              </h2>
              {isFetching && !isLoading && (
                <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span>Updating...</span>
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFilterOpen(true)}
                leftIcon={
                  <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                }
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </div>

          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
              <span className="text-slate-500 font-medium">Active filters:</span>
              {debouncedSearch && (
                <Badge variant="primary" size="sm" className="flex items-center gap-1">
                  Query: "{debouncedSearch}"
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}
              {regionFilter && (
                <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                  Region: {regionFilter}
                  <button onClick={() => setRegionFilter('')} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}
              {countryFilter && (
                <Badge variant="warning" size="sm" className="flex items-center gap-1">
                  Country: {countryFilter}
                  <button onClick={() => setCountryFilter('')} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-teal-400 hover:text-teal-300 underline ml-2 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Cities Grid / Loading Skeletons / Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <div
                  key={key}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden p-0 space-y-4"
                >
                  <Skeleton variant="rectangular" height={192} className="w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton variant="rectangular" height={50} />
                      <Skeleton variant="rectangular" height={50} />
                    </div>
                    <Skeleton variant="rectangular" height={36} className="w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : cities.length === 0 ? (
            <EmptyState
              title="No Destinations Found"
              description={
                searchTerm || countryFilter || regionFilter
                  ? `No cities match "${[searchTerm, countryFilter, regionFilter].filter(Boolean).join(', ')}". Try adjusting your filters or search keywords.`
                  : 'No destination records available in the database.'
              }
              action={
                activeFilterCount > 0 ? (
                  <Button variant="primary" onClick={handleClearAllFilters}>
                    Reset Search & Filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onAddToTrip={(targetCity) => setSelectedCityForTrip(targetCity)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto z-10 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Filter Destinations</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <CityFilterPanel
                country={countryFilter}
                region={regionFilter}
                countries={filterMeta.countries}
                regions={filterMeta.regions}
                onCountryChange={(val) => {
                  setCountryFilter(val);
                }}
                onRegionChange={(val) => {
                  setRegionFilter(val);
                }}
                onClearFilters={handleClearAllFilters}
                activeCount={activeFilterCount}
              />
            </div>

            <div className="pt-6 border-t border-slate-800">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters ({cities.length} Results)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Trip Modal Dialog */}
      <AddToTripModal
        city={selectedCityForTrip}
        isOpen={Boolean(selectedCityForTrip)}
        onClose={() => setSelectedCityForTrip(null)}
      />
    </div>
  );
};
export default CitySearchPage;
