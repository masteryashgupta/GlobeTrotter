import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { expenseCreateSchema, expenseUpdateSchema, ExpenseCreateInput, ExpenseUpdateInput } from '../shared/validation';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const expensesRouter = Router({ mergeParams: true });

// Helper: Check trip ownership
async function checkTripOwnership(userId: string, tripId: string): Promise<boolean> {
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('owner_id')
    .eq('id', tripId)
    .single();

  return !!trip && (trip as any).owner_id === userId;
}

// 1. POST /api/trips/:tripId/expenses - Create manual expense for a trip
expensesRouter.post(
  '/trips/:tripId/expenses',
  requireAuth,
  validateBody(expenseCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tripId = req.params.tripId || req.body.trip_id;
      const userId = req.user!.id;
      const payload: ExpenseCreateInput = req.body;

      if (!tripId) {
        return res.status(400).json({ error: 'Trip ID is required' });
      }

      // Ownership check
      const isOwner = await checkTripOwnership(userId, tripId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
      }

      const { data: expense, error } = await supabaseAdmin
        .from('expenses')
        .insert({
          trip_id: tripId,
          stop_id: payload.stop_id || null,
          category: payload.category,
          label: payload.label,
          amount: payload.amount,
        } as any)
        .select('*')
        .single();

      if (error) {
        return res.status(400).json({ error: 'Failed to create expense', details: error.message });
      }

      return res.status(201).json(expense);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error creating expense', details: err.message });
    }
  }
);

// 2. GET /api/trips/:tripId/expenses - List manual expenses for a trip
expensesRouter.get('/trips/:tripId/expenses', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.id;

    // Check ownership or public accessibility
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('owner_id, is_public')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if ((trip as any).owner_id !== userId && !trip.is_public) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this trip' });
    }

    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (expensesError) {
      return res.status(400).json({ error: 'Failed to fetch expenses', details: expensesError.message });
    }

    return res.json(expenses || []);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching expenses', details: err.message });
  }
});

// 3. PATCH /api/expenses/:id - Update expense
expensesRouter.patch(
  '/expenses/:id',
  requireAuth,
  validateBody(expenseUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const expenseId = req.params.id;
      const userId = req.user!.id;
      const payload: ExpenseUpdateInput = req.body;

      // Fetch existing expense and check ownership via trip
      const { data: existingExp, error: fetchErr } = await supabaseAdmin
        .from('expenses')
        .select('*, trips(owner_id)')
        .eq('id', expenseId)
        .single();

      if (fetchErr || !existingExp) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      const ownerId = (existingExp as any).trips?.owner_id;
      if (ownerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this expense' });
      }

      const { data: updatedExp, error } = await supabaseAdmin
        .from('expenses')
        .update({
          ...payload,
        } as any)
        .eq('id', expenseId)
        .select('*')
        .single();

      if (error) {
        return res.status(400).json({ error: 'Failed to update expense', details: error.message });
      }

      return res.json(updatedExp);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error updating expense', details: err.message });
    }
  }
);

// 4. DELETE /api/expenses/:id - Delete expense
expensesRouter.delete('/expenses/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user!.id;

    // Fetch existing expense and check ownership
    const { data: existingExp, error: fetchErr } = await supabaseAdmin
      .from('expenses')
      .select('*, trips(owner_id)')
      .eq('id', expenseId)
      .single();

    if (fetchErr || !existingExp) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const ownerId = (existingExp as any).trips?.owner_id;
    if (ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this expense' });
    }

    const { error } = await supabaseAdmin.from('expenses').delete().eq('id', expenseId);

    if (error) {
      return res.status(400).json({ error: 'Failed to delete expense', details: error.message });
    }

    return res.status(200).json({ message: 'Expense deleted successfully', id: expenseId });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error deleting expense', details: err.message });
  }
});
