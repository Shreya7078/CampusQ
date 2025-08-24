import { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, RefreshCw, Calendar, ListFilter, BarChart2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import Chart from 'chart.js/auto';
import { gsap } from 'gsap';
import Footer from '../Components/Footer';

const Reports = () => {
  const [allQueries, setAllQueries] = useState(() => JSON.parse(localStorage.getItem('queries') || '[]'));
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All'); // All | Pending | In Progress | Resolved
  const [categoryFilter, setCategoryFilter] = useState('All Categories'); // IMPORTANT
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const pageRef = useRef(null);

  // Sync with localStorage
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'queries') setAllQueries(JSON.parse(e.newValue || '[]'));
    };
    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => {
      const fresh = JSON.parse(localStorage.getItem('queries') || '[]');
      setAllQueries(fresh);
    }, 3000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  // Entry animation
  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-fade-in]'),
      { y: 16, opacity: 0.001 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'power2.out' }
    );
  }, []);

  // Helpers
  const parseDate = (d) => {
    if (!d) return null;
    const t = new Date(d);
    return isNaN(t.getTime()) ? null : t;
  };
  const dayDiff = (a, b) => (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);

  // Normalize base dates
  const normalized = useMemo(() => {
    const arr = Array.isArray(allQueries) ? allQueries : [];
    return arr.map((q) => {
      const created = parseDate(q.date) || new Date();
      const resolved =
        q.resolvedDate ? parseDate(q.resolvedDate)
        : (q.status === 'Resolved' && q.updatedAt ? parseDate(q.updatedAt) : (q.status === 'Resolved' ? new Date() : null));
      return { ...q, _created: created, _resolved: resolved };
    });
  }, [allQueries]);

  // Normalize category once: blank -> 'Others'
  const normalizedWithCat = useMemo(() => {
    return normalized.map(q => ({
      ...q,
      _cat: (q.category && q.category.trim()) ? q.category : 'Others'
    }));
  }, [normalized]);

  // Category options: predefined + extras from data
  const categories = useMemo(() => {
    const base = ['All Categories', 'Hostel', 'Mess', 'Transport', 'Library', 'Network', 'Others'];
    const dyn = new Set();
    normalizedWithCat.forEach(q => q._cat && dyn.add(q._cat));
    const extra = [...dyn].filter(c => !base.includes(c)).sort();
    return [...base, ...extra];
  }, [normalizedWithCat]);

  // Apply filters (use _cat consistently with proper date range inclusion)
  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    console.log('Applying filters - Status:', statusFilter, 'Category:', categoryFilter, 'From:', from, 'To:', to); // Debug log

    // Check for invalid date range
    if (from && to && from > to) {
      console.log('Invalid date range: From date is after To date, returning empty array');
      return [];
    }

    return normalizedWithCat.filter((q) => {
      // Status filter
      if (statusFilter !== 'All' && q.status !== statusFilter) {
        console.log(`Excluded by status: ${q.title}, Status: ${q.status}`);
        return false;
      }

      // Category filter
      if (categoryFilter !== 'All Categories' && q._cat !== categoryFilter) {
        console.log(`Excluded by category: ${q.title}, Category: ${q._cat}`);
        return false;
      }

      // Date range filter (exclusive of to date)
      if (from && q._created) {
        if (q._created < from || (to && q._created > to)) {
          console.log(`Excluded by date: ${q.title}, Created: ${q._created}, From: ${from}, To: ${to}`);
          return false;
        }
      }

      console.log(`Included: ${q.title}, Status: ${q.status}, Category: ${q._cat}, Created: ${q._created}`);
      return true;
    });
  }, [normalizedWithCat, statusFilter, categoryFilter, fromDate, toDate]);

  // KPIs based on filtered set (intentional)
  const pendingCount = filtered.filter((q) => q.status === 'Pending').length;
  const inProgressCount = filtered.filter((q) => q.status === 'In Progress').length;
  const resolvedCount = filtered.filter((q) => q.status === 'Resolved').length;
  const totalCount = filtered.length;

  // SLA
  const now = new Date();
  const overduePending = filtered.filter(
    (q) => q.status === 'Pending' && q._created && Math.floor(dayDiff(q._created, now)) > 3
  ).length;

  const resolvedDurations = filtered
    .filter((q) => q.status === 'Resolved' && q._created && q._resolved)
    .map((q) => Math.max(0, dayDiff(q._created, q._resolved)));

  const avgResolution = resolvedDurations.length
    ? resolvedDurations.reduce((a, b) => a + b, 0) / resolvedDurations.length
    : 0;

  // Category breakdown (use _cat)
  const categoryBreakdown = useMemo(() => {
    const map = new Map();
    filtered.forEach((q) => {
      const key = q._cat;
      if (!map.has(key)) map.set(key, { Pending: 0, 'In Progress': 0, Resolved: 0 });
      const row = map.get(key);
      if (q.status === 'Pending') row.Pending += 1;
      else if (q.status === 'In Progress') row['In Progress'] += 1;
      else if (q.status === 'Resolved') row.Resolved += 1;
    });
    const rows = Array.from(map.entries()).map(([category, v]) => ({ category, ...v }));
    rows.sort((a, b) => (b.Pending + b['In Progress'] + b.Resolved) - (a.Pending + a['In Progress'] + a.Resolved));
    return rows;
  }, [filtered]);

  // Chart: rebuild safely after layout
  useEffect(() => {
    const ctx = chartRef.current ? chartRef.current.getContext('2d') : null;
    if (!ctx) return;

    if (chartInstance.current) chartInstance.current.destroy();

    const raf = requestAnimationFrame(() => {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pending', 'In Progress', 'Resolved'],
          datasets: [{
            label: 'Count',
            data: [pendingCount, inProgressCount, resolvedCount],
            backgroundColor: ['#4B5EAA', '#A3BFFA', '#81C784'],
            borderColor: ['#2A4066', '#6B91D7', '#4CAF50'],
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Query Status Distribution' }
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [pendingCount, inProgressCount, resolvedCount]);

  // Refresh (now includes reset logic)
  const handleRefresh = () => {
    setLoading(true);
    const fresh = JSON.parse(localStorage.getItem('queries') || '[]');
    setAllQueries(fresh);
    setStatusFilter('All');
    setCategoryFilter('All Categories');
    setFromDate('');
    setToDate('');
    setTimeout(() => setLoading(false), 250);
  };

  const statusChip = (s) => {
    if (s === 'Resolved') return 'bg-green-100 text-green-800';
    if (s === 'In Progress') return 'bg-indigo-100 text-indigo-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Centered heading bar */}
      <div className="top-[4rem] bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-2">
          <h1 className="text-6xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 py-1">
            Reports & Analytics
          </h1>
        </div>
        <div className=" border-indigo-100" />
      </div>

      {/* Main content */}
      <div ref={pageRef} className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-6">
        {/* Filters */}
        <div data-fade-in className="bg-white p-4 rounded-2xl shadow-lg border border-indigo-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <ListFilter className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-800">Filters</span>
            </div>

            <div className="flex gap-3 w-full flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-green-800 to-emerald-500 text-white shadow-md hover:from-green-700 hover:to-emerald-400 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </button>
            </div>
          </div>
          {fromDate && toDate && parseDate(fromDate) > parseDate(toDate) && (
            <p className="text-red-500 text-sm mt-2">Invalid date range: No results will be shown.</p>
          )}
        </div>

        {/* KPIs */}
        <div data-fade-in className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-yellow-700">Pending</span>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold mt-2 text-yellow-700">{pendingCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-700">In Progress</span>
              <BarChart2 className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold mt-2 text-indigo-700">{inProgressCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-green-700">Resolved</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold mt-2 text-green-700">{resolvedCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-700">Total</span>
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold mt-2 text-purple-700">{totalCount}</p>
          </div>
        </div>

        {/* Chart + SLA */}
        <div data-fade-in className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2" /> Status Distribution
            </h3>
            <div className="relative h-64">
              <canvas ref={chartRef} className="absolute inset-0" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-100">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">SLA Insights</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                <p className="text-sm text-yellow-800">Overdue Pending (&gt; 3 days)</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{overduePending}</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-sm text-green-800">Average Resolution Time</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {avgResolution ? `${avgResolution.toFixed(1)} days` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div data-fade-in className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700">Category Breakdown</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-gray-500">No data for selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full rounded-xl">
                <thead>
                  <tr className="bg-indigo-100 text-indigo-800">
                    <th className="p-3 text-center">Category</th>
                    <th className="p-3 text-center">Pending</th>
                    <th className="p-3 text-center">In Progress</th>
                    <th className="p-3 text-center">Resolved</th>
                    <th className="p-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((r) => {
                    const total = r.Pending + r['In Progress'] + r.Resolved;
                    return (
                      <tr key={r.category} className="border-t">
                        <td className="p-3 text-center">{r.category}</td>
                        <td className="p-3 text-center">{r.Pending}</td>
                        <td className="p-3 text-center">{r['In Progress']}</td>
                        <td className="p-3 text-center">{r.Resolved}</td>
                        <td className="p-3 text-center font-semibold">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Query list */}
        <div data-fade-in className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700">Queries (Filtered)</h3>
          {filtered.length === 0 ? (
            <p className="text-gray-500">No queries match the selected filters or date range is invalid.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full">
                <thead>
                  <tr className="bg-indigo-100 text-indigo-800">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Created</th>
                    <th className="p-3 text-center">Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice()
                    .sort((a, b) => (b._created?.getTime?.() || 0) - (a._created?.getTime?.() || 0))
                    .map((q) => (
                      <tr key={q.id} className="border-t">
                        <td className="p-3 text-center">{q.id}</td>
                        <td className="p-3">{q.title}</td>
                        <td className="p-3">{q._cat}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusChip(q.status)}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {q._created ? q._created.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}
                        </td>
                        <td className="p-3 text-center">
                          {q._resolved
                            ? q._resolved.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
                            : q.status === 'Resolved'
                            ? 'Today'
                            : '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reports;