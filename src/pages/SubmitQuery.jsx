import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../context/QueryContext';

const SubmitQuery = () => {
  const [formData, setFormData] = useState({
    category: 'Hostel',
    title: '',
    description: '',
    priority: 'Medium',
    attachment: null,
  });
  const navigate = useNavigate();
  const { state: { dispatch } } = useQuery() || { state: { dispatch: () => console.log('Dispatch not available') } }; // Fallback

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData); // Debug: Check form data
    if (!dispatch) {
      console.error('Dispatch is not available. Check QueryContext setup.');
      return;
    }
    const newQuery = {
      id: Date.now(),
      ...formData,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_QUERY', payload: newQuery });
    console.log('Query Dispatched:', newQuery); // Debug: Confirm dispatch
    navigate('/student-dashboard');
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-6" style={{ backdropFilter: 'blur(5px)' }}>
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 max-w-md w-full transform transition-all duration-300 hover:shadow-indigo-300/50 mt-20">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-center">Submit New Query</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-800 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full p-3 bg-gray-100/10 border border-gray-300 rounded-lg ${formData.category !== '' ? 'text-gray-800' : 'text-gray-400'} placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              required
            >
              <option value="Hostel" className="text-gray-800">Hostel</option>
              <option value="Mess" className="text-gray-800">Mess</option>
              <option value="Library" className="text-gray-800">Library</option>
              <option value="Network" className="text-gray-800">Network</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-800 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full p-3 bg-gray-100/10 border border-gray-300 rounded-lg ${formData.title !== '' ? 'text-gray-800' : 'text-gray-200'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              maxLength={100}
              placeholder="Enter query title"
              required
            />
          </div>
          <div>
            <label className="block text-gray-800 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full p-3 bg-gray-100/10 border border-gray-300 rounded-lg ${formData.description !== '' ? 'text-gray-800' : 'text-gray-200'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              maxLength={500}
              rows={1}
              placeholder="Describe your issue"
              required
            />
          </div>
          <div>
            <label className="block text-gray-800 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className={`w-full p-3 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="Low" className="text-gray-800">Low</option>
              <option value="Medium" className="text-gray-800">Medium</option>
              <option value="High" className="text-gray-800">High</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-800 mb-2">Attachment (Image/PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full cursor-pointer p-3 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-400 file:bg-gradient-to-r file:from-indigo-600 file:to-pink-500 file:text-white file:border-none file:rounded file:mr-4 file:px-4 hover:file:from-indigo-700 hover:file:to-pink-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all duration-300"
          >
            Submit Query
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuery;