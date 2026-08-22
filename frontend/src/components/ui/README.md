# GlobeTrotter Shared Component Library

This design system library enforces visual and functional consistency across all 4 project feature branches (`part-a`, `part-b`, `part-c`, `part-d`).

## Design Tokens

- **Font:** Inter (`font-sans`)
- **Primary:** Teal (`#0f766e` / `#14b8a6`)
- **Secondary:** Indigo (`#6366f1`)
- **Success:** Emerald (`#10b981`)
- **Warning:** Amber (`#f59e0b`)
- **Danger:** Rose (`#f43f5e`)
- **Neutral:** Slate Scale (`#0f172a` to `#f8fafc`)

---

## Component Usage Guide

### 1. Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" isLoading={false}>
  Create Trip
</Button>
<Button variant="outline" size="sm">
  Cancel
</Button>
```

### 2. Input
```tsx
import { Input } from '@/components/ui';

<Input
  label="Destination City"
  placeholder="e.g. Paris"
  error={errors.city?.message}
  helperText="Enter the primary city of your trip"
/>
```

### 3. Select
```tsx
import { Select } from '@/components/ui';

<Select
  label="Category"
  options={[
    { label: 'Sightseeing', value: 'sightseeing' },
    { label: 'Food', value: 'food' },
  ]}
/>
```

### 4. Textarea
```tsx
import { Textarea } from '@/components/ui';

<Textarea label="Trip Notes" placeholder="Add itinerary notes..." rows={3} />
```

### 5. Card
```tsx
import { Card } from '@/components/ui';

<Card hoverable>
  <Card.Header>
    <Card.Title>Trip to Tokyo</Card.Title>
    <Card.Description>7 days in Japan</Card.Description>
  </Card.Header>
  <Card.Content>Content goes here...</Card.Content>
  <Card.Footer>
    <Button size="sm">View Itinerary</Button>
  </Card.Footer>
</Card>
```

### 6. Modal
```tsx
import { Modal, Button } from '@/components/ui';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Activity">
  <p>Modal content</p>
</Modal>
```

### 7. Badge
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Confirmed</Badge>
<Badge variant="warning">Draft</Badge>
```

### 8. Skeleton
```tsx
import { Skeleton } from '@/components/ui';

<Skeleton variant="rectangular" height={200} className="w-full mb-4" />
<Skeleton variant="text" width="60%" />
```

### 9. Toast System
```tsx
import { ToastProvider, useToast } from '@/components/ui';

// Wrap app in <ToastProvider>
const { addToast } = useToast();
addToast('success', 'Trip Saved', 'Your itinerary was saved successfully.');
```

### 10. EmptyState
```tsx
import { EmptyState, Button } from '@/components/ui';

<EmptyState
  title="No trips created yet"
  description="Start planning your next travel adventure today."
  action={<Button>Create First Trip</Button>}
/>
```
