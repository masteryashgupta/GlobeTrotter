# GlobeTrotter Shared Zod Validation Schemas

Every form in this app must use one of these schemas with `react-hook-form`'s `zodResolver` on the frontend, AND the same schema must validate the request body on the backend before touching the database. Never trust client-only validation.

## Exported Schemas & Inferred Types

| Schema Name | Target Entity | Inferred Type |
|---|---|---|
| `signUpSchema` | User Registration | `SignUpInput` |
| `signInSchema` | User Authentication | `SignInInput` |
| `resetPasswordSchema` | Password Reset Request | `ResetPasswordInput` |
| `profileUpdateSchema` | Profile Settings | `ProfileUpdateInput` |
| `tripCreateSchema` | Trip Creation | `TripCreateInput` |
| `tripUpdateSchema` | Trip Editing | `TripUpdateInput` |
| `stopCreateSchema` | Trip Itinerary Stop | `StopCreateInput` |
| `tripActivityCreateSchema` | Scheduled Activity | `TripActivityCreateInput` |
| `expenseCreateSchema` | Budget Expense Item | `ExpenseCreateInput` |

---

## Frontend Example (`react-hook-form` + `zodResolver`)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripCreateSchema, TripCreateInput } from '../../../../shared/validation';

const CreateTripForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<TripCreateInput>({
    resolver: zodResolver(tripCreateSchema),
  });

  const onSubmit = (data: TripCreateInput) => {
    // Submit payload to backend / Supabase
  };
};
```

---

## Backend Route Example (Express + Zod)

```ts
import { Request, Response } from 'express';
import { tripCreateSchema } from '../../shared/validation';

export const createTripHandler = (req: Request, res: Response) => {
  const parseResult = tripCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.flatten() });
  }

  const validData = parseResult.data;
  // Insert into Postgres/Supabase safely
};
```
