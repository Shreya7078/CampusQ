

import { useState, useEffect, useRef, useMemo } from 'react';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../Components/Footer';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Student');
  const modalRef = useRef(null);

  // Hydrate users synchronously from localStorage (prevents empty first paint)
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('users') || '[]'));

  // Hydration flag to avoid rendering the table body before first effect/layout pass
  const [hydrated, setHydrated] = useState(false);

  // One-time normalization to ensure every user has dateAdded (self-heals older data)
  useEffect(() => {
    if (!Array.isArray(users) || users.length === 0) return;
    const needsPatch = users.some(u => !u?.dateAdded);
    if (!needsPatch) return;

    const patched = users.map(u => {
      if (u?.dateAdded) return u;

      // Prefer createdAt if present; otherwise attempt to derive from numeric id (Date.now())
      const guessDate = (() => {
        try {
          if (u?.createdAt) return new Date(u.createdAt);
          const maybeMs = Number(String(u?.id ?? '').slice(0, 13));
          if (!Number.isNaN(maybeMs) && maybeMs > 0) return new Date(maybeMs);
        } catch (_) {}
        return new Date();
      })();

      return {
        ...u,
        dateAdded: guessDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
    });

    setUsers(patched);
    localStorage.setItem('users', JSON.stringify(patched));
  }, [users]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Animate page title
    gsap.fromTo(
      '.page-title',
      { y: 30, opacity: 0, scale: 0.8 },
      {
        duration: 1.0,
        y: 0,
        opacity: 1,
        scale: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.page-title',
          start: 'top 85%',
          once: true
        },
        clearProps: 'transform'
      }
    );

    // Row animation: avoid opacity flicker, run next frame
    const cards = document.querySelectorAll('.user-card');
    if (cards.length > 0) {
      requestAnimationFrame(() => {
        gsap.from('.user-card', {
          y: 20,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.user-card',
            start: 'top 95%',
            toggleActions: 'play none none none'
          },
          clearProps: 'transform'
        });
      });
    }

    // Mark as hydrated so we render table rows after first layout
    setHydrated(true);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.killTweensOf('.page-title, .user-card');
    };
  }, []);

  // Add new user
  const handleAddUser = (e) => {
    e.preventDefault();
    const form = e.target;
    const role = selectedRole;

    const newUser = {
      id: Date.now(),
      name: form.name.value,
      email: form.email.value,
      role,
      department: role === 'Student' ? form.department.value : '',
      studentId: role === 'Student' ? form.studentId.value : '',
      adminRole: role === 'Admin' ? form.adminRole.value : '',
      dateAdded: new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    form.reset();
    setShowForm(false);
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditUser(user);
    setSelectedRole(user.role);
    setShowForm(true);
  };

  // Save user changes
  const handleSaveUser = (e) => {
    e.preventDefault();
    const form = e.target;
    const role = selectedRole;

    const updatedUser = {
      ...editUser,
      name: form.name.value,
      email: form.email.value,
      role,
      department: role === 'Student' ? form.department.value : '',
      studentId: role === 'Student' ? form.studentId.value : '',
      adminRole: role === 'Admin' ? form.adminRole.value : '',
      dateAdded:
        editUser.dateAdded ||
        new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setEditUser(null);
    setShowForm(false);
  };

  // Delete user
  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // Search filter (memoized to reduce re-renders during typing)
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u &&
        (
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.role?.toLowerCase().includes(term) ||
          (u.department && u.department.toLowerCase().includes(term)) ||
          (u.studentId && u.studentId.toLowerCase().includes(term)) ||
          (u.adminRole && u.adminRole.toLowerCase().includes(term))
        )
    );
  }, [users, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow container mx-auto px-4 py-28">
        <h2 className="page-title text-4xl sm:text-5xl lg:text-6xl font-bold text-center bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent mb-10 leading-normal pb-3">
          User Management
        </h2>

        {/* Search + Add Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditUser(null);
              setSelectedRole('Student');
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition-all w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> Add User
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-w-6xl mx-auto">
          {!hydrated ? (
            <div className="text-center py-12 text-gray-400 text-lg">Loading…</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-lg">No users found</div>
          ) : (
            <table className="w-full border-collapse bg-white rounded-xl shadow-md">
              <thead className="bg-gradient-to-r from-indigo-200 via-purple-100 to-purple-300">
                <tr>
                  <th className="p-4 text-lg text-center">Name</th>
                  <th className="p-4 text-lg text-center">Email</th>
                  <th className="p-4 text-lg text-center">Role</th>
                  <th className="p-4 text-lg text-center w-1/4">Details</th>
                  <th className="p-4 text-lg text-center">Date</th>
                  <th className="p-4 text-lg text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`user-card border-b hover:bg-gray-50 ${
                      u.role === 'Admin'
                        ? 'bg-blue-50 text-blue-900 border-blue-100 hover:bg-blue-100'
                        : 'bg-white'
                    }`}
                  >
                    <td className="p-4 text-center">{u.name}</td>
                    <td className="p-4 text-center">{u.email}</td>
                    <td className="p-4 text-center">{u.role}</td>
                    <td className="p-4 text-center">
                      {u.role === 'Student'
                        ? `${u.department || ''}, ID: ${u.studentId || ''}`
                        : u.adminRole || ''}
                    </td>
                    <td className="p-4 text-center">
                      {u.dateAdded ||
                        (u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
                          : '—')}
                    </td>
                    <td className="p-4 flex gap-3 justify-center">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mt-10"
          >
            <h3 className="text-xl font-bold mb-6 text-indigo-700">
              {editUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={editUser ? handleSaveUser : handleAddUser} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                defaultValue={editUser?.name}
                required
                className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                defaultValue={editUser?.email}
                required
                className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500"
              />

              <select
                name="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                required
                className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="Student">Student</option>
                <option value="Admin">Admin</option>
              </select>

              {selectedRole === 'Student' && (
                <>
                  <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    defaultValue={editUser?.department}
                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    name="studentId"
                    placeholder="Student ID"
                    defaultValue={editUser?.studentId}
                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500"
                  />
                </>
              )}

              {selectedRole === 'Admin' && (
                <input
                  type="text"
                  name="adminRole"
                  placeholder="Admin Role (e.g., Hostel Manager)"
                  defaultValue={editUser?.adminRole}
                  className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500"
                />
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
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

      <Footer />
    </div>
  );
};

export default UserManagement;

