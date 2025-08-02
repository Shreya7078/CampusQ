import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, BarChart2, User, Search, Plus } from 'lucide-react';
import { gsap } from 'gsap';

const AdminDashboard = () => {
  const [queries, setQueries] = useState([
    { id: 1, category: 'Hostel', title: 'Wi-Fi Issue', status: 'Pending', date: '2025-06-28', assignedTo: 'Admin1' },
    { id: 2, category: 'Mess', title: 'Food Complaint', status: 'Resolved', date: '2025-06-27', assignedTo: 'Admin2' },
    { id: 3, category: 'Library', title: 'Book Delay', status: 'Pending', date: '2025-06-29', assignedTo: 'Admin1' },
  ]);
  const [users, setUsers] = useState([
    { id: 1, name: 'User1', role: 'Student', department: 'Computer Science', studentId: 'S001' },
    { id: 2, name: 'User2', role: 'Admin', adminRole: 'Hostel Manager' },
    { id: 3, name: 'User3', role: 'Student', department: 'Electronics', studentId: 'S002' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student', department: '', studentId: '', adminRole: '' });
  const [editUser, setEditUser] = useState(null);
  const [editQuery, setEditQuery] = useState(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Authentication check
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) {
      navigate('/login');
    } else if (userRole !== 'admin') {
      navigate('/dashboard'); // Redirect to dashboard or login if not admin
    }

    // Animation
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current.children, {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.3,
        ease: 'back.out(1.7)',
      });
    });
    return () => ctx.revert();
  }, [navigate]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.email && (newUser.role === 'Student' ? newUser.department && newUser.studentId : newUser.adminRole)) {
      setUsers([...users, { id: users.length + 1, ...newUser }]);
      setNewUser({ name: '', email: '', role: 'Student', department: '', studentId: '', adminRole: '' });
      setShowForm(false);
    } else {
      alert('Please fill all required fields!');
    }
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setShowForm(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editUser) {
      setUsers(users.map(user => user.id === editUser.id ? { ...editUser } : user));
    } else {
      handleAddUser(e);
    }
    setEditUser(null);
    setShowForm(false);
  };

  const handleDeleteQuery = (id) => {
    setQueries(queries.filter(query => query.id !== id));
  };

  const handleEditQuery = (query) => {
    setEditQuery({ ...query }); // Create a copy for editing
  };

  const handleSaveQuery = () => {
    if (editQuery) {
      setQueries(queries.map(query =>
        query.id === editQuery.id ? { ...editQuery } : query
      ));
      setEditQuery(null); // Reset edit mode after save
    }
  };

  return (
    <div ref={contentRef}>
      <h2 className="text-4xl font-bold mb-6 -mt-5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500">Welcome, Admin!</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manage Queries Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-400/30 transition-all duration-300 border border-indigo-100 lg:col-span-3">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Manage Queries</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left w-1/4">Title</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Assigned To</th>
                  <th className="p-3 text-left w-1/7 ml-auto">Date</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q.id} className="border-t hover:bg-indigo-50 transition-colors">
                    <td className="p-3">{q.id}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={editQuery && editQuery.id === q.id ? editQuery.category : q.category}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, category: e.target.value } : { ...q, category: e.target.value })}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!editQuery || editQuery.id !== q.id}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={editQuery && editQuery.id === q.id ? editQuery.title : q.title}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, title: e.target.value } : { ...q, title: e.target.value })}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!editQuery || editQuery.id !== q.id}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="p-1 rounded bg-white border border-gray-300 hover:border-indigo-500"
                        value={editQuery && editQuery.id === q.id ? editQuery.status : q.status}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, status: e.target.value } : { ...q, status: e.target.value })}
                        disabled={!editQuery || editQuery.id !== q.id}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={editQuery && editQuery.id === q.id ? editQuery.assignedTo : q.assignedTo}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, assignedTo: e.target.value } : { ...q, assignedTo: e.target.value })}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!editQuery || editQuery.id !== q.id}
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap text-right">{q.date}</td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => (editQuery && editQuery.id === q.id ? handleSaveQuery() : handleEditQuery(q))}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {editQuery && editQuery.id === q.id ? 'Save' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteQuery(q.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-400/30 transition-all duration-300 border border-green-100">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><BarChart2 className="w-5 h-5 mr-2" /> Reports</h3>
          <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-col">
            <BarChart2 className="text-green-500 w-16 h-16 animate-pulse" />
            <p className="text-green-700 font-medium mt-2">Generate Report</p>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Download</button>
          </div>
        </div>

        {/* User Management Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-400/30 transition-all duration-300 border border-purple-100 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center"><Users className="w-5 h-5 mr-2" /> User Management</h3>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search users..."
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add User
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-purple-100">
                <User className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                <p className="text-center text-gray-800 font-medium">{user.name}</p>
                <p className="text-center text-sm text-gray-500">{user.role}</p>
                {user.department && <p className="text-center text-xs text-gray-500">Dept: {user.department}</p>}
                {user.studentId && <p className="text-center text-xs text-gray-500">ID: {user.studentId}</p>}
                {user.adminRole && <p className="text-center text-xs text-gray-500">Role: {user.adminRole}</p>}
                <div className="mt-2 text-center">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Form Popup */}
      {(showForm || editUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-white p-3 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">{editUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editUser ? editUser.name : newUser.name}
                  onChange={(e) => (editUser ? setEditUser({ ...editUser, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editUser ? editUser.email : newUser.email}
                  onChange={(e) => (editUser ? setEditUser({ ...editUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
                <select
                  value={editUser ? editUser.role : newUser.role}
                  onChange={(e) => (editUser ? setEditUser({ ...editUser, role: e.target.value, department: '', studentId: '', adminRole: '' }) : setNewUser({ ...newUser, role: e.target.value, department: '', studentId: '', adminRole: '' }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>Student</option>
                  <option>Admin</option>
                </select>
              </div>
              {((editUser && editUser.role === 'Student') || (!editUser && newUser.role === 'Student')) && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Department</label>
                    <input
                      type="text"
                      value={editUser ? editUser.department : newUser.department}
                      onChange={(e) => (editUser ? setEditUser({ ...editUser, department: e.target.value }) : setNewUser({ ...newUser, department: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter department"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Student ID</label>
                    <input
                      type="text"
                      value={editUser ? editUser.studentId : newUser.studentId}
                      onChange={(e) => (editUser ? setEditUser({ ...editUser, studentId: e.target.value }) : setNewUser({ ...newUser, studentId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter student ID"
                      required
                    />
                  </div>
                </>
              )}
              {((editUser && editUser.role === 'Admin') || (!editUser && newUser.role === 'Admin')) && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Admin Role</label>
                  <input
                    type="text"
                    value={editUser ? editUser.adminRole : newUser.adminRole}
                    onChange={(e) => (editUser ? setEditUser({ ...editUser, adminRole: e.target.value }) : setNewUser({ ...newUser, adminRole: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Hostel Manager"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditUser(null); }}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
                >
                  {editUser ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;