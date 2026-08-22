import React from 'react';
import { Card, Badge } from '../components/ui';

export const PlaceholderPage: React.FC<{ title: string; part: string; description?: string }> = ({
  title,
  part,
  description = 'This feature is currently under active development.',
}) => {
  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
          <p className="text-slate-400 mt-1">{description}</p>
        </div>
        <Badge variant="secondary">{part}</Badge>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>{title} Module</Card.Title>
          <Card.Description>Assigned to feature team branch ({part})</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center bg-slate-900/40">
            <p className="text-slate-300 font-medium mb-2">Coming Soon</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The routing skeleton and navigation shell are fully wired up. The UI screen implementation for this route will be dropped in by the assigned team member.
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
