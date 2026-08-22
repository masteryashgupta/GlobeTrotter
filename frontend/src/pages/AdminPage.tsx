import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';
import { Card, Skeleton, Button, EmptyState, FilterControlBar } from '../components/ui';
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
  '#7C3AED', '#C084FC', '#22C55E', '#F59E0B',
  '#EC4899', '#06B6D4', '#6B7280', '#EF4444',
  '#3b82f6', '#a78bfa',
];
const ACTIVITY_COLOURS = [
  '#F59E0B', '#22C55E', '#7C3AED', '#EC4899',
  '#C084FC', '#06B6D4', '#6B7280', '#EF4444',
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
    teal: 'border-[#7C3AED]/30 shadow-[0_4px_16px_rgba(124,58,237,0.08)]',
    indigo: 'border-[#C084FC]/30 shadow-[0_4px_16px_rgba(192,132,252,0.08)]',
    amber: 'border-[#F59E0B]/30 shadow-[0_4px_16px_rgba(245,158,11,0.08)]',
    rose: 'border-[#EF4444]/30 shadow-[0_4px_16px_rgba(239,68,68,0.08)]',
  }[colour];
  const val = {
    teal: 'text-[#7C3AED]',
    indigo: 'text-[#5B21B6]',
    amber: 'text-[#B45309]',
    rose: 'text-[#B91C1C]',
  }[colour];

  return (
    <div className={`rounded-2xl border bg-[#F7F5FC] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${ring}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight font-heading ${val}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[#6B7280]">{sub}</p>}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E9E4F5] bg-[#F7F5FC] p-5 shadow-sm">
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
    <div className="rounded-lg border border-[#E9E4F5] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-[#1A1523]">{label}</p>
      <p className="text-[#7C3AED]">{payload[0]?.value} {payload[0]?.name}</p>
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
  const [activeTab, setActiveTab] = useState<'users' | 'cities' | 'activities' | 'trends'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample trend line data for user growth
  const trendData = [
    { day: 'Mon', active_users: 120, new_trips: 45 },
    { day: 'Tue', active_users: 180, new_trips: 62 },
    { day: 'Wed', active_users: 240, new_trips: 88 },
    { day: 'Thu', active_users: 310, new_trips: 110 },
    { day: 'Fri', active_users: 420, new_trips: 155 },
    { day: 'Sat', active_users: 560, new_trips: 210 },
    { day: 'Sun', active_users: 630, new_trips: 240 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-fade-up">
      {/* ── 1. Top Search bar + Group by / Filter / Sort by controls (Screen 12 Spec) ── */}
      <FilterControlBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search admin metrics, users, cities, or activities..."
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-xs font-semibold text-[#5B21B6] uppercase tracking-widest">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Admin Only
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#1A1523] tracking-tight sm:text-3xl font-heading">
          Admin Panel &amp; Analytics
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Live aggregate metrics, city and activity popularity, user management, and platform usage trends.
        </p>
      </div>

      {/* ── 2. Tab / Button Row (Screen 12 Spec) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E9E4F5]">
        {[
          { id: 'users', label: 'Manage Users' },
          { id: 'cities', label: 'Popular Cities' },
          { id: 'activities', label: 'Popular Activities' },
          { id: 'trends', label: 'User Trends and Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[rgba(124,58,237,0.20)]'
                : 'bg-[#F7F5FC] text-[#6B7280] hover:text-[#1A1523] border border-[#E9E4F5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Analytics Dashboard Area on Left + Side Info Panel on Right (Screen 12 Spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Analytics Dashboard Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Summary Stat Cards */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-4">
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

          {/* Combined Visual Charts (Pie + Line + Bar Charts - Screen 12 Spec) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart: City Distribution */}
            <Card>
              <Card.Header>
                <Card.Title>City Distribution Pie Chart</Card.Title>
                <Card.Description>Proportion of stops across top destinations.</Card.Description>
              </Card.Header>
              <div className="h-64 mt-2 flex items-center justify-center">
                {stats && stats.top_cities.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.top_cities.slice(0, 5)}
                        dataKey="stop_count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.top_cities.slice(0, 5).map((_, i) => (
                          <Cell key={i} fill={CITY_COLOURS[i % CITY_COLOURS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-[#6B7280]">No pie data available.</p>
                )}
              </div>
            </Card>

            {/* Line Chart: User Growth Trends */}
            <Card>
              <Card.Header>
                <Card.Title>User &amp; Trip Trends Line Chart</Card.Title>
                <Card.Description>Weekly active user engagement curve.</Card.Description>
              </Card.Header>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E4F5" />
                    <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="active_users" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED' }} />
                    <Line type="monotone" dataKey="new_trips" stroke="#C084FC" strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9E4F5" vertical={false} />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9E4F5" vertical={false} />
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
                <div className="mt-2 overflow-x-auto rounded-lg border border-[#E9E4F5] bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E9E4F5] bg-[#F7F5FC]">
                        {['Name', 'Email', 'Joined', 'Trips', 'Role'].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#6B7280] whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9E4F5]">
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
                              className="hover:bg-[#F7F5FC]/60 transition-colors"
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#7C3AED]/10 border border-[#C4B5FD] flex items-center justify-center text-xs font-bold text-[#7C3AED] flex-shrink-0">
                                    {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-[#1A1523] truncate max-w-[140px]">
                                    {u.full_name || <span className="text-[#6B7280] italic">No name</span>}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap truncate max-w-[200px]">
                                {u.email || <span className="text-[#6B7280]">—</span>}
                              </td>
                              <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                                {new Date(u.created_at).toLocaleDateString('en-GB', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-[#F7F5FC] text-xs font-bold text-[#1A1523] border border-[#E9E4F5]">
                                  {u.trip_count}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {u.is_admin ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7C3AED]/15 border border-[#C4B5FD] text-xs font-semibold text-[#5B21B6]">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F7F5FC] border border-[#E9E4F5] text-xs font-medium text-[#6B7280]">
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

        {/* ── Right Column: Side Info Panel (Screen 12 Spec) ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24 border-[#7C3AED]/25 bg-gradient-to-br from-[#7C3AED]/5 via-[#F7F5FC] to-white">
            <Card.Header>
              <Card.Title className="text-[#5B21B6]">Admin Panel Guide &amp; Info</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4 text-xs text-[#6B7280] leading-relaxed">
              <div>
                <h4 className="font-bold text-[#1A1523]">1. Manage Users</h4>
                <p>View all registered travelers, check trip counts, inspect creation dates, and manage admin roles.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1523]">2. Popular Cities</h4>
                <p>Track destination trends by monitoring which cities are most frequently selected for trip stops.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1523]">3. Popular Activities</h4>
                <p>Analyze experience demand across culinary tours, outdoor activities, and cultural landmarks.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1523]">4. User Trends &amp; Analytics</h4>
                <p>Monitor weekly engagement curves, active user growth, and average trip stay durations.</p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
