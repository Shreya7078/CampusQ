import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Edit, Trash2, Download } from 'lucide-react';
import { gsap } from 'gsap';
import { useQuery } from '../context/QueryContext';
import Footer from '../Components/Footer';
import { saveAs } from 'file-saver';

const ManageQueries = () => {
  const navigate = useNavigate();
  const { state: { queries, dispatch }, dispatch: queryDispatch } = useQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [editQuery, setEditQuery] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [queriesPerPage] = useState(10);
  const [adminUsers] = useState(['Admin1', 'Admin2', 'Admin3']);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/', { replace: true });
      return;
    }

    gsap.from('.query-card', {
        y: 60,
        scale: 0.98,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'bounce.out'
      });

      gsap.fromTo(
        '.hero-text',
        { y: 30, opacity: 0, scale: 0.9 },
        { duration: 1, y: 0, opacity: 1, scale: 1, ease: 'elastic.out(1, 0.3)' }
      );
    }, [navigate, queries]);

  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const indexOfLastQuery = currentPage * queriesPerPage;
  const indexOfFirstQuery = indexOfLastQuery - queriesPerPage;
  const currentQueries = filteredQueries.slice(indexOfFirstQuery, indexOfLastQuery);
  const totalPages = Math.ceil(filteredQueries.length / queriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteQuery = (id) => {
    queryDispatch({ type: 'DELETE_QUERY', payload: { id } });
  };

  const handleEditQuery = (query) => {
    setEditQuery({ ...query });
    setShowEditForm(true);
  };

  const handleSaveQuery = () => {
    if (editQuery) {
      const now = new Date('2025-08-19T00:43:00Z'); // 12:43 AM IST
      const historyUpdate = editQuery.history || [];
      if (editQuery.status !== queries.find(q => q.id === editQuery.id)?.status) {
        historyUpdate.push(`Status changed to ${editQuery.status} by Admin on ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      }
      if (editQuery.assignedTo !== queries.find(q => q.id === editQuery.id)?.assignedTo) {
        historyUpdate.push(`Assigned to ${editQuery.assignedTo} on ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      }
      const updatedQuery = { ...editQuery, history: historyUpdate };
      queryDispatch({ type: 'UPDATE_QUERY', payload: { id: updatedQuery.id, updatedData: updatedQuery } });

      if (editQuery.status === 'Resolved' && queries.find(q => q.id === editQuery.id)?.status !== 'Resolved') {
        const newNotification = {
          id: Date.now(),
          message: `Query ID ${editQuery.id} has been resolved on ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
          timestamp: now.toISOString(),
          studentId: editQuery.studentId
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
      }

      setShowEditForm(false);
      setEditQuery(null);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['ID', 'Title', 'Category', 'Status', 'Assigned To', 'Student ID', 'Date', 'Attachment', 'History'],
      ...queries.map(q => [
        q.id,
        q.title,
        q.category,
        q.status,
        q.assignedTo || 'Unassigned',
        q.studentId,
        q.date,
        q.attachment || '',
        q.history ? q.history.join('; ') : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'queries_export.csv');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-purple-50 to-blue-100 font-inter text-gray-800">
      {/* Hero Section */}
      <section className="py-14 text-center">
        <div className="max-w-4xl mt-14 mx-auto px-4">
          <h1 className="hero-text text-4xl md:text-5xl font-bold leading-normal pb-1  bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            Manage Queries
          </h1>
          <p className="hero-text text-lg text-gray-700 mt-2 md:mt-3">
            Review, edit, and resolve campus queries efficiently.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-grow py-12 bg-white/50 backdrop-blur-md rounded-2xl max-w-6xl mx-auto px-4 md:px-8 shadow-xl border border-indigo-100 w-full mb-12">
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
            currentQueries.map((query) => (
              <div
                key={query.id}
                className="query-card bg-white p-6 rounded-xl shadow-md hover:bg-gradient-to-br from-indigo-50 to-purple-50 hover:scale-105 transition-all duration-300 border border-indigo-100"
              >
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">{query.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Category: {query.category}</p>
                <p className="text-sm text-gray-600 mb-2">Status: {query.status}</p>
                <p className="text-sm text-gray-600 mb-2">Assigned To: {query.assignedTo || 'Unassigned'}</p>
                <p className="text-sm text-gray-600 mb-2">Student ID: {query.studentId}</p>
                <p className="text-sm text-gray-600 mb-2">Date: {query.date}</p>
                <p className="text-xs text-gray-500 mb-4">History: {query.history ? query.history.join(', ') : 'No changes'}</p>
                {query.attachment && (
                  <img src={query.attachment} alt="Attachment" className="mt-2 max-w-full h-auto rounded-lg mb-4" />
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditQuery(query)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 flex items-center transition-all duration-300"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuery(query.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 flex items-center transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 rounded-full ${currentPage === number ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-indigo-500 hover:text-white transition-all`}
              >
                {number}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100  backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-indigo-200 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-indigo-800 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text text-center font-poppins">Edit Query</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveQuery(); }} className="space-y-6">
              <div>
                <label className="block text-gray-800 mb-2 font-poppins font-semibold">Title:</label>
                <input
                  type="text"
                  value={editQuery.title}
                  onChange={(e) => setEditQuery({ ...editQuery, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
                />
              </div>
              <div>
                <label className="block text-gray-800 mb-2 font-poppins font-semibold">Status:</label>
                <select
                  value={editQuery.status}
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
                  value={editQuery.history ? editQuery.history.join(', ') : ''}
                  onChange={(e) => setEditQuery({ ...editQuery, history: e.target.value.split(', ').filter(h => h) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
                  placeholder="e.g., Status changed to Resolved by Admin"
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

      {/* Footer always at bottom with space */}
      <Footer />
    </div>
  );
};

export default ManageQueries;