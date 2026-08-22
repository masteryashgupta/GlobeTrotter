import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Modal,
  Badge,
  Skeleton,
  ToastProvider,
  useToast,
  EmptyState,
} from './components/ui';

const DesignSystemDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-6xl mx-auto space-y-12">
      <header className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-4 h-4 rounded-full bg-teal-500" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">GlobeTrotter Design System</h1>
        </div>
        <p className="text-slate-400">
          Shared component library for responsive, consistent full-stack travel UI.
        </p>
      </header>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-teal-400">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-teal-400">Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Confirmed</Badge>
          <Badge variant="warning">Draft</Badge>
          <Badge variant="danger">Cancelled</Badge>
          <Badge variant="neutral">Archived</Badge>
        </div>
      </section>

      {/* Form Controls */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-teal-400">Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Trip Name" placeholder="e.g. Summer in Tokyo" helperText="Enter a descriptive title" />
          <Input label="Budget ($)" placeholder="2000" error="Budget must be greater than 0" />
          <Select
            label="Category"
            options={[
              { label: 'Sightseeing', value: 'sightseeing' },
              { label: 'Food & Dining', value: 'food' },
            ]}
          />
          <Textarea label="Trip Overview" placeholder="Describe your plans..." rows={3} />
        </div>
      </section>

      {/* Card & Modal */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-teal-400">Card & Modal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Tokyo Adventure</Card.Title>
                <Badge variant="success">Public</Badge>
              </div>
              <Card.Description>7 days in Japan • 4 Stops</Card.Description>
            </Card.Header>
            <Card.Content>
              <p className="text-sm text-slate-300">
                Explore Shibuya Crossing, Fushimi Inari, teamLab art, and local izakayas.
              </p>
            </Card.Content>
            <Card.Footer>
              <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToast('success', 'Trip Shared!', 'Copied link to clipboard.')}
              >
                Trigger Toast
              </Button>
            </Card.Footer>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Loading Skeleton Preview</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              <Skeleton variant="rectangular" height={120} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Card.Content>
          </Card>
        </div>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-teal-400">Empty State</h2>
        <EmptyState
          title="No itineraries planned yet"
          description="Create your first trip or explore popular destinations around the world."
          action={<Button variant="primary">Create First Trip</Button>}
        />
      </section>

      {/* Demo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Interactive Modal Component"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Save Changes
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300 mb-4">
          This accessible modal closes on ESC key press or backdrop click.
        </p>
        <Input label="Activity Name" placeholder="e.g. Tsukiji Fish Market" />
      </Modal>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ToastProvider>
      <DesignSystemDemo />
    </ToastProvider>
  </React.StrictMode>
);
