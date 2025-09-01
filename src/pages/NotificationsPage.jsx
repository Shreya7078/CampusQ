
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Filter, CheckCircle2 } from 'lucide-react';
import { gsap } from 'gsap';
import Footer from '../Components/Footer';

const LAST_SEEN_ADMIN_TS_KEY = 'lastSeenAdminNotifTs';
const PAGE_SIZE_DEFAULT = 10; 

const NotificationsPage = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);

 
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || 'student');
  const [studentId, setStudentId] = useState(() => {
    const sd = JSON.parse(localStorage.getItem('studentDetails') || '{}');
    return sd?.studentId || 'S001';
  });

 
  const [allNotifs, setAllNotifs] = useState([]);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('all'); // all | today | 7d | 30d
  const [loading, setLoading] = useState(true);

 
  const [page, setPage] = useState(1);


  const loadFromStorage = () => {
    const storedRole = localStorage.getItem('userRole');
    if (!storedRole) return [];
    if (storedRole === 'admin') {
      const a = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      return Array.isArray(a) ? a : [];
    } else {
      const sd = JSON.parse(localStorage.getItem('studentDetails') || '{}');
      const sid = sd?.studentId || 'S001';
      const s = JSON.parse(localStorage.getItem(`notifications_${sid}`) || '[]');
      return Array.isArray(s) ? s : [];
    }
  };

  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedRole = localStorage.getItem('userRole');
    if (!isAuthenticated || !storedRole) {
      navigate('/', { replace: true });
      return;
    }
    setRole(storedRole);

    try {
      setAllNotifs(loadFromStorage());
    } catch {
      setAllNotifs([]);
    }

   
    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        duration: 0.6,
        y: 24,
        opacity: 0,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
    setLoading(false);
  }, [navigate]);

  
  useEffect(() => {
    const refresh = () => {
      try {
        setAllNotifs(loadFromStorage());
      } catch {
        setAllNotifs([]);
      }
    };

    const onStorage = (e) => {
      if (role === 'admin' && e.key === 'adminNotifications') refresh();
      if (role !== 'admin') {
        const sd = JSON.parse(localStorage.getItem('studentDetails') || '{}');
        const sid = sd?.studentId || 'S001';
        if (e.key === `notifications_${sid}`) refresh();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    const interval = setInterval(refresh, 3000);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
      clearInterval(interval);
    };
  }, [role]);

 
  const filteredNotifs = useMemo(() => {
    const list = Array.isArray(allNotifs) ? allNotifs : [];
    const now = new Date();
    const start = (() => {
      if (range === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      }
      if (range === '7d') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d;
      }
      if (range === '30d') {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return d;
      }
      return null;
    })();

    return [...list]
      .filter(n => {
        const text = String(n?.message || '').toLowerCase();
        if (search && !text.includes(search.toLowerCase())) return false;
        if (!start) return true;
        const ts = new Date(n?.timestamp || 0);
        return ts >= start;
      })
      .sort((a, b) => new Date(b?.timestamp || 0) - new Date(a?.timestamp || 0));
  }, [allNotifs, search, range]);


  const total = filteredNotifs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_DEFAULT));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE_DEFAULT;
  const endIdx = startIdx + PAGE_SIZE_DEFAULT;
  const pageItems = filteredNotifs.slice(startIdx, endIdx);

 
  useEffect(() => {
    setPage(1);
  }, [search, range, allNotifs.length]);

  
  const markAllAsRead = () => {
    if (role === 'admin') {
      const latestTs =
        filteredNotifs.length > 0
          ? filteredNotifs?.timestamp || new Date().toISOString()
          : new Date().toISOString();
      localStorage.setItem(LAST_SEEN_ADMIN_TS_KEY, latestTs);
      localStorage.setItem('lastSeenAdminNotifCount', String(allNotifs.length || 0));
    } else {
      localStorage.setItem(`lastSeenStudentNotifCount_${studentId}`, String(allNotifs.length || 0));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-blue-100">
        <div className="text-2xl text-indigo-600">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-purple-50 to-blue-100">
      <main ref={contentRef} className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-bold text-transparent py-2 bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500">
              {role === 'admin' ? 'Admin Notifications' : 'My Notifications'}
            </h1>
            {/* <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md text-indigo-700 font-medium transition-all"
              title="Mark all as read"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark all as read
            </button> */}
          </div>

     
          <div className="mt-6 mb-6 bg-white p-4 rounded-2xl shadow-lg border border-indigo-100">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
           
              <label className="relative w-full md:max-w-md">
                <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                  aria-label="Search notifications"
                />
              </label>

             
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" aria-hidden />
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                  aria-label="Filter by time range"
                >
                  <option value="all">All</option>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </div>
          </div>

         
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-indigo-100">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <Bell className="w-8 h-8 mb-2 text-indigo-500" />
                <p>No notifications found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pageItems.map((n, i) => {
                  
                  // const when = n?.timestamp
                  //   ? new Date(n.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                  //   : '—';
                  return (
                    <li key={`${n?.id ?? 'notif'}-${(currentPage - 1) * PAGE_SIZE_DEFAULT + i}`} className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Bell className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 text-md">{n?.message || '—'}</p>
                          <p className="text-xs text-gray-500 mt-1">{when}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            
            <div className="mt-4 flex items-center justify-end gap-1">
              <button
                className="px-3 py-1.5 rounded border text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      key={p}
                      className={`px-3 py-1.5 rounded border text-sm ${
                        p === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 7 && (
                  <>
                    <span className="px-2 text-gray-500">…</span>
                    <button
                      className={`px-3 py-1.5 rounded border text-sm ${
                        totalPages === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                className="px-3 py-1.5 rounded border text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

    
      <Footer />
    </div>
  );
};

export default NotificationsPage;

