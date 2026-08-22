import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stop, City } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Modal, Button, useToast } from '../ui';

interface DeleteStopModalProps {
  stop: (Stop & { cities?: City }) | null;
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export const DeleteStopModal: React.FC<DeleteStopModalProps> = ({
  stop,
  isOpen,
  onClose,
  tripId,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!stop) return;
      return api.deleteStop(stop.id);
    },
    onSuccess: () => {
      addToast(
        'success',
        'Stop Removed',
        `${stop?.cities?.name || 'Stop'} has been removed from your trip itinerary.`
      );
      queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      onClose();
    },
    onError: (err: any) => {
      addToast('error', 'Failed to Delete Stop', err.message || 'Error deleting stop.');
    },
  });

  if (!stop) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Itinerary Stop"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete Stop
          </Button>
        </>
      }
    >
      <div className="space-y-3 py-1 font-sans">
        <p className="text-sm text-[#1A1523]">
          Are you sure you want to remove <strong className="text-[#1A1523] font-bold">{stop.cities?.name || 'this destination'}</strong> from your trip itinerary?
        </p>
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444]">
          ⚠️ This will also delete any scheduled activities and day plans assigned to this stop.
        </div>
      </div>
    </Modal>
  );
};
