import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, City } from '../../../shared/types';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { ActivityCard } from '../components/activities/ActivityCard';
import { ActivityFilterPanel } from '../components/activities/ActivityFilterPanel';
import { ActivityDetailModal } from '../components/activities/ActivityDetailModal';
import { AddActivityModal } from '../components/activities/AddActivityModal';
import { Skeleton, EmptyState, Button, Badge, useToast } from '../components/ui';

export const ActivitySearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Read URL query parameters
  const initialCityId = searchParams.get('cityId') || searchParams.get('city_id') || '';
  const stopId = searchParams.get('stopId') || searchParams.get('stop_id') || '';
  const tripId = searchParams.get('tripId') || searchParams.get('trip_id') || '';
  const initialCategory = searchParams.get('category') || '';

  // Local filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>(initialCityId);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [maxCost, setMaxCost] = useState<string>('');
  const [maxDuration, setMaxDuration] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Modals state
  const [detailActivity, setDetailActivity] = useState<(Activity & { cities?: City }) | null>(null);
  const [addTripActivity, setAddTripActivity] = useState<(Activity & { cities?: City }) | null>(null);
  const [addingActivityId, setAddingActivityId] = useState<string | null>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Sync state if query params change
  useEffect(() => {
    if (initialCityId && initialCityId !== selectedCityId) {
      setSelectedCityId(initialCityId);
    }
  }, [initialCityId]);

  // Fetch available cities for selector dropdown
  const { data: availableCities = [] } = useQuery({
    queryKey: ['available-cities'],
    queryFn: () => api.searchCities({ limit: 100 }),
    staleTime: 1000 * 60 * 30,
  });

  // Query activities using React Query
  const {
    data: activities = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      'activities',
      {
        cityId: selectedCityId,
        category: selectedCategories.join(','),
        maxCost,
        maxDuration,
        q: debouncedSearch,
      },
    ],
    queryFn: () =>
      api.searchActivities({
        cityId: selectedCityId || undefined,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        maxCost: maxCost ? parseFloat(maxCost) : undefined,
        maxDuration: maxDuration ? parseInt(maxDuration, 10) : undefined,
        q: debouncedSearch || undefined,
        limit: 50,
      }),
  });

  // Direct Stop Assignment Mutation (when navigated from Itinerary Builder with stopId)
  const directAssignMutation = useMutation({
    mutationFn: async (activity: Activity & { cities?: City }) => {
      setAddingActivityId(activity.id);
      return api.assignActivityToStop({
        stop_id: stopId,
        activity_id: activity.id,
        custom_cost: activity.cost ? Number(activity.cost) : undefined,
      });
    },
    onSuccess: (_, activity) => {
      addToast(
        'success',
        'Activity Added to Stop!',
        `"${activity.name}" was added directly to your itinerary stop.`
      );
      queryClient.invalidateQueries({ queryKey: ['trip-activities'] });
      if (tripId) {
        queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      }
      setAddingActivityId(null);
      if (detailActivity) setDetailActivity(null);
    },
    onError: (err: any) => {
      addToast('error', 'Failed to Add Activity', err.message || 'Error assigning activity to stop.');
      setAddingActivityId(null);
    },
  });

  const handleAddClick = (activity: Activity & { cities?: City }) => {
    if (stopId) {
      // Direct assignment to current stop
      directAssignMutation.mutate(activity);
    } else {
      // Open trip-picker modal
      setAddTripActivity(activity);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCityId('');
    setSelectedCategories([]);
    setMaxCost('');
    setMaxDuration('');
  };

  const activeFilterCount =
    (selectedCityId ? 1 : 0) +
    selectedCategories.length +
    (maxCost ? 1 : 0) +
    (maxDuration ? 1 : 0) +
    (debouncedSearch ? 1 : 0);

  const selectedCityObj = availableCities.find((c) => c.id === selectedCityId);

  return (
    <div className="py-6 space-y-8 font-sans">
      {/* Stop Context Banner (if navigated from Itinerary Builder) */}
      {stopId && (
        <div className="bg-[#7C3AED]/8 border border-[#7C3AED]/25 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 text-[#5B21B6] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1A1523]">
                Adding activities to itinerary stop {selectedCityObj ? `(${selectedCityObj.name})` : ''}
              </h4>
              <p className="text-xs text-[#6B7280]">
                Clicking "Add" directly attaches the experience to this stop in your itinerary.
              </p>
            </div>
          </div>
          {tripId && (
            <Link to={`/trips/${tripId}/build`}>
              <Button variant="secondary" size="sm">
                ← Back to Builder
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#7C3AED]/8 via-[#F7F5FC] to-white border border-[#E9E4F5] p-6 sm:p-10 overflow-hidden shadow-[0_8px_32px_rgba(124,58,237,0.10)]">
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full pointer-events-none animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle at center, rgba(124,58,237,0.14) 0%, rgba(192,132,252,0.07) 45%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#5B21B6] text-xs font-semibold tracking-wide">
            <span>✨ Experiences &amp; Attractions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1523] tracking-tight leading-tight font-heading">
            Discover Activities &amp; Tours
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280]">
            Browse sightseeing tours, foodie crawls, outdoor adventures, and cultural highlights with duration and cost filters.
          </p>

          {/* Search Input */}
          <div className="pt-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities by name or description (e.g. Louvre, Scuba, Tapas, Gondola)..."
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-[#E9E4F5] rounded-xl text-sm sm:text-base text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] shadow-sm transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#1A1523]"
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
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="sticky top-24">
            <ActivityFilterPanel
              selectedCityId={selectedCityId}
              selectedCategories={selectedCategories}
              maxCost={maxCost}
              maxDuration={maxDuration}
              cities={availableCities}
              onCityChange={setSelectedCityId}
              onCategoryToggle={handleCategoryToggle}
              onMaxCostChange={setMaxCost}
              onMaxDurationChange={setMaxDuration}
              onClearFilters={handleClearAllFilters}
              activeCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Action / Status Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-[#E9E4F5]">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#1A1523] tracking-tight font-heading">
                {isLoading ? 'Searching activities...' : `${activities.length} Experiences Available`}
              </h2>
              {isFetching && !isLoading && (
                <div className="flex items-center gap-1.5 text-xs text-[#7C3AED] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-ping" />
                  <span>Updating...</span>
                </div>
              )}
            </div>

            {/* Mobile Filter Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFilterOpen(true)}
                leftIcon={
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
                <Badge variant="primary" size="sm">
                  Query: "{debouncedSearch}"
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-white">×</button>
                </Badge>
              )}
              {selectedCityObj && (
                <Badge variant="secondary" size="sm">
                  City: {selectedCityObj.name}
                  <button onClick={() => setSelectedCityId('')} className="ml-1 hover:text-white">×</button>
                </Badge>
              )}
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="warning" size="sm" className="capitalize">
                  {cat}
                  <button onClick={() => handleCategoryToggle(cat)} className="ml-1 hover:text-white">×</button>
                </Badge>
              ))}
              {maxCost && (
                <Badge variant="success" size="sm">
                  Max: ${maxCost}
                  <button onClick={() => setMaxCost('')} className="ml-1 hover:text-white">×</button>
                </Badge>
              )}
              {maxDuration && (
                <Badge variant="neutral" size="sm">
                  Max: {parseInt(maxDuration, 10) >= 60 ? `${parseInt(maxDuration, 10) / 60}h` : `${maxDuration}m`}
                  <button onClick={() => setMaxDuration('')} className="ml-1 hover:text-white">×</button>
                </Badge>
              )}
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline ml-2 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Activities Grid / Skeletons / Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <div
                  key={key}
                  className="bg-[#F7F5FC] border border-[#E9E4F5] rounded-2xl overflow-hidden p-0 space-y-3 shadow-sm"
                >
                  <Skeleton variant="rectangular" height={176} className="w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="90%" />
                    <div className="pt-2 flex justify-between items-center">
                      <Skeleton variant="rectangular" width={60} height={24} />
                      <Skeleton variant="rectangular" width={70} height={32} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              title="No Activities Found"
              description="No experiences matched your selected city, category, cost, or duration filters. Try expanding your search criteria."
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
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onCardClick={(act) => setDetailActivity(act)}
                  onAddClick={(act) => handleAddClick(act)}
                  isAdding={addingActivityId === activity.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#1A1523]/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white border-l border-[#E9E4F5] h-full p-6 overflow-y-auto z-10 shadow-[0_8px_32px_rgba(124,58,237,0.15)] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E9E4F5]">
                <h3 className="text-base font-bold text-[#1A1523] font-heading">Filter Activities</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-[#6B7280] hover:text-[#1A1523] p-1 hover:bg-[#F7F5FC] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ActivityFilterPanel
                selectedCityId={selectedCityId}
                selectedCategories={selectedCategories}
                maxCost={maxCost}
                maxDuration={maxDuration}
                cities={availableCities}
                onCityChange={setSelectedCityId}
                onCategoryToggle={handleCategoryToggle}
                onMaxCostChange={setMaxCost}
                onMaxDurationChange={setMaxDuration}
                onClearFilters={handleClearAllFilters}
                activeCount={activeFilterCount}
              />
            </div>

            <div className="pt-6 border-t border-[#E9E4F5]">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters ({activities.length} Results)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Detail Modal */}
      <ActivityDetailModal
        activity={detailActivity}
        isOpen={Boolean(detailActivity)}
        onClose={() => setDetailActivity(null)}
        onAddClick={(act) => handleAddClick(act)}
        isAdding={addingActivityId === detailActivity?.id}
      />

      {/* Add to Trip Modal (when not in specific stop context) */}
      <AddActivityModal
        activity={addTripActivity}
        isOpen={Boolean(addTripActivity)}
        onClose={() => setAddTripActivity(null)}
      />
    </div>
  );
};
export default ActivitySearchPage;
