import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, Button, Badge, Modal, Input, Select, useToast, Skeleton, EmptyState } from '../components/ui';
import { ShareTripModal } from '../components/trips/ShareTripModal';
import { supabase } from '../lib/supabase';
import { Expense, Trip, Stop } from '../../../shared/types';

const CATEGORIES = [
  { value: 'transport', label: 'Transport', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'stay', label: 'Stay / Accommodations', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'activity', label: 'Activities & Tours', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'meals', label: 'Meals & Food', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'misc', label: 'Miscellaneous', color: '#64748b', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export const BudgetPage: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<{
    total_expenses: number;
    total_activities: number;
    grand_total: number;
    category_breakdown: Record<string, number>;
  }>({
    total_expenses: 0,
    total_activities: 0,
    grand_total: 0,
    category_breakdown: { transport: 0, stay: 0, activity: 0, meals: 0, misc: 0 },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState({
    label: '',
    category: 'meals',
    amount: '',
    stop_id: '',
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  const fetchBudget = async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Fetch Trip details
      const tripRes = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (tripRes.ok) {
        const tripData = await tripRes.json();
        setTrip(tripData);
        setStops(tripData.stops || []);
      }

      // Fetch Expenses & Summary
      const budgetRes = await fetch(`http://localhost:5000/api/budget/trips/${tripId}/expenses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setExpenses(budgetData.expenses || []);
        if (budgetData.summary) {
          setSummary(budgetData.summary);
        }
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [tripId]);

  // Handle Add/Edit Form submission
  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim() || !formData.amount || Number(formData.amount) <= 0) {
      addToast('error', 'Invalid Form', 'Please provide a valid label and positive amount.');
      return;
    }

    try {
      setFormSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const isEdit = !!editingExpense;
      const url = isEdit
        ? `http://localhost:5000/api/budget/expenses/${editingExpense.id}`
        : `http://localhost:5000/api/budget/expenses`;

      const method = isEdit ? 'PATCH' : 'POST';
      const bodyPayload = isEdit
        ? {
            label: formData.label,
            category: formData.category,
            amount: Number(formData.amount),
            stop_id: formData.stop_id || null,
          }
        : {
            trip_id: tripId,
            label: formData.label,
            category: formData.category,
            amount: Number(formData.amount),
            stop_id: formData.stop_id || null,
          };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save expense');
      }

      addToast(
        'success',
        isEdit ? 'Expense Updated' : 'Expense Created',
        `${formData.label} saved successfully.`
      );

      setIsAddModalOpen(false);
      setEditingExpense(null);
      setFormData({ label: '', category: 'meals', amount: '', stop_id: '' });
      fetchBudget();
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to submit expense');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      label: expense.label || '',
      category: expense.category || 'misc',
      amount: String(expense.amount),
      stop_id: expense.stop_id || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`http://localhost:5000/api/budget/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Failed to delete expense');

      addToast('success', 'Deleted', 'Expense item removed.');
      fetchBudget();
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Could not delete expense');
    }
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses;
    return expenses.filter((e) => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  // Chart data formatting
  const pieChartData = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      name: cat.label,
      value: summary.category_breakdown[cat.value] || 0,
      color: cat.color,
    })).filter((item) => item.value > 0);
  }, [summary]);

  const barChartData = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat.label,
      Amount: summary.category_breakdown[cat.value] || 0,
    }));
  }, [summary]);

  if (loading) {
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
            Trip Budget & Expense Tracker
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
          <Button
            variant="primary"
            onClick={() => {
              setEditingExpense(null);
              setFormData({ label: '', category: 'meals', amount: '', stop_id: '' });
              setIsAddModalOpen(true);
            }}
          >
            + Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grand Total Cost</p>
          <p className="text-3xl font-extrabold text-white mt-2">
            ${summary.grand_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Expenses + Scheduled Activities</p>
        </Card>

        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manual Expenses</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${summary.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">{expenses.length} expense items logged</p>
        </Card>

        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activity Costs</p>
          <p className="text-3xl font-extrabold text-sky-400 mt-2">
            ${summary.total_activities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Calculated from itinerary tours</p>
        </Card>

        <Card className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Category</p>
          <p className="text-xl font-bold text-purple-400 mt-2 capitalize">
            {Object.entries(summary.category_breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Highest spending bucket</p>
        </Card>
      </div>

      {/* Visual Charts */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4">Category Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4">Expenses by Category ($)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="Amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Tabs & Expenses Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              All Categories ({expenses.length})
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
            title="No Expenses Logged"
            description="Keep track of your travel costs by adding your first expense item."
            action={
              <Button onClick={() => setIsAddModalOpen(true)}>
                + Add First Expense
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
                          onClick={() => handleEditClick(exp)}
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

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <Input
            label="Expense Label / Description"
            placeholder="e.g. Train ticket from Paris to Nice"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />

            <Input
              label="Amount ($ USD)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          {stops.length > 0 && (
            <Select
              label="Link to Specific Itinerary Stop (Optional)"
              value={formData.stop_id}
              onChange={(e) => setFormData({ ...formData, stop_id: e.target.value })}
              options={[
                { value: '', label: '-- None (Entire Trip Expense) --' },
                ...stops.map((s, idx) => ({
                  value: s.id,
                  label: `Stop ${idx + 1}: ${s.arrival_date} to ${s.departure_date}`,
                })),
              ]}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={formSubmitting}>
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
          onShareUpdated={({ is_public, share_token }) => {
            setTrip({ ...trip, is_public, share_token });
          }}
        />
      )}
    </div>
  );
};
