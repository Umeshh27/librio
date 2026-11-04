import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Repeat,
  Trophy,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import api from '../services/api';

const CATEGORY_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await api.getDashboard();
        if (isMounted && res && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartSkeleton height="h-64" />
          </div>
          <div>
            <ChartSkeleton height="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const maxBorrows = Math.max(
    1,
    ...((data.popularBooks || []).map((b) => b.borrows || 1))
  );

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
              Operations Hub
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-secondary mt-0.5 truncate">
            Real-time catalog availability, circulation telemetry, and patron tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/issue-return')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-white hover:bg-gray-800 transition-all shadow-sm whitespace-nowrap"
          >
            <Repeat className="w-3.5 h-3.5 text-indigo-400" />
            <span>Circulation Desk</span>
          </button>
          <button
            onClick={() => navigate('/books')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 border border-border text-foreground hover:bg-gray-100 transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>Manage Catalog</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Books"
          value={data.totalBooks || 0}
          icon={BookOpen}
          description="Titles in collection"
          trend="+12%"
          trendType="positive"
        />
        <StatCard
          title="Available Books"
          value={data.availableBooks || 0}
          icon={CheckCircle2}
          description="Ready on shelves"
          trend="In-shelf"
          trendType="neutral"
        />
        <StatCard
          title="Issued Books"
          value={data.issuedBooks || 0}
          icon={Clock}
          description="Active loans"
          trend="Borrowed"
          trendType="neutral"
        />
        <StatCard
          title="Total Members"
          value={data.totalMembers || 0}
          icon={Users}
          description="Registered patrons"
          trend="+6 active"
          trendType="positive"
        />
      </div>

      {/* Row 1: Charts (Monthly Volume & Category Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Activity Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-5 border border-border shadow-subtle flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                Monthly Borrowing Volume
              </h3>
              <p className="text-[11px] text-secondary mt-0.5">
                Trajectory of book issues processed over recent months
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4%</span>
            </div>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.monthlyBorrowing || []}
                margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="borrowColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F2" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#737373' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#737373' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E5E5E5',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Loans"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#borrowColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-border shadow-subtle flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
              Category Distribution
            </h3>
            <p className="text-[11px] text-secondary mt-0.5 mb-2">
              Catalog holdings categorized by discipline
            </p>

            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categories || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                  >
                    {(data.categories || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E5E5E5',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clean Legend list */}
          <div className="space-y-1 pt-2 border-t border-gray-100">
            {(data.categories || []).slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                    }}
                  />
                  <span className="text-secondary truncate">{cat.name}</span>
                </div>
                <span className="font-semibold text-foreground tabular-nums ml-2">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Most Borrowed Books (Leaderboard) & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Most Borrowed Books — Fully Contained Bounded Bars (Zero Overflows!) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-5 border border-border shadow-subtle overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-xs font-bold text-foreground tracking-tight uppercase flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Most Borrowed Books</span>
              </h3>
              <p className="text-[11px] text-secondary mt-0.5">
                Highest circulation demand across all catalog titles
              </p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-[11px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1 whitespace-nowrap"
            >
              <span>Full rankings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {(data.popularBooks || []).map((book, idx) => {
              const pct = Math.round(((book.borrows || 0) / maxBorrows) * 100);
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-colors flex items-center justify-between gap-3 overflow-hidden"
                >
                  {/* Left: Rank & Title */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center font-bold text-[10px] text-secondary flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-xs truncate" title={book.title}>
                        {book.title}
                      </p>
                      {book.author && (
                        <p className="text-[10px] text-secondary truncate" title={book.author}>
                          {book.author}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Perfectly Contained Visual Bar and Badge */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-20 sm:w-28 md:w-36 h-2 bg-gray-200/80 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(12, pct))}%` }}
                      />
                    </div>
                    <span className="font-semibold text-foreground text-[11px] tabular-nums whitespace-nowrap bg-white px-2 py-0.5 rounded border border-border">
                      {book.borrows} {book.borrows === 1 ? 'loan' : 'loans'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities List */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-border shadow-subtle flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                Circulation Activity
              </h3>
              <span className="text-[9px] uppercase font-bold tracking-wider text-secondary bg-gray-50 px-1.5 py-0.5 rounded border border-border">
                Audit
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {(data.recentActivities || []).map((activity) => (
                <div key={activity.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        activity.type === 'ISSUE'
                          ? 'bg-blue-500 ring-2 ring-blue-100'
                          : activity.type === 'RETURN'
                          ? 'bg-emerald-500 ring-2 ring-emerald-100'
                          : 'bg-indigo-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                        {activity.description}
                      </p>
                      <span className="text-[10px] text-secondary mt-0.5 block font-mono">
                        {activity.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/history')}
            className="w-full mt-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-border rounded-lg text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-1"
          >
            <span>Complete History</span>
            <ArrowRight className="w-3 h-3 text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}
