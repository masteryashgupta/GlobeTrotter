import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { Trip } from '../../../shared/types';
import { Card, Button, Badge, Skeleton, EmptyState, Modal, useToast } from '../components/ui';
import { TripForm } from '../components/trips/TripForm';

export const MyTripsPage: React.FC = () => {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all user trips via backend GET /api/trips or direct Supabase fallback
  const {
    data: trips = [],
    isLoading,
  } = useQuery<Trip[]>({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const token = session?.access_token;

      try {
        const res = await fetch(`${API_BASE_URL}/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend fetch failed, using direct client query');
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!user,
  });

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    setIsDeleting(true);

    try {
      const token = session?.access_token;

      const res = await fetch(`${API_BASE_URL}/trips/${tripToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        addToast('error', 'Delete Failed', err.error || 'Could not delete trip.');
        return;
      }

      addToast('success', 'Trip Deleted', `Successfully deleted "${tripToDelete.name}".`);
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
      setTripToDelete(null);
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to delete trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E9E4F5] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1523] tracking-tight font-heading">My Trips</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Manage your travel itineraries, edit details, or build out daily stops
          </p>
        </div>
        <Link to="/trips/new" className="shrink-0">
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            + Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Grid / Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n}>
              <Skeleton variant="rectangular" height={160} className="mb-4" />
              <Skeleton variant="text" width="60%" className="mb-2" />
              <Skeleton variant="text" width="40%" />
            </Card>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          title="No Travel Itineraries Yet"
          description="Start planning your adventure by defining trip dates, cover photos, and destinations."
          action={
            <Link to="/trips/new">
              <Button variant="primary" size="lg">
                + Create Your First Trip
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          {/* Wireframe Screen 6 Categorized Layout */}
          {(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const ongoing = trips.filter(t => t.start_date <= todayStr && t.end_date >= todayStr);
            const upcoming = trips.filter(t => t.start_date > todayStr);
            const completed = trips.filter(t => t.end_date < todayStr);

            const renderCardList = (items: Trip[]) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((trip, i) => (
                  // [STYLING] Stagger animation + violet hover colors
                  <Card key={trip.id} hoverable className={`flex flex-col justify-between group overflow-hidden animate-fade-up animate-stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}>
                    <div>
                      <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-[#F7F5FC] relative">
                        <img
                          src={
                            trip.cover_photo_url ||
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={trip.name || 'Trip Cover'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <Badge variant={trip.is_public ? 'success' : 'neutral'}>
                            {trip.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                      </div>

                      <Card.Title className="group-hover:text-[#7C3AED] transition-colors">
                        {trip.name || 'Untitled Trip'}
                      </Card.Title>
                      <p className="text-xs text-[#6B7280] mt-1">
                        📅 {trip.start_date} to {trip.end_date}
                      </p>
                      {trip.description && (
                        <p className="text-xs text-[#6B7280] mt-2 line-clamp-2">{trip.description}</p>
                      )}
                    </div>

                    <Card.Footer className="mt-4 pt-3 flex items-center justify-between border-t border-[#E9E4F5]">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/trips/${trip.id}/build`)}
                        >
                          Build
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/trips/${trip.id}/view`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTripToEdit(trip)}
                        >
                          Edit
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setTripToDelete(trip)}
                      >
                        Delete
                      </Button>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            );

            return (
              <>
                {/* Ongoing Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E9E4F5] pb-2">
                    <span className="text-[#22C55E] text-lg">🟢</span>
                    <h2 className="text-xl font-bold text-[#1A1523] font-heading">Ongoing Trips</h2>
                    <span className="text-xs bg-[#22C55E]/10 text-[#15803D] border border-[#22C55E]/30 px-2 py-0.5 rounded-full ml-1">
                      {ongoing.length}
                    </span>
                  </div>
                  {ongoing.length > 0 ? (
                    renderCardList(ongoing)
                  ) : (
                    <p className="text-xs text-[#6B7280] italic">No trips currently in progress.</p>
                  )}
                </section>

                {/* Upcoming Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E9E4F5] pb-2">
                    <span className="text-sky-500 text-lg">✈️</span>
                    <h2 className="text-xl font-bold text-[#1A1523] font-heading">Upcoming Trips</h2>
                    <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full ml-1">
                      {upcoming.length}
                    </span>
                  </div>
                  {upcoming.length > 0 ? (
                    renderCardList(upcoming)
                  ) : (
                    <p className="text-xs text-[#6B7280] italic">No upcoming trips planned yet.</p>
                  )}
                </section>

                {/* Completed Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E9E4F5] pb-2">
                    <span className="text-[#7C3AED] text-lg">🏁</span>
                    <h2 className="text-xl font-bold text-[#1A1523] font-heading">Completed Trips</h2>
                    <span className="text-xs bg-[#7C3AED]/10 text-[#5B21B6] border border-[#C4B5FD]/50 px-2 py-0.5 rounded-full ml-1">
                      {completed.length}
                    </span>
                  </div>
                  {completed.length > 0 ? (
                    renderCardList(completed)
                  ) : (
                    <p className="text-xs text-[#6B7280] italic">No completed past trips found.</p>
                  )}
                </section>
              </>
            );
          })()}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        title="Confirm Trip Deletion"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTripToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTrip} isLoading={isDeleting}>
              Delete Trip
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280]">
          Are you sure you want to delete <strong className="text-[#1A1523]">"{tripToDelete?.name}"</strong>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal
        isOpen={!!tripToEdit}
        onClose={() => setTripToEdit(null)}
        title="Edit Trip Details"
        size="lg"
      >
        {tripToEdit && (
          <TripForm
            initialValues={tripToEdit}
            isEdit={true}
            onSuccess={() => {
              setTripToEdit(null);
              queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
            }}
          />
        )}
      </Modal>
    </div>
  );
};
