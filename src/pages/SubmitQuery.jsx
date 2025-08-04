import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../context/QueryContext';

const SubmitQuery = () => {
  const navigate = useNavigate();
  const { dispatch } = useQuery();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'Medium',
    attachment: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment' && files) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [name]: reader.result }); // Stores as base64
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuery = {
      id: Date.now(), // Temporary ID
      ...formData,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      attachment: formData.attachment, // Base64 data
    };
    dispatch({ type: 'ADD_QUERY', payload: newQuery });
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-6" style={{ backdropFilter: 'blur(5px)' }}>
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 max-w-md w-full transform transition-all duration-300 hover:shadow-indigo-300/50 mt-20">
        <h2 className="text-3xl font-montserrat font-bold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-center">Submit New Query</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-800 mb-2 font-poppins font-semibold"><strong>Category:</strong></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 font-inter focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              <option value="Library">Library</option>
              <option value="Network">Network</option>
              <option value="Hostel">Hostel</option>
              <option value="Mess">Mess</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-800 mb-2 font-poppins font-semibold"><strong>Title:</strong></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 font-inter  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter title"
            />
          </div>
          <div>
            <label className="block text-gray-800 mb-2 font-poppins font-semibold"><strong>Description:</strong></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 font-inter  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-gray-800 mb-2 font-poppins font-semibold"><strong>Priority:</strong></label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 font-inter  focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-800 mb-2 font-poppins font-semibold"><strong>Attachment:</strong></label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full p-2 bg-gray-100/10 border border-gray-300 rounded-lg text-gray-800 font-inter  focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {formData.attachment && (
              <div className="mt-2">
                <p className="text-gray-600 font-poppins">Attachment Preview:</p>
                {formData.attachment.startsWith('data:image') ? (
                  <img src={formData.attachment} alt="Preview" className="mt-2 max-w-full h-auto rounded-lg" />
                ) : (
                  <p className="text-gray-600 font-poppins">Preview available only for images.</p>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all duration-300 font-poppins font-bold"
          >
            Submit Query
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuery;