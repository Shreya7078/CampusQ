import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, BarChart2, User, Search, Plus, Bell } from 'lucide-react';
import { gsap } from 'gsap';
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
  const [queries, setQueries] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student', department: '', studentId: '', adminRole: '' });
  const [editUser, setEditUser] = useState(null);
  const [editQuery, setEditQuery] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole'); // Ensure userRole is also removed
    navigate('/', { replace: true }); // Use replace to avoid back navigation
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    console.log('useEffect triggered - isAuthenticated:', isAuthenticated, 'userRole:', userRole);
    if (!isAuthenticated) {
      navigate('/', { replace: true }); // Immediate redirect if not authenticated
      return; // Exit early to avoid further execution
    } else if (userRole !== 'admin') {
      navigate('/dashboard', { replace: true });
      return; // Exit early to avoid further execution
    }

    // Load data from localStorage or set default
    const savedQueries = JSON.parse(localStorage.getItem('queries') || '[]');
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    console.log('Saved Queries:', savedQueries);
    console.log('Saved Users:', savedUsers);
    console.log('Saved Notifications:', savedNotifications);
    if (savedQueries.length > 0) setQueries(savedQueries);
    else setQueries([
      { id: 1, category: 'Hostel', title: 'Wi-Fi Issue', status: 'Pending', date: '2025-06-28', assignedTo: 'Admin1', studentId: 'S001' },
      { id: 2, category: 'Mess', title: 'Food Complaint', status: 'Resolved', date: '2025-06-27', assignedTo: 'Admin2', studentId: 'S002' },
      { id: 3, category: 'Library', title: 'Book Delay', status: 'Pending', date: '2025-06-29', assignedTo: 'Admin1', studentId: 'S003' },
    ]);
    if (savedUsers.length > 0) setUsers(savedUsers);
    else setUsers([
      { id: 1, name: 'User1', role: 'Student', department: 'Computer Science', studentId: 'S001' },
      { id: 2, name: 'User2', role: 'Admin', adminRole: 'Hostel Manager' },
      { id: 3, name: 'User3', role: 'Student', department: 'Electronics', studentId: 'S002' },
      { id: 4, name: 'User4', role: 'Student', department: 'Mechanical', studentId: 'S003' },
    ]);
    if (savedNotifications.length > 0) setNotifications(savedNotifications);

    // Chart setup
    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (queries.length > 0) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Pending', 'In Progress', 'Resolved'],
            datasets: [{
              label: 'Query Status',
              data: [
                queries.filter(q => q.status === 'Pending').length,
                queries.filter(q => q.status === 'In Progress').length,
                queries.filter(q => q.status === 'Resolved').length
              ],
              backgroundColor: ['#4B5EAA', '#A3BFFA', '#81C784'],
              borderColor: ['#2A4066', '#6B91D7', '#4CAF50'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Query Status Overview' }
            }
          }
        });
      }
    }
  }, [navigate, queries]); // Added queries as dependency to update chart on query changes

  const filteredUsers = users.filter(user =>
    user && user.name && typeof user.name === 'string' && user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.email && (newUser.role === 'Student' ? newUser.department && newUser.studentId : newUser.adminRole)) {
      const updatedUsers = [...users, { id: users.length + 1, ...newUser }];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setNewUser({ name: '', email: '', role: 'Student', department: '', studentId: '', adminRole: '' });
      setShowForm(false);
    } else {
      alert('Please fill all required fields!');
    }
  };

  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setShowForm(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editUser && editUser.email && /^\S+@\S+\.\S+$/.test(editUser.email)) {
      const updatedUsers = users.map(user => user.id === editUser.id ? { ...editUser } : user);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } else if (!editUser && newUser.email && /^\S+@\S+\.\S+$/.test(newUser.email)) {
      handleAddUser(e);
    } else {
      alert('Please enter a valid email!');
      return;
    }
    setEditUser(null);
    setShowForm(false);
  };

  const handleDeleteQuery = (id) => {
    const updatedQueries = queries.filter(query => query.id !== id);
    setQueries(updatedQueries);
    localStorage.setItem('queries', JSON.stringify(updatedQueries));
  };

  const handleEditQuery = (query) => {
    setEditQuery({ ...query, assignedTo: query.assignedTo || 'Admin1', studentId: query.studentId || 'S001' });
  };

  const handleSaveQuery = () => {
    if (editQuery) {
      // Remove validation alert for studentId and assignedTo
      const updatedQueries = queries.map(query =>
        query.id === editQuery.id ? { ...editQuery } : query
      );
      setQueries(updatedQueries);
      localStorage.setItem('queries', JSON.stringify(updatedQueries));
      if (editQuery.status === 'Resolved') {
        const student = users.find(u => u.studentId === editQuery.studentId);
        if (student) {
          const newNotification = {
            id: notifications.length + 1,
            message: `Your query "${editQuery.title}" (ID: ${editQuery.id}) has been resolved on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
            studentId: editQuery.studentId,
            timestamp: new Date().toISOString()
          };
          const updatedNotifications = [...notifications, newNotification];
          setNotifications(updatedNotifications);
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          const studentNotifications = JSON.parse(localStorage.getItem(`notifications_${editQuery.studentId}`) || '[]');
          localStorage.setItem(`notifications_${editQuery.studentId}`, JSON.stringify([...studentNotifications, newNotification]));
        }
      }
      setEditQuery(null);
    }
  };

  return (
    <div ref={contentRef} className="p-4 sm:p-6 min-h-screen">
      <h2 className="text-4xl font-bold -mt-5 mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500">Welcome, Admin!</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manage Queries Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-indigo-400/40 transition-all duration-300 border border-indigo-100 lg:col-span-3">
          <h3 className="text-xl font-semibold mb-5 text-indigo-700 flex items-center"><AlertTriangle className="w-6 h-6 mr-3" /> Manage Queries</h3>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-[800px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="p-4 text-center font-semibold">ID</th>
                  <th className="p-4 text-left font-semibold">Category</th>
                  <th className="p-4 text-center font-semibold w-1/4">Title</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Assigned To</th>
                  <th className="p-4 text-center font-semibold">Student ID</th>
                  <th className="p-4 text-center font-semibold w-1/7">Date</th>
                  <th className="p-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q.id} className="border-t hover:bg-indigo-50/50 transition-colors">
                    <td className="p-4">{q.id}</td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={q.category}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        disabled
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editQuery && editQuery.id === q.id ? editQuery.title : q.title}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, title: e.target.value } : { ...q, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        disabled={!editQuery || editQuery.id !== q.id}
                      />
                    </td>
                    <td className="p-4">
                      <select
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        value={editQuery && editQuery.id === q.id ? editQuery.status : q.status}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, status: e.target.value } : { ...q, status: e.target.value })}
                        disabled={!editQuery || editQuery.id !== q.id}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editQuery && editQuery.id === q.id ? editQuery.assignedTo : q.assignedTo || 'Admin1'}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, assignedTo: e.target.value } : { ...q, assignedTo: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        disabled={!editQuery || editQuery.id !== q.id}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editQuery && editQuery.id === q.id ? editQuery.studentId : q.studentId || 'S001'}
                        onChange={(e) => setEditQuery(prev => prev && prev.id === q.id ? { ...prev, studentId: e.target.value } : { ...q, studentId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        disabled={!editQuery || editQuery.id !== q.id}
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap">{q.date}</td>
                    <td className="p-4 flex space-x-3">
                      <button
                        onClick={() => (editQuery && editQuery.id === q.id ? handleSaveQuery() : handleEditQuery(q))}
                        className="px-3 bg-gradient-to-r from-blue-800 to-blue-500 py-1.5 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-400 hover:shadow-lg transition-all duration-200"
                      >
                        {editQuery && editQuery.id === q.id ? 'Save' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteQuery(q.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-800 to-red-500 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-400 hover:shadow-lg transition-all duration-200"
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
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-green-400/40 transition-all duration-300 border border-green-100">
          <h3 className="text-xl font-semibold mb-5 text-indigo-700 flex items-center"><BarChart2 className="w-6 h-6 mr-3" /> Reports</h3>
          <div className="h-64" style={{ position: 'relative' }}>
            <canvas ref={chartRef} id="queryChart" style={{ maxHeight: '100%', maxWidth: '100%', position: 'absolute', top: 0, left: 0 }}></canvas>
          </div>
          <button className="mt-5 w-full bg-gradient-to-r from-green-800 to-emerald-500 text-white px-6 py-2 rounded-lg shadow-md hover:from-green-700 hover:to-emerald-400 hover:shadow-lg transition-all duration-200">
            Download Report
          </button>
        </div>

        {/* User Management Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-400/40 transition-all duration-300 border border-purple-100 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-5 text-indigo-700 flex items-center"><Users className="w-6 h-6 mr-3" /> User Management</h3>
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search users..."
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-full shadow-md hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Add User
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-purple-100">
                <User className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                <p className="text-center text-gray-800 font-medium text-lg">{user.name}</p>
                <p className="text-center text-sm text-gray-600">{user.role}</p>
                {user.department && <p className="text-center text-xs text-gray-600">Dept: {user.department}</p>}
                {user.studentId && <p className="text-center text-xs text-gray-600">ID: {user.studentId}</p>}
                {user.adminRole && <p className="text-center text-xs text-gray-600">Role: {user.adminRole}</p>}
                <div className="mt-3 text-center">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="px-4 py-1.5 bg-gradient-to-r from-blue-800 to-blue-500 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-400 hover:shadow-lg transition-all duration-200 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-4 py-1.5 bg-gradient-to-r from-red-800 to-red-500 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-400 hover:shadow-lg transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-yellow-400/40 transition-all duration-300 border border-yellow-100 lg:col-span-3">
          <h3 className="text-xl font-semibold mb-5 text-indigo-700 flex items-center"><Bell className="w-6 h-6 mr-3" /> Notifications</h3>
          <div className="overflow-x-auto max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {notifications.length > 0 ? (
              <ul className="list-disc pl-5">
                {notifications.map((notif) => (
                  <li key={notif.id} className="text-gray-700 mb-3">
                    {notif.message} (Student ID: {notif.studentId}, Time: {new Date(notif.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">No notifications yet.</p>
            )}
          </div>
        </div>
      </div>

      {(showForm || editUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-6 text-indigo-700">{editUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editUser ? editUser.name : newUser.name}
                  onChange={(e) => (editUser ? setEditUser({ ...editUser, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editUser ? editUser.email : newUser.email}
                  onChange={(e) => (editUser ? setEditUser({ ...editUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Role</label>
                <select
                  value={editUser ? editUser.role : newUser.role}
                  onChange={(e) => (editUser ? setEditUser({ ...editUser, role: e.target.value, department: '', studentId: '', adminRole: '' }) : setNewUser({ ...newUser, role: e.target.value, department: '', studentId: '', adminRole: '' }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>Student</option>
                  <option>Admin</option>
                </select>
              </div>
              {((editUser && editUser.role === 'Student') || (!editUser && newUser.role === 'Student')) && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Department</label>
                    <input
                      type="text"
                      value={editUser ? editUser.department : newUser.department}
                      onChange={(e) => (editUser ? setEditUser({ ...editUser, department: e.target.value }) : setNewUser({ ...newUser, department: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter department"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Student ID</label>
                    <input
                      type="text"
                      value={editUser ? editUser.studentId : newUser.studentId}
                      onChange={(e) => (editUser ? setEditUser({ ...editUser, studentId: e.target.value }) : setNewUser({ ...newUser, studentId: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter student ID"
                      required
                    />
                  </div>
                </>
              )}
              {((editUser && editUser.role === 'Admin') || (!editUser && newUser.role === 'Admin')) && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Admin Role</label>
                  <input
                    type="text"
                    value={editUser ? editUser.adminRole : newUser.adminRole}
                    onChange={(e) => (editUser ? setEditUser({ ...editUser, adminRole: e.target.value }) : setNewUser({ ...newUser, adminRole: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Hostel Manager"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditUser(null); }}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 hover:shadow-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg transition-all duration-200"
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