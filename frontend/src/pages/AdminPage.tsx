import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';
import { Card, Skeleton, Button, EmptyState } from '../components/ui';
import { API_BASE_URL } from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminStats {
  total_users: number;
  total_trips: number;
  trips_last_7_days: number;
  trips_last_30_days: number;
  avg_trip_duration_days: number | null;
  top_cities: Array<{
    city_id: string;
    name: string;
    country: string;
    image_url: string | null;
    stop_count: number;
  }>;
  top_activities: Array<{
    activity_id: string;
    name: string;
    category: string | null;
    image_url: string | null;
    booking_count: number;
  }>;
}

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
  trip_count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ─── Colours ─────────────────────────────────────────────────────────────────
const CITY_COLOURS = [
  '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6',
  '#ec4899', '#f59e0b', '#10b981', '#f43f5e',
  '#3b82f6', '#a78bfa',
];
const ACTIVITY_COLOURS = [
  '#f59e0b', '#10b981', '#6366f1', '#ec4899',
  '#14b8a6', '#0ea5e9', '#8b5cf6', '#f43f5e',
  '#3b82f6', '#a78bfa',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  colour = 'teal',
}: {
  label: string;
  value: string | number;
  sub?: string;
  colour?: 'teal' | 'indigo' | 'amber' | 'rose';
}) {
  const ring = {
    teal: 'border-teal-500/30 shadow-teal-950/30',
    indigo: 'border-amber-500/30 shadow-amber-950/30',
    amber: 'border-amber-500/30 shadow-amber-950/30',
    rose: 'border-rose-500/30 shadow-rose-950/30',
  }[colour];
  const val = {
    teal: 'text-teal-300',
    indigo: 'text-amber-300',
    amber: 'text-amber-300',
    rose: 'text-rose-300',
  }[colour];

  return (
    <div className={`rounded-2xl border bg-[#131C2E]/90 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${ring}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight font-heading ${val}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-5">
      <Skeleton variant="text" width={100} className="mb-3" />
      <Skeleton variant="text" height={36} width={80} className="mb-2" />
      <Skeleton variant="text" width={120} />
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-white">{label}</p>
      <p className="text-teal-400">{payload[0]?.value} {payload[0]?.name}</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, total_pages: 1,
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  }), [session?.access_token]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.access_token) return;

    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: authHeaders() });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to load stats');
        setStats(await res.json());
      } catch (err: any) {
        addToast('error', 'Stats Error', err.message);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [session?.access_token]);

  // ── Fetch users (paginated) ──────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page: number) => {
    if (!session?.access_token) return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/users?page=${page}&limit=${pagination.limit}`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load users');
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      addToast('error', 'Users Error', err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [session?.access_token, pagination.limit]);

  useEffect(() => { fetchUsers(1); }, [session?.access_token]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-900/40 border border-teal-700/50 text-xs font-semibold text-teal-400 uppercase tracking-widest">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Admin Only
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Platform Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Live aggregate metrics, city and activity popularity, and user management.
        </p>
      </div>

      {/* ── 1. Summary Stat Cards ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Platform Overview
        </h2>
        {isLoadingStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Users" value={stats.total_users.toLocaleString()} colour="teal" />
            <StatCard label="Total Trips" value={stats.total_trips.toLocaleString()} colour="indigo" />
            <StatCard
              label="Trips This Week"
              value={stats.trips_last_7_days}
              sub="Last 7 days"
              colour="amber"
            />
            <StatCard
              label="Trips This Month"
              value={stats.trips_last_30_days}
              sub="Last 30 days"
              colour="rose"
            />
            <StatCard
              label="Avg Trip Duration"
              value={stats.avg_trip_duration_days != null ? `${stats.avg_trip_duration_days}d` : '—'}
              sub="Across all trips"
              colour="teal"
            />
          </div>
        ) : null}
      </section>

      {/* ── 2. Top Cities Bar Chart ───────────────────────────────────────── */}
      <section>
        <Card>
          <Card.Header>
            <Card.Title>Top 10 Cities by Trip Stops</Card.Title>
            <Card.Description>How often each city has been added as a stop across all user trips.</Card.Description>
          </Card.Header>

          {isLoadingStats ? (
            <Skeleton variant="rectangular" height={280} className="rounded-lg mt-2" />
          ) : stats && stats.top_cities.length > 0 ? (
            <div className="w-full h-72 mt-4 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.top_cities}
                  margin={{ top: 4, right: 16, left: 0, bottom: 60 }}
                  barSize={28}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={64}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    allowDecimals={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(30,41,59,0.6)' }} />
                  <Bar dataKey="stop_count" name="stops" radius={[4, 4, 0, 0]}>
                    {stats.top_cities.map((_, i) => (
                      <Cell key={i} fill={CITY_COLOURS[i % CITY_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-4">No city data available yet.</p>
          )}
        </Card>
      </section>

      {/* ── 3. Top Activities Bar Chart ──────────────────────────────────── */}
      <section>
        <Card>
          <Card.Header>
            <Card.Title>Top 10 Most-Booked Activities</Card.Title>
            <Card.Description>Activities most frequently added to trip itineraries across all users.</Card.Description>
          </Card.Header>

          {isLoadingStats ? (
            <Skeleton variant="rectangular" height={280} className="rounded-lg mt-2" />
          ) : stats && stats.top_activities.length > 0 ? (
            <div className="w-full h-72 mt-4 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.top_activities}
                  margin={{ top: 4, right: 16, left: 0, bottom: 72 }}
                  barSize={28}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                    height={72}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    allowDecimals={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(30,41,59,0.6)' }} />
                  <Bar dataKey="booking_count" name="bookings" radius={[4, 4, 0, 0]}>
                    {stats.top_activities.map((_, i) => (
                      <Cell key={i} fill={ACTIVITY_COLOURS[i % ACTIVITY_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-4">No activity data available yet.</p>
          )}
        </Card>
      </section>

      {/* ── 4. Users Table ───────────────────────────────────────────────── */}
      <section>
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <Card.Title>User Management</Card.Title>
                <Card.Description>
                  {isLoadingUsers
                    ? 'Loading users…'
                    : `${pagination.total.toLocaleString()} registered users · Page ${pagination.page} of ${pagination.total_pages}`}
                </Card.Description>
              </div>
            </div>
          </Card.Header>

          {/* Horizontal-scroll wrapper for mobile */}
          {!isLoadingUsers && users.length === 0 ? (
            <div className="py-6">
              <EmptyState
                title="No Users Registered"
                description="User account profiles will appear here as users sign up for GlobeTrotter."
                action={
                  <Button variant="outline" size="sm" onClick={() => fetchUsers(1)}>
                    Refresh Users List
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-2 overflow-x-auto rounded-lg">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60">
                    {['Name', 'Email', 'Joined', 'Trips', 'Role'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoadingUsers
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <td key={j} className="px-4 py-3">
                              <Skeleton variant="text" width={j === 1 ? 180 : j === 0 ? 130 : 70} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : users.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-teal-900/50 border border-teal-700/50 flex items-center justify-center text-xs font-bold text-teal-400 flex-shrink-0">
                                {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-200 truncate max-w-[140px]">
                                {u.full_name || <span className="text-slate-500 italic">No name</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap truncate max-w-[200px]">
                            {u.email || <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(u.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-slate-700/60 text-xs font-bold text-slate-300">
                              {u.trip_count}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {u.is_admin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-900/40 border border-teal-700/50 text-xs font-semibold text-teal-400">
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-500">
                                User
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination controls */}
          {!isLoadingUsers && pagination.total_pages > 1 && (
            <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-slate-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total.toLocaleString()} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  ← Prev
                </Button>
                <span className="text-xs text-slate-400 px-1">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
};

export default AdminPage;
