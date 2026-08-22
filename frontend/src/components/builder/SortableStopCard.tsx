import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Stop, City } from '../../../../shared/types';
import { StopCard } from './StopCard';

interface SortableStopCardProps {
  stop: Stop & { cities?: City; trip_activities?: any[] };
  index: number;
  totalStops: number;
  tripId: string;
  onEdit: (stop: Stop & { cities?: City }) => void;
  onDelete: (stop: Stop & { cities?: City }) => void;
}

export const SortableStopCard: React.FC<SortableStopCardProps> = ({
  stop,
  index,
  totalStops,
  tripId,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'relative z-50 pointer-events-none' : ''}`}
    >
      <StopCard
        stop={stop}
        index={index}
        totalStops={totalStops}
        tripId={tripId}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};
