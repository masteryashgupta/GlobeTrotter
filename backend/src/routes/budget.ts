import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { expenseCreateSchema, expenseUpdateSchema, ExpenseCreateInput, ExpenseUpdateInput } from '../shared/validation';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const budgetRouter = Router();

// Helper: Check if user owns the trip
async function checkTripOwnership(userId: string, tripId: string): Promise<boolean> {
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('owner_id')
    .eq('id', tripId)
    .single();

  return !!trip && (trip as any).owner_id === userId;
}

// 1. GET /api/budget/trips/:tripId/expenses - List expenses & budget summary
budgetRouter.get('/trips/:tripId/expenses', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (expensesError) {
      return res.status(400).json({ error: 'Failed to fetch expenses', details: expensesError.message });
    }

    const expenseList = expenses || [];

    // Calculate category breakdown
    const categorySummary: Record<string, number> = {
      transport: 0,
      stay: 0,
      activity: 0,
      meals: 0,
      misc: 0,
    };

    let totalExpensesCost = 0;
    expenseList.forEach((exp: any) => {
      const amt = Number(exp.amount) || 0;
      totalExpensesCost += amt;
      const cat = exp.category || 'misc';
      if (categorySummary[cat] !== undefined) {
        categorySummary[cat] += amt;
      } else {
        categorySummary[cat] = amt;
      }
    });

    // Calculate activity costs from itinerary stops
    const { data: stops } = await supabaseAdmin
      .from('stops')
      .select('id')
      .eq('trip_id', tripId);

    let activitiesCost = 0;

    if (stops && stops.length > 0) {
      const stopIds = stops.map((s) => s.id);
      const { data: tripActivities } = await supabaseAdmin
        .from('trip_activities')
        .select('custom_cost, activities(cost)')
        .in('stop_id', stopIds);

      (tripActivities || []).forEach((act: any) => {
        const cost = act.custom_cost ?? act.activities?.cost ?? 0;
        activitiesCost += Number(cost);
      });
    }

    const grandTotal = totalExpensesCost + activitiesCost;

    return res.json({
      trip_id: tripId,
      expenses: expenseList,
      summary: {
        total_expenses: totalExpensesCost,
        total_activities: activitiesCost,
        grand_total: grandTotal,
        category_breakdown: categorySummary,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error fetching trip budget', details: err.message });
  }
});

// 2. POST /api/budget/expenses - Create new expense
budgetRouter.post(
  '/expenses',
  requireAuth,
  validateBody(expenseCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const payload: ExpenseCreateInput = req.body;
      if (!payload.trip_id) {
        return res.status(400).json({ error: 'Trip ID is required' });
      }

      const isOwner = await checkTripOwnership(userId, payload.trip_id);
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: You do not own this trip' });
      }

      const { data: expense, error } = await supabaseAdmin
        .from('expenses')
        .insert({
          trip_id: payload.trip_id,
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

// 3. PATCH /api/budget/expenses/:id - Update expense
budgetRouter.patch(
  '/expenses/:id',
  requireAuth,
  validateBody(expenseUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const expenseId = req.params.id;
      const userId = req.user!.id;
      const payload: ExpenseUpdateInput = req.body;

      // Fetch existing expense
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

// 4. DELETE /api/budget/expenses/:id - Delete expense
budgetRouter.delete('/expenses/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user!.id;

    // Fetch existing expense
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
