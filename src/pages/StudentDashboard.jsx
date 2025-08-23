import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, FileText, Activity, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';
import { useQuery } from '../context/QueryContext';

const StudentDashboard = () => {
  const contentRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const { state: { queries, notifications: contextNotifications }, dispatch } = useQuery() || { state: { queries: [], notifications: [] } };
  const [studentId] = useState(() => {
    const userDetails = JSON.parse(localStorage.getItem('studentDetails') || '{}');
    return userDetails.studentId || 'S001';
  });
  const [localNotifications, setLocalNotifications] = useState([]);
  const [lastNotifCount, setLastNotifCount] = useState(() => {
    return Number(localStorage.getItem(`lastSeenStudentNotifCount_${studentId}`)) || 0;
  });

  // Show dot only if there are new notifications
  const hasNew = localNotifications.length > lastNotifCount;

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) {
      navigate('/student-login');
    } else if (userRole !== 'student') {
      navigate('/dashboard');
    }

    // Force reload and sync queries from localStorage with debugging
    const savedQueries = JSON.parse(localStorage.getItem('queries') || '[]');
    if (savedQueries.length > 0) {
      const currentQueryIds = new Set(queries.map(q => q.id));
      const newQueries = savedQueries.filter(q => !currentQueryIds.has(q.id));
      if (newQueries.length > 0) {
        newQueries.forEach(query => {
          dispatch({ type: 'ADD_QUERY', payload: query });
        });
      }
    }

    // Load student-specific notifications
    const savedStudentNotifications = JSON.parse(localStorage.getItem(`notifications_${studentId}`) || '[]');
    setLocalNotifications(savedStudentNotifications);

    // Check for new resolved queries and generate notifications
    savedQueries.forEach(query => {
      if (query.studentId === studentId && query.status === 'Resolved' && !savedStudentNotifications.some(n => n.id === query.id)) {
        const newNotification = {
          id: query.id,
          message: `Your query "${query.title}" (ID: ${query.id}) has been resolved on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
          studentId: studentId,
          timestamp: new Date().toISOString()
        };
        const updatedNotifications = [...savedStudentNotifications, newNotification];
        setLocalNotifications(updatedNotifications);
        localStorage.setItem(`notifications_${studentId}`, JSON.stringify(updatedNotifications));
      }
    });

    const ctx = gsap.context(() => {
      gsap.from(contentRef.current.children, {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out',
      });
    });
    return () => ctx.revert();
  }, [navigate, dispatch, queries.length, studentId]);

  // Scroll to notifications and mark as seen
  const scrollToNotifications = () => {
    localStorage.setItem(`lastSeenStudentNotifCount_${studentId}`, localNotifications.length);
    setLastNotifCount(localNotifications.length);
    setTimeout(() => {
      if (notificationsRef.current) {
        notificationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div ref={contentRef} className="p-4">
      {/* Heading and Notification Bell */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-4xl font-bold pt-0 mt-0 text-gray-900 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500 bg-clip-text text-transparent overflow-hidden ">
          Welcome, Student!
        </h2>
        <button
          onClick={scrollToNotifications}
          className="flex items-center px-4 py-2 mt-1 rounded-full bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          title="Go to Notifications"
        >
          <Bell className="w-5 h-5 text-indigo-600 mr-2" />
          <span className="font-semibold text-indigo-700 hidden sm:inline">Notifications</span>
          {hasNew && (
            <span className="ml-2 inline-block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-indigo-300/50 transition-shadow border border-indigo-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><Activity className="w-5 h-5 mr-2" /> Quick Stats</h3>
          <div className="space-y-3">
            <p className="text-gray-600">Pending Queries: {queries.filter(q => q.status === 'Pending' && q.studentId === studentId).length}</p>
            <p className="text-gray-600">Resolved Queries: {queries.filter(q => q.status === 'Resolved' && q.studentId === studentId).length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-pink-300/50 transition-shadow border border-pink-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><FileText className="w-5 h-5 mr-2" /> Submit New Query</h3>
          <Link to="/submit-query">
            <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-300">
              Create Query
            </button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-green-300/50 transition-shadow border border-green-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><Activity className="w-5 h-5 mr-2" /> Recent Activity</h3>
          <div className="space-y-3">
            <p className="text-gray-600">
              Query Submitted: {queries.filter(q => q.studentId === studentId).length > 0 ? [...queries].filter(q => q.studentId === studentId).sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : new Date().toISOString().split('T')[0]}
            </p>
            <p className="text-gray-600">
              Query Resolved: {queries.filter(q => q.status === 'Resolved' && q.studentId === studentId).length > 0 ? [...queries].filter(q => q.status === 'Resolved' && q.studentId === studentId).sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-purple-300/50 transition-shadow lg:col-span-3 border border-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> My Queries</h3>
          {queries.length === 0 ? (
            <p className="text-gray-600 text-center">No queries available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {queries.filter(q => q.studentId === studentId).map((query) => (
                <div
                  key={query.id}
                  className="p-4 bg-gray-100 rounded-xl flex flex-col items-center text-center hover:bg-gray-200 transition-colors cursor-pointer"
                  onClick={() => navigate(`/query/${query.id}`)}
                >
                  <h4 className="text-lg font-medium text-indigo-700">{query.category} Queries</h4>
                  <p className="mt-2 text-gray-600">{query.title}</p>
                  <p className="text-sm text-gray-500">{query.date}</p>
                  <span className={`mt-2 px-2 py-1 rounded-full text-sm ${query.status === 'Resolved' ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {query.status}
                  </span>
                  {query.attachment && (
                    <a href={query.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm mt-1">View Attachment</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          ref={notificationsRef}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-blue-300/50 transition-shadow lg:col-span-3 border border-blue-100"
        >
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><Bell className="w-5 h-5 mr-2" /> Notifications</h3>
          <div className="space-y-3">
            {localNotifications.length === 0 ? (
              <p className="text-gray-600 text-center">No notifications yet.</p>
            ) : (
              localNotifications.map((n, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="text-indigo-500 w-5 h-5" />
                  <p className="text-gray-700">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;