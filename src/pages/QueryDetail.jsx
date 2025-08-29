import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '../context/QueryContext';

const QueryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: { queries }, dispatch } = useQuery() || { state: { queries: [] } };

  const [query, setQuery] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const addAdminNotification = (message) => {
    const saved = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const now = new Date();
    const newNotif = { id: Date.now(), message, timestamp: now.toISOString() };
    const updated = [...saved, newNotif];
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  // Helper to format date and time in India timezone and desired format
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');

    // Return string showing date and time on separate lines for clarity (use <br/> in render)
    return `${day}/${month}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
  };

  useEffect(() => {
    const foundQuery = queries.find((q) => String(q.id) === String(id));
    if (foundQuery) {
      setQuery(foundQuery);
      setEditedData({
        title: foundQuery.title,
        description: foundQuery.description,
        priority: foundQuery.priority,
      });
      if (foundQuery.status === 'Resolved') {
        setIsEditing(false);
      }
    } else {
      navigate('/student-dashboard');
    }
  }, [id, queries, navigate]);

  const handleEdit = () => {
    if (!query) return;
    if (query.status === 'Resolved') {
      alert('This query has been resolved and cannot be edited.');
      return;
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!query) return;
    if (query.status === 'Resolved') {
      alert('This query has been resolved and cannot be edited.');
      setIsEditing(false);
      return;
    }

    dispatch({
      type: 'UPDATE_QUERY',
      payload: { id: query.id, updatedData: editedData },
    });

    const saved = JSON.parse(localStorage.getItem('queries') || '[]');
    const updated = saved.map((q) => (q.id === query.id ? { ...q, ...editedData } : q));
    localStorage.setItem('queries', JSON.stringify(updated));

    setQuery((prev) => (prev ? { ...prev, ...editedData } : prev));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!query) return;
    if (!window.confirm('Are you sure you want to delete this query?')) return;

    const saved = JSON.parse(localStorage.getItem('queries') || '[]');
    const toDelete = saved.find((q) => String(q.id) === String(query.id));

    const updated = saved.filter((q) => String(q.id) !== String(query.id));
    localStorage.setItem('queries', JSON.stringify(updated));

    dispatch({ type: 'DELETE_QUERY', payload: { id: query.id } });

    if (toDelete) {
      const studentDetails = JSON.parse(localStorage.getItem('studentDetails') || '{}');
      const studentId = toDelete.studentId || studentDetails.studentId || 'S001';
      addAdminNotification(
        `Student ${studentId} deleted query "${toDelete.title}" (ID: ${toDelete.id}) on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
      );
    }

    navigate('/student-dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  if (!query) return <div>Loading...</div>;

  const isResolved = query.status === 'Resolved';

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 max-w-md w-full transform transition-all duration-300 hover:shadow-indigo-300/50 mt-20">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-center">
          Query Details
        </h2>

        <div className="space-y-4">
          <p>
            <strong>Category:</strong> {query.category}
          </p>

          <div>
            <label className="block text-gray-800 mb-2">
              <strong>Title:</strong>
            </label>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedData.title}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isResolved}
              />
            ) : (
              <p>{query.title}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-800 mb-2">
              <strong>Description:</strong>
            </label>
            {isEditing ? (
              <textarea
                name="description"
                value={editedData.description}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                disabled={isResolved}
              />
            ) : (
              <p>{query.description}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-800 mb-2">
              <strong>Priority:</strong>
            </label>
            {isEditing ? (
              <select
                name="priority"
                value={editedData.priority}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isResolved}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            ) : (
              <p>{query.priority}</p>
            )}
          </div>

          <p>
            <strong>Status:</strong> {query.status}
          </p>

          <p>
            <strong>Date:</strong>{' '}
            <span style={{ whiteSpace: 'pre-line' }}>{formatDateTime(query.date)}</span>
          </p>

          {query.attachment && (
            <a
              href={query.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              View Attachment
            </a>
          )}

          <div className="flex gap-4 mt-6">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className={`w-full py-2 rounded-lg transition-all duration-300 ${
                  isResolved
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:from-indigo-700 hover:to-pink-600'
                }`}
                disabled={isResolved}
                title={isResolved ? 'Resolved queries cannot be edited' : 'Edit'}
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-green-700 to-emerald-500 text-white py-2 rounded-lg hover:from-green-800 hover:to-emerald-500 transition-all duration-300"
                disabled={isResolved}
                title={isResolved ? 'Resolved queries cannot be edited' : 'Save'}
              >
                Save
              </button>
            )}

            <button
              onClick={handleDelete}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-2 rounded-lg hover:from-red-700 hover:to-orange-600 transition-all duration-300"
            >
              Delete
            </button>
          </div>

          <button
            onClick={() => navigate('/student-dashboard')}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all duration-300 mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryDetail;
