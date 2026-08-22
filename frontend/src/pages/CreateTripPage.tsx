import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui';
import { TripForm } from '../components/trips/TripForm';

export const CreateTripPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Plan a New Trip</h1>
          <p className="text-sm text-slate-400">Define your travel dates and cover photo to get started</p>
        </div>
        <Link to="/trips" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Back to My Trips
        </Link>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Trip Details</Card.Title>
        </Card.Header>
        <Card.Content>
          <TripForm />
        </Card.Content>
      </Card>
    </div>
  );
};
