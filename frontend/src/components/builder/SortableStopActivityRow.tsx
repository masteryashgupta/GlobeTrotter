import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Stop, City } from '../../../../shared/types';
import { StopActivityRow } from './StopActivityRow';

interface SortableStopActivityRowProps {
  tripActivity: any;
  stop: Stop & { cities?: City };
  tripId: string;
}

export const SortableStopActivityRow: React.FC<SortableStopActivityRowProps> = ({
  tripActivity,
  stop,
  tripId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tripActivity.id });

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
      className={isDragging ? 'relative z-50 pointer-events-none' : ''}
    >
      <StopActivityRow
        tripActivity={tripActivity}
        stop={stop}
        tripId={tripId}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};
