
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Edit, Mail, LogOut, Bell, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { useQuery } from '../context/QueryContext';
import Footer from '../Components/Footer';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { state: { queries, notifications }, dispatch } = useQuery();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'student');

  const [userDetails, setUserDetails] = useState(() => {
    const storedStudent = JSON.parse(localStorage.getItem('studentDetails') || '{}');
    const storedAdmin = JSON.parse(localStorage.getItem('adminDetails') || '{}');
    return role === 'student' ? storedStudent : storedAdmin || {
      name: role === 'admin' ? 'Admin' : 'John Doe',
      email: role === 'admin' ? 'admin@campusq.com' : 'johndoe@campusq.com',
      studentId: 'S001',
      department: 'Computer Science',
      adminRole: 'Hostel Manager',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState(userDetails);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastRef = useRef(null);

  // Helper: add a single admin notification to localStorage and in-memory state (admin view)
  const addAdminNotification = (message) => {
    const saved = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const now = new Date();
    const newNotif = { id: Date.now(), message, timestamp: now.toISOString() };
    const updated = [...saved, newNotif];
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
    setAdminNotifications(updated);
  };

  // Initialize role-specific details
  useEffect(() => {
    if (!isAuthenticated) return;
    setRole(localStorage.getItem('userRole') || 'student');

    const storedStudent = JSON.parse(localStorage.getItem('studentDetails') || '{}');
    const storedAdmin = JSON.parse(localStorage.getItem('adminDetails') || '{}');

    if (role === 'student' && storedStudent && Object.keys(storedStudent).length > 0) {
      setUserDetails(storedStudent);
      setEditedDetails(storedStudent);
    } else if (role === 'admin' && storedAdmin && Object.keys(storedAdmin).length > 0) {
      setUserDetails(storedAdmin);
      setEditedDetails(storedAdmin);
    } else {
      const defaultUser = {
        name: role === 'admin' ? 'Admin' : 'John Doe',
        email: role === 'admin' ? 'admin@campusq.com' : 'johndoe@campusq.com',
        studentId: 'S001',
        department: 'Computer Science',
        adminRole: 'Hostel Manager',
      };
      setUserDetails(defaultUser);
      setEditedDetails(defaultUser);
      if (role === 'student') {
        localStorage.setItem('studentDetails', JSON.stringify(defaultUser));
      } else {
        localStorage.setItem('adminDetails', JSON.stringify(defaultUser));
      }
    }
  }, [isAuthenticated, role]);

  // STUDENT: generate notifications when their queries get resolved (existing behavior retained)
  useEffect(() => {
    if (!isAuthenticated) return;

    const now = new Date(); // current time
    if (role === 'student') {
      const savedQueries = JSON.parse(localStorage.getItem('queries') || '[]');
      const studentNotifications = savedQueries
        .filter(q => q.studentId === userDetails.studentId && q.status === 'Resolved')
        .map(q => ({
          id: q.id,
          message: `Your query "${q.title}" (ID: ${q.id}) has been resolved on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
          studentId: userDetails.studentId,
          timestamp: now.toISOString()
        }))
        .filter(n => !notifications.some(existing => existing.id === n.id));

      if (studentNotifications.length > 0) {
        studentNotifications.forEach(n => dispatch({ type: 'ADD_NOTIFICATION', payload: n }));
      }
    }
  }, [isAuthenticated, role, userDetails.studentId, dispatch, notifications]);

  // ADMIN: only send notifications when a query is raised or deleted
  // We detect this by comparing current queries length vs last known queries length in localStorage
  const lastQueryCountRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') return;

    // Load current admin notifications
    const savedAdminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    setAdminNotifications(savedAdminNotifications);

    // Initialize lastQueryCountRef once
    if (lastQueryCountRef.current === null) {
      const savedQueries = JSON.parse(localStorage.getItem('queries') || '[]');
      lastQueryCountRef.current = savedQueries.length;
      return;
    }

    // Compare previous length with current length to detect raise/delete
    const savedQueries = JSON.parse(localStorage.getItem('queries') || '[]');
    const prevCount = lastQueryCountRef.current;
    const currCount = savedQueries.length;

    // Helper to find the delta item for message context
    const getDeltaItem = (prevList, currList, isAddition) => {
      const prevIds = new Set(prevList.map(q => q.id));
      const currIds = new Set(currList.map(q => q.id));
      if (isAddition) {
        // New item exists in curr but not in prev
        const newId = [...currIds].find(id => !prevIds.has(id));
        return currList.find(q => q.id === newId) || null;
      }
      // Deletion: item missing from curr
      const deletedId = [...prevIds].find(id => !currIds.has(id));
      return prevList.find(q => q.id === deletedId) || null;
    };

    if (currCount > prevCount) {
      // Query raised (added)
      const prevList = JSON.parse(localStorage.getItem('lastQueriesSnapshot') || '[]');
      const delta = getDeltaItem(prevList, savedQueries, true);
      const title = delta?.title || 'New Query';
      const qid = delta?.id || '(ID unknown)';
      const studentId = delta?.studentId || 'S001';
      addAdminNotification(
        `Student ${studentId} raised a query "${title}" (ID: ${qid}) on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
      );
    } else if (currCount < prevCount) {
      // Query deleted (removed)
      const prevList = JSON.parse(localStorage.getItem('lastQueriesSnapshot') || '[]');
      const delta = getDeltaItem(prevList, savedQueries, false);
      const title = delta?.title || 'A query';
      const qid = delta?.id || '(ID unknown)';
      const studentId = delta?.studentId || 'S001';
      addAdminNotification(
        `Student ${studentId} deleted query "${title}" (ID: ${qid}) on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
      );
    }

    // Update last references
    lastQueryCountRef.current = currCount;
    localStorage.setItem('lastQueriesSnapshot', JSON.stringify(savedQueries));
  }, [isAuthenticated, role, queries]); // reacts when queries in context change

  // Entrance animations
  useEffect(() => {
    gsap.fromTo(
      '.profile-card, .main-card',
      { y: 30, opacity: 0 },
      { duration: 1, y: 0, opacity: 1, stagger: 0.2, ease: 'power2.out' }
    );
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    setUserDetails(editedDetails);
    if (role === 'student') {
      localStorage.setItem('studentDetails', JSON.stringify(editedDetails));
    } else {
      localStorage.setItem('adminDetails', JSON.stringify(editedDetails));
    }
    setIsEditing(false);
    setToastMessage('Profile updated successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (showToast && toastRef.current) {
      gsap.fromTo(toastRef.current, { x: '100%', opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(toastRef.current, { opacity: 0, x: '100%', duration: 0.5, delay: 2.5, ease: 'power2.in', onComplete: () => setShowToast(false) });
    }
  }, [showToast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md border border-indigo-200">
          <Bell className="w-16 h-16 text-indigo-600 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-poppins font-bold text-indigo-800 mb-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6 font-poppins font-medium">
            Please log in to access your profile.
          </p>
          <Link to="/dashboard">
            <button className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all duration-300 shadow-md">
              Login Now
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredQueries = role === 'student'
    ? queries.filter(q => q.studentId === userDetails.studentId)
    : queries;

  const filteredNotifications = role === 'student'
    ? notifications.filter(n => n.studentId === userDetails.studentId)
    : adminNotifications; 

  return (
    <div className="min-h-screen pt-10 flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 font-poppins text-gray-800">
      {/* Toast Notification */}
      {showToast && (
        <div
          ref={toastRef}
          className="fixed top-4 right-4 bg-gradient-to-r from-indigo-200 to-purple-400 text-gray-800 px-4 py-3 rounded-md shadow-lg z-50 flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-grow max-w-7xl mx-auto py-12 px-4 md:px-8 grid md:grid-cols-3 gap-10">
        {/* Left Profile Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="profile-card bg-white p-[1px] rounded-2xl shadow-xl">
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center shadow-md mb-4">
                <User className="w-16 h-16 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
                {userDetails.name}
              </h2>
              <p className="text-gray-600 text-base mt-1">{role === 'admin' ? 'Admin Panel' : 'Student Portal'}</p>
              <p className="text-gray-500 text-sm mb-4">CampusQ, India</p>

              <div className="flex gap-4 mb-4 w-full justify-center flex-wrap">
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all flex items-center min-w-[100px] md:min-w-[120px]"
                >
                  <Edit className="w-5 h-5 mr-2" /> Edit
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all flex items-center min-w-[100px] md:min-w-[120px]"
                >
                  <LogOut className="w-5 h-5 mr-2" /> Logout
                </button>
              </div>

              <div className="w-full text-left text-base text-gray-700 space-y-3">
                <p className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-indigo-600" /> {editedDetails.email}
                </p>
                {role === 'student' && (
                  <p className="flex items-center">
                    <span className="w-5 h-5 mr-2 text-indigo-600">📚</span> {editedDetails.department}
                  </p>
                )}
                {role === 'admin' && (
                  <p className="flex items-center">
                    <span className="w-5 h-5 mr-2 text-indigo-600">👨💼</span> {editedDetails.adminRole}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Block */}
          <div className="bg-white p-[1px] rounded-2xl shadow-xl">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-700 mb-5">Your Stats</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition">
                  <p className="text-xl font-bold text-indigo-600">
                    {filteredQueries.length}
                  </p>
                  <p className="text-sm text-gray-500">Queries</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition">
                  <p className="text-xl font-bold text-indigo-600">
                    {filteredNotifications.length}
                  </p>
                  <p className="text-sm text-gray-500">Alerts</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition">
                  <p className="text-xl font-bold text-indigo-600">2025</p>
                  <p className="text-sm text-gray-500">Member Since</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Details */}
        <div className="main-card md:col-span-2 space-y-10">
          {/* Profile Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-semibold mb-6 text-indigo-700 border-b-2 border-indigo-200 pb-3">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wide">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedDetails.email}
                    onChange={(e) => setEditedDetails({ ...editedDetails, email: e.target.value })}
                    className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="font-medium text-lg">{editedDetails.email}</p>
                )}
              </div>
              {role === 'student' ? (
                <>
                  <div>
                    <p className="text-gray-500 text-sm uppercase tracking-wide">Student ID</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedDetails.studentId}
                        onChange={(e) => setEditedDetails({ ...editedDetails, studentId: e.target.value })}
                        className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="font-medium text-lg">{editedDetails.studentId}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm uppercase tracking-wide">Department</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedDetails.department}
                        onChange={(e) => setEditedDetails({ ...editedDetails, department: e.target.value })}
                        className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="font-medium text-lg">{editedDetails.department}</p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm uppercase tracking-wide">Admin Role</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedDetails.adminRole}
                      onChange={(e) => setEditedDetails({ ...editedDetails, adminRole: e.target.value })}
                      className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium text-lg">{editedDetails.adminRole}</p>
                  )}
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-6 mt-8">
                <button onClick={handleSave} className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-all">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Queries & Notifications */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-semibold mb-6 text-indigo-700 border-b-2 border-indigo-200 pb-3">
                {role === 'student' ? 'Query History' : 'Managed Queries'}
              </h3>
              <ul className="space-y-4">
                {filteredQueries.length === 0 ? (
                  <p className="text-gray-500">No queries found.</p>
                ) : (
                  filteredQueries.map((q) => (
                    <li key={q.id} className="border p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-all">
                      <p className="font-semibold text-base">{q.title}</p>
                      <p className="text-sm text-gray-500">{q.status}</p>
                      <p className="text-xs text-gray-400">{q.date}</p>
                      {q.attachment && (
                        <img src={q.attachment} alt="Attachment" className="mt-2 max-w-full h-auto rounded-lg" />
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-semibold mb-6 text-indigo-700 border-b-2 border-indigo-200 pb-3">Notifications</h3>
              <ul className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <p className="text-gray-500">No notifications found.</p>
                ) : (
                  filteredNotifications.map((n, i) => (
                    <li key={i} className="border p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all flex items-center">
                      <Bell className="w-6 h-6 text-indigo-600 mr-3" />
                      <div>
                        <p className="font-semibold text-base">{n.message || n}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(n.timestamp || Date.now()).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProfilePage;