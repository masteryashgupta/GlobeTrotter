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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Trips</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your travel itineraries, edit details, or build out daily stops
          </p>
        </div>
        <Link to="/trips/new" className="shrink-0">
          <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-teal-900/30">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} hoverable className="flex flex-col justify-between group overflow-hidden">
              <div>
                <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-slate-800 relative">
                  <img
                    src={
                      trip.cover_photo_url ||
                      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={trip.name || 'Trip Cover'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={trip.is_public ? 'success' : 'neutral'}>
                      {trip.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>

                <Card.Title className="group-hover:text-teal-400 transition-colors">
                  {trip.name || 'Untitled Trip'}
                </Card.Title>
                <p className="text-xs text-slate-400 mt-1">
                  📅 {trip.start_date} to {trip.end_date}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  📍 0 Stops (Part B Itinerary Integration)
                </p>
                {trip.description && (
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{trip.description}</p>
                )}
              </div>

              <Card.Footer className="mt-4 pt-3 flex items-center justify-between border-t border-slate-800">
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
        <p className="text-sm text-slate-300">
          Are you sure you want to delete <strong className="text-white">"{tripToDelete?.name}"</strong>?
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
