import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '../Context/QueryContext';

const QueryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: { queries }, dispatch } = useQuery() || { state: { queries: [] } };
  const [query, setQuery] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const foundQuery = queries.find(q => q.id === parseInt(id));
    if (foundQuery) {
      setQuery(foundQuery);
      setEditedData({ title: foundQuery.title, description: foundQuery.description, priority: foundQuery.priority });
    } else {
      navigate('/student-dashboard');
    }
  }, [id, queries, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (query) {
      dispatch({
        type: 'UPDATE_QUERY',
        payload: { id: query.id, updatedData: editedData },
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (query && window.confirm('Are you sure you want to delete this query?')) {
      dispatch({ type: 'DELETE_QUERY', payload: { id: query.id } });
      navigate('/student-dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  if (!query) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-6" style={{ backdropFilter: 'blur(5px)' }}>
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 max-w-md w-full transform transition-all duration-300 hover:shadow-indigo-300/50 mt-20">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-center">Query Details</h2>
        <div className="space-y-4">
          <p><strong>Category:</strong> {query.category}</p>
          <div>
            <label className="block text-gray-800 mb-2"><strong>Title:</strong></label>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedData.title}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p>{query.title}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-800 mb-2"><strong>Description:</strong></label>
            {isEditing ? (
              <textarea
                name="description"
                value={editedData.description}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            ) : (
              <p>{query.description}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-800 mb-2"><strong>Priority:</strong></label>
            {isEditing ? (
              <select
                name="priority"
                value={editedData.priority}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            ) : (
              <p>{query.priority}</p>
            )}
          </div>
          <p><strong>Status:</strong> {query.status}</p>
          <p><strong>Date:</strong> {query.date}</p>
          {query.attachment && (
            <a href={query.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Attachment</a>
          )}
          <div className="flex gap-4 mt-6">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all duration-300"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-green-700 to-emerald-500 text-white py-2 rounded-lg hover:from-green-800 hover:to-emerald-500 transition-all duration-300"
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