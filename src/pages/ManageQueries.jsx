
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Edit, Trash2, Download } from 'lucide-react';
import { gsap } from 'gsap';
import { useQuery } from '../context/QueryContext';
import Footer from '../Components/Footer';
import { saveAs } from 'file-saver';

const ManageQueries = () => {
  const navigate = useNavigate();
  const { state: { queries }, dispatch: queryDispatch } = useQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [editQuery, setEditQuery] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const queriesPerPage = 10;
  const [adminUsers] = useState(['Admin1', 'Admin2', 'Admin3']);

  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/', { replace: true });
      return;
    }

    
    gsap.from('.query-card', {
      y: 24,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    });

    gsap.fromTo(
      '.hero-text',
      { y: 16, opacity: 0 },
      { duration: 0.6, y: 0, opacity: 1, ease: 'power2.out', stagger: 0.05 }
    );
  }, [navigate, queries]);

  
  const filteredQueries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return queries;
    return queries.filter(q => {
      const title = String(q.title || '').toLowerCase();
      const category = String(q.category || '').toLowerCase();
      const sid = String(q.studentId || '').toLowerCase();
      return title.includes(term) || category.includes(term) || sid.includes(term);
    });
  }, [queries, searchTerm]);

  
  const totalPages = Math.max(1, Math.ceil(filteredQueries.length / queriesPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const indexOfLastQuery = currentPageSafe * queriesPerPage;
  const indexOfFirstQuery = indexOfLastQuery - queriesPerPage;
  const currentQueries = filteredQueries.slice(indexOfFirstQuery, indexOfLastQuery);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  const handleDeleteQuery = (id) => {
    queryDispatch({ type: 'DELETE_QUERY', payload: { id } });
  };


  const handleEditQuery = (query) => {
   
    const normalizedHistory = Array.isArray(query.history)
      ? query.history
      : [];
    const structured = normalizedHistory.map(h =>
      typeof h === 'string'
        ? { text: h, ts: new Date().toISOString() }
        : h
    );
    setEditQuery({ ...query, history: structured });
    setShowEditForm(true);
  };

  
  const handleSaveQuery = () => {
    if (!editQuery) return;
    const original = queries.find(q => q.id === editQuery.id) || {};
    const now = new Date(); 
    const tsISO = now.toISOString();
    const whenIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const history = Array.isArray(editQuery.history) ? [...editQuery.history] : [];

    if (editQuery.status !== original.status) {
      history.push({
        text: `Status changed to ${editQuery.status} by Admin on ${whenIST}`,
        ts: tsISO,
        type: 'status',
      });
    }
    if ((editQuery.assignedTo || 'Unassigned') !== (original.assignedTo || 'Unassigned')) {
      history.push({
        text: `Assigned to ${editQuery.assignedTo || 'Unassigned'} on ${whenIST}`,
        ts: tsISO,
        type: 'assign',
      });
    }

    const updatedQuery = { ...editQuery, history };
    queryDispatch({ type: 'UPDATE_QUERY', payload: { id: updatedQuery.id, updatedData: updatedQuery } });

    

    setShowEditForm(false);
    setEditQuery(null);
  };


  const exportToCSV = () => {
    const header = ['ID', 'Title', 'Category', 'Status', 'Assigned To', 'Student ID', 'Date', 'Attachment', 'History'];
    const rows = queries.map(q => {
      const histText = Array.isArray(q.history)
        ? q.history.map(h => (typeof h === 'string' ? h : h?.text || '')).join('; ')
        : '';
      return [
        q.id,
        (q.title || '').replace(/,/g, ' '),
        (q.category || '').replace(/,/g, ' '),
        q.status || '',
        q.assignedTo || 'Unassigned',
        q.studentId || '',
        q.date || '',
        q.attachment || '',
        histText.replace(/,/g, ' '),
      ];
    });

    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'queries_export.csv');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-purple-50 to-blue-100 font-inter text-gray-800">
      
      <section className="py-14 text-center">
        <div className="max-w-4xl mt-14 mx-auto px-4">
          <h1 className="hero-text text-4xl md:text-5xl font-bold leading-normal pb-1 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            Manage Queries
          </h1>
          {/* <p className="hero-text text-lg text-gray-700 mt-2 md:mt-3">
            Review, edit, and resolve campus queries efficiently.
          </p> */}
        </div>
      </section>

    
      <section className="flex-grow py-12 bg-white/50 backdrop-blur-md rounded-2xl max-w-6xl mx-auto px-4 md:px-8 shadow-xl border border-indigo-100 w-full mb-12 overflow-hidden">
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
              placeholder="Search queries by title, category, or student ID..."
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-3 rounded-full hover:from-indigo-700 hover:to-pink-600 flex items-center transition-all"
            >
              <Download className="w-5 h-5 mr-2" /> Export CSV
            </button>
          </div>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentQueries.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">No queries found.</p>
          ) : (
            currentQueries.map((query) => {
              
              const when = query?.date
                ? new Date(query.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                : '—';

              return (
                <div
                  key={query.id}
                  className="query-card bg-white p-6 rounded-xl shadow-md transition-all duration-300 border border-indigo-100 hover:shadow-lg will-change-transform"
                  style={{ transform: 'translateZ(0)' }} // prevent overflow bounce; enable GPU
                >
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-indigo-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">{query.title}</h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">Category: {query.category}</p>
                  <p className="text-sm text-gray-600 mb-2">Status: {query.status}</p>
                  <p className="text-sm text-gray-600 mb-2">Assigned To: {query.assignedTo || 'Unassigned'}</p>
                  <p className="text-sm text-gray-600 mb-2">Student ID: {query.studentId}</p>
                  <p className="text-sm text-gray-600 mb-2">Date: {when}</p>

                  <div className="text-xs text-gray-500 mb-4">
                    <span className="block font-semibold mb-1">History:</span>
                    {Array.isArray(query.history) && query.history.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {query.history.map((h, i) => {
                          const text = typeof h === 'string' ? h : h?.text || '';
                          const ts = typeof h === 'object' && h?.ts
                            ? new Date(h.ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                            : null;
                          return (
                            <li key={`${query.id}-h-${i}`}>
                              {text}
                              {ts ? <span className="text-[10px] text-gray-400"></span> : null}
                            </li> 
                          );
                        })}
                      </ul>
                    ) : (
                      <span>No changes</span>
                    )}
                  </div>

                  {query.attachment && (
                    <img
                      src={query.attachment}
                      alt="Attachment"
                      className="mt-2 max-w-full h-auto rounded-lg mb-4"
                    />
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditQuery(query)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 flex items-center transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuery(query.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 flex items-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 rounded-full ${currentPageSafe === number ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-indigo-500 hover:text-white transition-all`}
              >
                {number}
              </button>
            ))}
          </div>
        )}
      </section>

      {showEditForm && editQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-indigo-200 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-indigo-800 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text text-center font-poppins">
              Edit Query
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveQuery(); }} className="space-y-6">
              <div>
                <label className="block text-gray-800 mb-2 font-poppins font-semibold">Title:</label>
                <input
                  type="text"
                  value={editQuery.title || ''}
                  onChange={(e) => setEditQuery({ ...editQuery, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
                />
              </div>

              <div>
                <label className="block text-gray-800 mb-2 font-poppins font-semibold">Status:</label>
                <select
                  value={editQuery.status || 'Pending'}
                  onChange={(e) => setEditQuery({ ...editQuery, status: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-800 mb-2 font-poppins font-semibold">Assigned To:</label>
                <select
                  value={editQuery.assignedTo || 'Unassigned'}
                  onChange={(e) => setEditQuery({ ...editQuery, assignedTo: e.target.value === 'Unassigned' ? null : e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
                >
                  <option value="Unassigned">Unassigned</option>
                  {adminUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-800 mb-2 font-poppins font-semibold">History:</label>
                <input
                  type="text"
                  value={''}
                  onChange={() => {}}
                  placeholder="History is auto-recorded on save"
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button type="submit" className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-2 rounded-full hover:from-indigo-700 hover:to-pink-600 transition-all shadow-md">
                  Save
                </button>
                <button type="button" onClick={() => setShowEditForm(false)} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-400 transition-all shadow-md">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageQueries;
