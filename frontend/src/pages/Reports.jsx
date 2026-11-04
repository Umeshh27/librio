import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  BookOpen,
  Users,
  Repeat,
  CheckCircle2,
  Clock,
  Coins,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard';
import { ChartSkeleton, StatCardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const CATEGORY_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function Reports() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [timeRange, setTimeRange] = useState('6M');

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      setLoading(true);
      try {
        const [sumRes, monthRes, catRes, popRes] = await Promise.all([
          api.getReportsSummary(),
          api.getMonthlyBorrowing(),
          api.getCategoryDistribution(),
          api.getPopularBooks(),
        ]);

        if (isMounted) {
          if (sumRes?.data) setSummary(sumRes.data);
          if (monthRes?.data) setMonthlyData(monthRes.data);
          if (catRes?.data) setCategories(catRes.data);
          if (popRes?.data) setPopularBooks(popRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReports();
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Books,${summary?.totalBooks || 0}\n` +
      `Available Books,${summary?.availableBooks || 0}\n` +
      `Issued Books,${summary?.issuedBooks || 0}\n` +
      `Returned Books,${summary?.returnedBooks || 0}\n` +
      `Overdue Books,${summary?.overdueBooks || 0}\n` +
      `Total Members,${summary?.totalMembers || 0}\n` +
      `Total Fines Collected,${summary?.totalFinesCollected || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `librio_executive_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Report exported as CSV successfully', 'success');
  };

  if (loading || !summary) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height="h-64" />
          <ChartSkeleton height="h-64" />
        </div>
      </div>
    );
  }

  const maxPopularBorrows = Math.max(
    1,
    ...popularBooks.map((b) => b.borrows || 1)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            Executive Analytics & Reports
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Circulation trajectory, stock health by discipline, and patron demand.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-0.5 bg-gray-100 rounded-lg border border-border text-xs">
            {['30D', '6M', '1Y', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all text-xs ${
                  timeRange === r
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-secondary hover:text-foreground'
                }`}
              >
                {r === '30D' ? '30 Days' : r === '6M' ? '6 Months' : r === '1Y' ? '1 Year' : 'All'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border text-foreground hover:bg-gray-50 rounded-lg text-xs font-semibold transition-all shadow-subtle whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <span className="text-[10px] font-semibold uppercase text-secondary tracking-wider">Titles</span>
          <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
            {summary.totalBooks}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <span className="text-[10px] font-semibold uppercase text-secondary tracking-wider">Available</span>
          <p className="text-xl font-bold text-success tabular-nums mt-0.5">
            {summary.availableBooks}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <span className="text-[10px] font-semibold uppercase text-secondary tracking-wider">Active Loans</span>
          <p className="text-xl font-bold text-primary tabular-nums mt-0.5">
            {summary.issuedBooks}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <span className="text-[10px] font-semibold uppercase text-secondary tracking-wider">Returned</span>
          <p className="text-xl font-bold text-emerald-600 tabular-nums mt-0.5">
            {summary.returnedBooks}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <span className="text-[10px] font-semibold uppercase text-secondary tracking-wider">Overdue</span>
          <p className="text-xl font-bold text-danger tabular-nums mt-0.5">
            {summary.overdueBooks}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <span className="text-[10px] font-semibold uppercase text-secondary tracking-wider">Fines Collected</span>
          <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
            ₹{(summary.totalFinesCollected || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Row 1: Charts (Circulation Activity & Demand Ranking) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Activity Area Chart */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-1">
            Circulation Activity Trend
          </h3>
          <p className="text-[11px] text-secondary mb-3">
            Number of issues processed over time
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F2" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E5E5E5',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Loans"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReports)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Catalog Demand Ranking (Clean Leaderboard List — Fully Contained Bounded Bars) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-subtle flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-tight flex items-center gap-1.5 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Catalog Demand Ranking</span>
            </h3>
            <p className="text-[11px] text-secondary mb-3">
              Top titles ranked by total checkout volume
            </p>

            <div className="space-y-2">
              {popularBooks.slice(0, 5).map((book, idx) => {
                const pct = Math.round(((book.borrows || 0) / maxPopularBorrows) * 100);
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-colors flex items-center justify-between gap-3 overflow-hidden"
                  >
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
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="w-20 sm:w-28 md:w-36 h-2 bg-gray-200/80 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(12, pct))}%` }}
                        />
                      </div>
                      <span className="font-semibold text-foreground text-[11px] tabular-nums whitespace-nowrap bg-white px-2 py-0.5 rounded border border-border">
                        {book.borrows} loans
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown Donut & Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Donut */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-subtle flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-1">
              Category Distribution
            </h3>
            <p className="text-[11px] text-secondary mb-3">
              Holding percentages by genre
            </p>

            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
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

          <div className="space-y-1 pt-2 border-t border-gray-100">
            {categories.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-secondary truncate">{c.name}</span>
                </div>
                <span className="font-semibold text-foreground tabular-nums">{c.count} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Inventory Health Table */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-xl border border-border shadow-subtle overflow-hidden">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight mb-1">
            Discipline Holdings Summary
          </h3>
          <p className="text-[11px] text-secondary mb-3">
            Physical catalog allocation and share by genre
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-gray-50/80 font-semibold text-secondary text-[11px]">
                  <th className="py-2.5 px-3 whitespace-nowrap">Discipline</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Titles</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Share</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat, idx) => {
                  const total = categories.reduce((s, c) => s + c.count, 0) || 1;
                  const pct = Math.round((cat.count / total) * 100);
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                        {cat.name}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-secondary">
                        {cat.count}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-secondary font-mono text-[10px] tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Optimal
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
