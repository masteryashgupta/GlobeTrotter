import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Card, Button, Badge, Modal, Input, Select, useToast, Skeleton, EmptyState } from '../components/ui';
import { ShareTripModal } from '../components/trips/ShareTripModal';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { Expense, Trip } from '../../../shared/types';
import {
  expenseCreateSchema,
  expenseUpdateSchema,
  ExpenseCreateInput,
  ExpenseUpdateInput,
} from '../../../shared/validation';

const CATEGORIES = [
  { value: 'transport', label: 'Transport', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'stay', label: 'Stay / Accommodations', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'activity', label: 'Activities & Tours', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'meals', label: 'Meals & Food', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'misc', label: 'Miscellaneous', color: '#64748b', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

interface BudgetBreakdownData {
  byCategory: {
    transport: number;
    stay: number;
    activity: number;
    meals: number;
    misc: number;
  };
  total: number;
  tripDurationDays: number;
  perDayAverage: number;
  perDay: Array<{ date: string; total: number }>;
}

export const BudgetPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Component State for Threshold & Filter
  const [dailyThresholdInput, setDailyThresholdInput] = useState<string>(() => {
    return localStorage.getItem(`globetrotter_daily_budget_${tripId}`) || '150';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const dailyThreshold = useMemo(() => {
    const val = Number(dailyThresholdInput);
    return isNaN(val) || val <= 0 ? 0 : val;
  }, [dailyThresholdInput]);

  const handleThresholdChange = (val: string) => {
    setDailyThresholdInput(val);
    if (tripId) {
      localStorage.setItem(`globetrotter_daily_budget_${tripId}`, val);
    }
  };

  // Helper token fetcher
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // 1. Fetch Trip details
  const { data: trip, isLoading: isTripLoading } = useQuery<Trip>({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load trip details');
      return res.json();
    },
    enabled: !!tripId,
  });

  // 2. Fetch Budget Aggregation from GET /api/trips/:tripId/budget
  const { data: budgetData, isLoading: isBudgetLoading } = useQuery<BudgetBreakdownData>({
    queryKey: ['trip-budget', tripId],
    queryFn: async () => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/budget`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load budget breakdown');
      return res.json();
    },
    enabled: !!tripId,
  });

  // 3. Fetch Manual Expenses from GET /api/trips/:tripId/expenses
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery<Expense[]>({
    queryKey: ['trip-expenses', tripId],
    queryFn: async () => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/expenses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load manual expenses');
      return res.json();
    },
    enabled: !!tripId,
  });

  // Supabase Realtime subscription on expenses and trip_activities for live budget updates
  React.useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`budget_realtime_${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['trip-budget', tripId] });
          queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_activities',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['trip-budget', tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  // React Hook Form for Add/Edit Expense
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseCreateInput>({
    resolver: zodResolver(expenseCreateSchema),
    defaultValues: {
      trip_id: tripId || '',
      category: 'meals',
      label: '',
      amount: 0,
      stop_id: null,
    },
  });

  // Mutations for Create / Update / Delete
  const createMutation = useMutation({
    mutationFn: async (formData: ExpenseCreateInput) => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...formData, trip_id: tripId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create expense');
      }
      return res.json();
    },
    onSuccess: () => {
      addToast('success', 'Expense Added', 'New expense logged successfully.');
      queryClient.invalidateQueries({ queryKey: ['trip-budget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] });
      setIsAddModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      addToast('error', 'Failed to Add', err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpenseUpdateInput }) => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update expense');
      }
      return res.json();
    },
    onSuccess: () => {
      addToast('success', 'Expense Updated', 'Expense changes saved.');
      queryClient.invalidateQueries({ queryKey: ['trip-budget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] });
      setIsAddModalOpen(false);
      setEditingExpense(null);
      reset();
    },
    onError: (err: any) => {
      addToast('error', 'Update Failed', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      return res.json();
    },
    onSuccess: () => {
      addToast('success', 'Deleted', 'Expense item removed.');
      queryClient.invalidateQueries({ queryKey: ['trip-budget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] });
    },
    onError: (err: any) => {
      addToast('error', 'Delete Failed', err.message);
    },
  });

  const onSubmitForm = (data: ExpenseCreateInput) => {
    if (editingExpense) {
      updateMutation.mutate({
        id: editingExpense.id,
        data: {
          category: data.category,
          label: data.label,
          amount: data.amount,
          stop_id: data.stop_id,
        },
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    reset({
      trip_id: tripId || '',
      category: 'meals',
      label: '',
      amount: 0,
      stop_id: null,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      trip_id: tripId || '',
      category: expense.category || 'misc',
      label: expense.label || '',
      amount: Number(expense.amount),
      stop_id: expense.stop_id || null,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense entry?')) {
      deleteMutation.mutate(expenseId);
    }
  };

  // Overbudget reactive list & calculations
  const overbudgetDays = useMemo(() => {
    if (!budgetData?.perDay || dailyThreshold <= 0) return [];
    return budgetData.perDay.filter((day) => day.total > dailyThreshold);
  }, [budgetData, dailyThreshold]);

  // Pie chart formatting with percentage labels
  const pieChartData = useMemo(() => {
    if (!budgetData?.byCategory) return [];
    const totalCost = budgetData.total || 1;
    return CATEGORIES.map((cat) => {
      const val = budgetData.byCategory[cat.value as keyof typeof budgetData.byCategory] || 0;
      const pct = Math.round((val / totalCost) * 100);
      return {
        name: cat.label,
        value: val,
        percentage: pct,
        color: cat.color,
      };
    }).filter((item) => item.value > 0);
  }, [budgetData]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses;
    return expenses.filter((e) => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const isLoading = isTripLoading || isBudgetLoading || isExpensesLoading;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const stops = (trip as any)?.stops || [];
  const hasCostData = (budgetData?.total || 0) > 0 || expenses.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <Link to="/trips" className="hover:text-emerald-400 transition-colors">Trips</Link>
            <span>/</span>
            <span>{trip?.name || 'Trip Budget'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trip Budget Breakdown & Expenses
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            Share Trip
          </Button>
          <Button variant="primary" onClick={openAddModal}>
            + Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Metric Cards & Target Threshold Control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grand Total Cost</p>
          <p className="text-3xl font-extrabold text-white mt-2">
            ${(budgetData?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Scheduled Activities + Manual Expenses</p>
        </Card>

        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trip Duration</p>
          <p className="text-3xl font-extrabold text-sky-400 mt-2">
            {budgetData?.tripDurationDays || 1} {budgetData?.tripDurationDays === 1 ? 'Day' : 'Days'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{trip?.start_date} &rarr; {trip?.end_date}</p>
        </Card>

        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Per-Day Average</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${(budgetData?.perDayAverage || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Average daily cost</p>
        </Card>

        {/* Configurable Target Daily Budget Input */}
        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Target Budget</p>
            {overbudgetDays.length > 0 && (
              <Badge variant="danger" size="sm">
                {overbudgetDays.length} Over
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold text-slate-400">₹</span>
            <input
              type="number"
              step="10"
              min="1"
              value={dailyThresholdInput}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xl font-extrabold text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Set target limit per day</p>
        </Card>
      </div>

      {/* Overbudget Days Alert Banner */}
      {overbudgetDays.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3 shadow-lg">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">
              Daily Budget Threshold Exceeded ({overbudgetDays.length} {overbudgetDays.length === 1 ? 'day' : 'days'})
            </h4>
            <p className="text-xs text-rose-300/90 mt-1">
              Your spending on the following days exceeds your <span className="font-bold text-white">₹{dailyThreshold}/day</span> target:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {overbudgetDays.map((d) => (
                <span
                  key={d.date}
                  className="px-2.5 py-1 rounded-lg bg-rose-900/60 border border-rose-700/60 text-xs font-semibold font-mono text-rose-100"
                >
                  📅 {d.date}: ₹{d.total.toFixed(2)} (+₹{(d.total - dailyThreshold).toFixed(2)})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts Container */}
      {!hasCostData ? (
        <EmptyState
          title="No Budget Data Yet"
          description="Add some stops and activities to your itinerary, or log an expense below to see your full budget breakdown."
          action={
            <Button variant="primary" onClick={openAddModal}>
              + Log First Expense
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart: Category Breakdown */}
          <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Category Cost Breakdown</h3>
              <span className="text-xs text-slate-400">Activities + Expenses</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string | number; percent?: number }) =>
                      `${name} (${Math.round((percent || 0) * 100)}%)`
                    }
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Cost']}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar Chart: Per-Day Timeline Costs with Overbudget Highlighting */}
          <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Daily Cost Timeline ($)</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Within Target
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" /> Over Budget
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData?.perDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Total Spent']}
                  />
                  {dailyThreshold > 0 && (
                    <ReferenceLine
                      y={dailyThreshold}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      label={{ value: `$${dailyThreshold}/day target`, fill: '#f43f5e', fontSize: 10, position: 'top' }}
                    />
                  )}
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {(budgetData?.perDay || []).map((entry, index) => {
                      const isOver = dailyThreshold > 0 && entry.total > dailyThreshold;
                      return <Cell key={`cell-day-${index}`} fill={isOver ? '#f43f5e' : '#10b981'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Manual Expenses Section & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Manual Expense Ledger</h2>

          {/* Filter Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              All ({expenses.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = expenses.filter((e) => e.category === cat.value).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <EmptyState
            title="No Manual Expenses Found"
            description="Log your custom transport, accommodation, meal, or itemized costs."
            action={
              <Button onClick={openAddModal}>
                + Add Expense
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Label / Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Linked Stop</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.map((exp) => {
                  const catConfig = CATEGORIES.find((c) => c.value === exp.category) || CATEGORIES[4];
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{exp.label}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${catConfig.bg}`}>
                          {catConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {exp.stop_id ? 'Linked to Stop' : 'General Trip Expense'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        ${Number(exp.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          className="px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                          onClick={() => openEditModal(exp)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300"
                          onClick={() => handleDeleteExpense(exp.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal with React Hook Form + Zod */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
          reset();
        }}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <Input
              label="Expense Label / Description"
              placeholder="e.g. Train ticket from Paris to Nice"
              {...register('label')}
            />
            {errors.label && (
              <p className="text-xs text-rose-400 mt-1">{errors.label.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Category"
                {...register('category')}
                options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
              {errors.category && (
                <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Input
                label="Amount (₹ INR)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {stops.length > 0 && (
            <div>
              <Select
                label="Link to Specific Itinerary Stop (Optional)"
                {...register('stop_id')}
                options={[
                  { value: '', label: '-- None (Entire Trip Expense) --' },
                  ...stops.map((s: any, idx: number) => ({
                    value: s.id,
                    label: `Stop ${idx + 1}: ${s.arrival_date} to ${s.departure_date}`,
                  })),
                ]}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingExpense(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {editingExpense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share Modal */}
      {trip && (
        <ShareTripModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          tripId={trip.id}
          tripName={trip.name || 'Trip'}
          isPublic={trip.is_public}
          shareToken={trip.share_token}
          onShareUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
          }}
        />
      )}
    </div>
  );
};
