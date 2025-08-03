import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, FileText, Activity, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';
import { useQuery } from '../Context/QueryContext';

const StudentDashboard = () => {
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const { state: { queries, notifications: contextNotifications }, dispatch } = useQuery() || { state: { queries: [], notifications: [] } };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) {
      navigate('/student-login');
    } else if (userRole !== 'student') {
      navigate('/dashboard');
    }

    const savedQueries = JSON.parse(localStorage.getItem('queries') || '[]');
    if (savedQueries.length > 0 && queries.length === 0) {
      savedQueries.forEach(query => {
        dispatch({ type: 'ADD_QUERY', payload: query });
      });
    }

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
  }, [navigate, dispatch, queries.length]);

  return (
    <div ref={contentRef}>
      <h2 className="text-4xl font-bold mb-6 pt-6 -mt-7 text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent overflow-hidden">Welcome, Student!</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-2xl hover:shadow-indigo-300/50 transition-shadow border border-indigo-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><Activity className="w-5 h-5 mr-2" /> Quick Stats</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Pending Queries: {queries.filter(q => q.status === 'Pending').length}</p>
            <p className="text-gray-600">Resolved Queries: {queries.filter(q => q.status === 'Resolved').length}</p>
          </div>
        </div>

        {/* Submit Query Card */}
        <div className="bg-white p-6 rounded-xl shadow-2xl hover:shadow-pink-300/50 transition-shadow border border-pink-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><FileText className="w-5 h-5 mr-2" /> Submit New Query</h3>
          <Link to="/submit-query">
            <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-300">
              Create Query
            </button>
          </Link>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white p-6 rounded-xl shadow-2xl hover:shadow-green-300/50 transition-shadow border border-green-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><Activity className="w-5 h-5 mr-2" /> Recent Activity</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Query Submitted: {queries[0]?.date || 'N/A'}</p>
            <p className="text-gray-600">Query Resolved: {queries.find(q => q.status === 'Resolved')?.date || 'N/A'}</p>
          </div>
        </div>

        {/* My Queries Section */}
        <div className="bg-white p-6 rounded-xl shadow-2xl hover:shadow-purple-300/50 transition-shadow lg:col-span-3 border border-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> My Queries</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {queries.map((query) => (
              <div
                key={query.id}
                className="p-4 bg-gray-100 rounded-lg flex flex-col items-center text-center hover:bg-gray-200 transition-colors cursor-pointer"
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
        </div>

        {/* Notifications Card */}
        <div className="bg-white p-6 rounded-xl shadow-2xl hover:shadow-blue-300/50 transition-shadow lg:col-span-3 border border-blue-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><Bell className="w-5 h-5 mr-2" /> Notifications</h3>
          <div className="space-y-3">
            {contextNotifications.map((n, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="text-indigo-500 w-5 h-5" />
                <p className="text-gray-700">{n}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;