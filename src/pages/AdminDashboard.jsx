import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Users, BarChart2, User, Search, Plus, Bell } from 'lucide-react';
import { gsap } from 'gsap';
import Chart from 'chart.js/auto';

const LAST_SEEN_TS_KEY = 'lastSeenAdminNotifTs';

const AdminDashboard = () => {
  const [queries, setQueries] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Student',
    department: '',
    studentId: '',
    adminRole: '',
  });
  const [editUser, setEditUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const contentRef = useRef(null);
  const notificationsRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const navigate = useNavigate();
  const [lastNotifCount, setLastNotifCount] = useState(() => Number(localStorage.getItem('lastSeenAdminNotifCount')) || 0);

  // --- Helper: Format date only (for Manage Queries table) ---
  const formatDateOnly = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const refreshUsers = () => setUsers(JSON.parse(localStorage.getItem('users') || '[]'));

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/', { replace: true });
  };

  const latestNotifTs = useMemo(() => {
    if (!notifications || notifications.length === 0) return null;
    const latest = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return latest?.timestamp || null;
  }, [notifications]);

  const hasNew = useMemo(() => notifications.length > lastNotifCount, [notifications, lastNotifCount]);

  const markNotifsSeen = () => {
    if (latestNotifTs) localStorage.setItem(LAST_SEEN_TS_KEY, latestNotifTs);
  };

  const scrollToNotifications = () => {
    markNotifsSeen();
    localStorage.setItem('lastSeenAdminNotifCount', notifications.length);
    setLastNotifCount(notifications.length);
    setTimeout(() => notificationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/', { replace: true });
      return;
    }

    const savedQueries = JSON.parse(localStorage.getItem('queries') || '[]');
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const savedNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');

    setQueries(savedQueries);
    setUsers(savedUsers);
    setNotifications(savedNotifications);

    const now = new Date();
    const overdueQueries = savedQueries.filter((q) => {
      const queryDate = new Date(q.date);
      const diffDays = Math.floor((now - queryDate) / (1000 * 60 * 60 * 24));
      return q.status === 'Pending' && diffDays > 3;
    });

    if (overdueQueries.length > 0) {
      const existing = new Set(savedNotifications.map((n) => n.message));
      const newOverdue = overdueQueries
        .filter((q) => !existing.has(`Query ID ${q.id} has been pending for over 3 days since ${q.date}`))
        .map((q) => ({
          id: Date.now() + q.id,
          message: `Query ID ${q.id} has been pending for over 3 days since ${q.date}`,
          timestamp: now.toISOString(),
        }));

      if (newOverdue.length > 0) {
        const updated = [...savedNotifications, ...newOverdue];
        setNotifications(updated);
        localStorage.setItem('adminNotifications', JSON.stringify(updated));
      }
    }

    const ctx = chartRef.current ? chartRef.current.getContext('2d') : null;
    if (ctx) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pending', 'In Progress', 'Resolved'],
          datasets:
            savedQueries.length > 0
              ? [
                  {
                    label: 'Query Status',
                    data: [
                      savedQueries.filter((q) => q.status === 'Pending').length,
                      savedQueries.filter((q) => q.status === 'In Progress').length,
                      savedQueries.filter((q) => q.status === 'Resolved').length,
                    ],
                    backgroundColor: ['#4B5EAA', '#A3BFFA', '#81C784'],
                    borderColor: ['#2A4066', '#6B91D7', '#4CAF50'],
                    borderWidth: 1,
                  },
                ]
              : [
                  {
                    label: '',
                    data: [0, 0, 0],
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                  },
                ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { position: 'top', display: savedQueries.length > 0 },
            title: { display: true, text: 'Query Status Overview' },
          },
          scales: {
            x: { display: true },
            y: { display: true, beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      });
    }

    const ctxAnimation = gsap.context(() => {
      if (!contentRef.current) return;
      gsap.from(contentRef.current.children, {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out',
      });
    });

    const onStorage = (e) => {
      if (e.key === 'adminNotifications') setNotifications(JSON.parse(e.newValue || '[]'));
      if (e.key === 'queries') setQueries(JSON.parse(e.newValue || '[]'));
    };
    window.addEventListener('storage', onStorage);

    const onFocus = () => {
      setNotifications(JSON.parse(localStorage.getItem('adminNotifications') || '[]'));
      setQueries(JSON.parse(localStorage.getItem('queries') || '[]'));
    };
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => {
      setNotifications(JSON.parse(localStorage.getItem('adminNotifications') || '[]'));
      setQueries(JSON.parse(localStorage.getItem('queries') || '[]'));
    }, 3000);

    return () => {
      ctxAnimation.revert();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [navigate]);

  const filteredUsers = users.filter(
    (user) =>
      user &&
      user.name &&
      typeof user.name === 'string' &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Add/Edit/Delete functions (same as previous) ---
  const handleAddUser = (e) => {
    e.preventDefault();
    const isStudent = newUser.role === 'Student';
    const valid =
      newUser.name &&
      newUser.email &&
      (isStudent ? newUser.department && newUser.studentId : newUser.adminRole);

    if (!valid) {
      alert('Please fill all required fields!');
      return;
    }

    const updatedUsers = [...users, { id: Date.now(), ...newUser }];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setNewUser({ name: '', email: '', role: 'Student', department: '', studentId: '', adminRole: '' });
    setShowForm(false);
    refreshUsers();
  };

  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    refreshUsers();
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setShowForm(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editUser && editUser.email && /^\S+@\S+\.\S+$/.test(editUser.email)) {
      const updatedUsers = users.map((user) => (user.id === editUser.id ? { ...editUser } : user));
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setEditUser(null);
      setShowForm(false);
      refreshUsers();
      return;
    }

    if (!editUser && newUser.email && /^\S+@\S+\.\S+$/.test(newUser.email)) {
      handleAddUser(e);
      return;
    }

    alert('Please enter a valid email!');
  };

  const handleDeleteQuery = (id) => {
    const updatedQueries = queries.filter((query) => query.id !== id);
    setQueries(updatedQueries);
    localStorage.setItem('queries', JSON.stringify(updatedQueries));
  };

  return (
    <div className="min-h-screen flex flex-col" ref={contentRef}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500">
          Welcome, Admin!
        </h2>
        <button
          onClick={scrollToNotifications}
          className="flex items-center px-4 py-2 rounded-full bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          title="Go to Notifications"
        >
          <Bell className="w-5 h-5 text-indigo-600 mr-2" />
          <span className="font-semibold text-indigo-700 hidden sm:inline">Notifications</span>
          {hasNew && <span className="ml-2 inline-block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />}
        </button>
      </div>

      {/* Manage Queries Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-indigo-400/40 transition-all duration-300 border border-indigo-100 lg:col-span-3">
          <h3 className="text-xl font-semibold mb-5 text-indigo-700 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3" /> Manage Queries
          </h3>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-[800px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="p-4 text-center font-semibold">ID</th>
                  <th className="p-4 text-left font-semibold">Category</th>
                  <th className="p-4 text-center font-semibold">Title</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Date</th>
                  <th className="p-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.filter((q) => q.status === 'Pending').slice(0, 5).map((q) => (
                  <tr key={q.id} className="border-t hover:bg-indigo-50/50 transition-colors">
                    <td className="p-4 text-center">{q.id}</td>
                    <td className="p-4">{q.category}</td>
                    <td className="p-4 text-center">{q.title}</td>
                    <td className="p-4 text-center">{q.status}</td>
                    <td className="p-4 text-center whitespace-nowrap">{formatDateOnly(q.date)}</td>
                    <td className="p-4 text-center">
                      <Link
                        to="/manage-queries"
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-800 to-blue-500 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-400 hover:shadow-lg transition-all duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            to="/manage-queries"
            className="mt-4 inline-block w-full text-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-600 transition-all"
          >
            View All Queries
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-green-400/40 transition-all duration-300 border border-green-100">
          <h3 className="text-xl font-semibold mb-5 text-indigo-700 flex items-center">
            <BarChart2 className="w-6 h-6 mr-3" /> Reports
          </h3>
          <div className="h-72" style={{ position: 'relative' }}>
            <canvas
              ref={chartRef}
              id="queryChart"
              style={{ maxHeight: '100%', maxWidth: '100%', position: 'absolute', top: 0, left: 0 }}
            />
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/reports"
              className="w-full inline-block bg-gradient-to-r from-green-800  to-emerald-500 text-white px-6 py-2 rounded-lg shadow-md hover:from-green-700 hover:to-emerald-400 hover:shadow-lg transition-all duration-200"
            >
              View Detailed Reports
            </Link>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-400/40 transition-all duration-300 border border-purple-100 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-5 text-indigo-700 flex items-center">
            <Users className="w-6 h-6 mr-3" /> User Management
          </h3>

          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
            {filteredUsers.slice(0, 6).map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border ${
                  user.role === 'Student'
                    ? 'bg-gradient-to-br from-green-50 to-white border-green-200 hover:border-green-300'
                    : 'bg-gradient-to-br from-purple-50 to-white border-purple-200 hover:border-purple-300'
                }`}
              >
                <User className="w-12 h-12 mx-auto mb-3" style={{ color: user.role === 'Student' ? '#4CAF50' : '#6B46C1' }} />
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

          <Link
            to="/user-management"
            className="mt-4 inline-block w-full text-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-600 transition-all"
          >
            View All Users
          </Link>
        </div>

        {/* Notifications */}
        <div
          ref={notificationsRef}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-yellow-400/40 transition-all duration-300 border border-yellow-100 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold text-indigo-700 flex items-center">
              <Bell className="w-6 h-6 mr-3" /> Notifications
            </h3>
            <Link
              to="/notifications-page"
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white text-md font-medium hover:shadow-lg transition-all duration-200"
              aria-label="View all notifications"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {notifications.length > 0 ? (
              <ul className="list-disc pl-5">
                {[...notifications]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 5)
                  .map((notif) => (
                    <li key={notif.id} className="text-gray-700 mb-3">
                      {notif.message} (Time:{' '}
                      {new Date(notif.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })})
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backdropFilter: 'blur(5px)' }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-6 text-indigo-700">
              {editUser ? 'Edit User' : 'Add New User'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editUser ? editUser.name : newUser.name}
                  onChange={(e) =>
                    editUser
                      ? setEditUser({ ...editUser, name: e.target.value })
                      : setNewUser({ ...newUser, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    editUser
                      ? setEditUser({ ...editUser, email: e.target.value })
                      : setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Role</label>
                <select
                  value={editUser ? editUser.role : newUser.role}
                  onChange={(e) =>
                    editUser
                      ? setEditUser({
                          ...editUser,
                          role: e.target.value,
                          department: '',
                          studentId: '',
                          adminRole: '',
                        })
                      : setNewUser({
                          ...newUser,
                          role: e.target.value,
                          department: '',
                          studentId: '',
                          adminRole: '',
                        })
                  }
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
                      onChange={(e) =>
                        editUser
                          ? setEditUser({ ...editUser, department: e.target.value })
                          : setNewUser({ ...newUser, department: e.target.value })
                      }
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
                      onChange={(e) =>
                        editUser
                          ? setEditUser({ ...editUser, studentId: e.target.value })
                          : setNewUser({ ...newUser, studentId: e.target.value })
                      }
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
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, adminRole: e.target.value })
                        : setNewUser({ ...newUser, adminRole: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Hostel Manager"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditUser(null);
                  }}
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
