import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, FileText, User, Menu, X, BarChart2, Activity, AlertTriangle, Users, Settings } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { gsap } from 'gsap';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [role, setRole] = useState('student'); // Default, will be updated from location state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to control sidebar visibility
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Set role based on location state on mount
  useEffect(() => {
    const initialRole = location.state?.role || (location.pathname === '/admin-dashboard' ? 'admin' : 'student');
    setRole(initialRole);
    console.log('Dashboard location state:', location.state); // Debug full state
    console.log('Dashboard role from state or path:', initialRole); // Debug role
  }, [location.state, location.pathname]);

  // Handle sidebar toggle and media query for desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(true); // Always open on desktop
      } else {
        // Mobile view, controlled by state
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Animation context for cleanup
    const ctx = gsap.context(() => {
      // Sidebar Animation (Slide in from left)
      gsap.from(sidebarRef.current, {
        duration: 1,
        x: isSidebarOpen ? 0 : -200,
        opacity: isSidebarOpen ? 1 : 0,
        ease: 'power2.out',
      });

      // Content Cards Animation
      gsap.from(contentRef.current?.children, {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out',
      });
    });

    return () => ctx.revert(); // Cleanup GSAP animations
  }, [isSidebarOpen]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-100 font-inter text-gray-800 relative">
      {/* Navbar */}
      <Navbar onSidebarToggle={handleSidebarToggle} />

      {/* Sidebar (Toggleable in mobile, always visible in desktop) */}
      <div
        ref={sidebarRef}
        className={`fixed z-40 w-64 bg-gradient-to-b from-indigo-800 to-purple-500 text-white rounded-md transition-all duration-300 ${isSidebarOpen ? 'left-0' : '-left-full'} md:left-0`}
        style={{ top: '5rem', height: 'calc(100vh - 100px)' }}
      >
        <div className="h-full p-4 flex flex-col justify-between items-center">
          <div className="w-full mt-8">
            {/* Close Button for Mobile */}
            <button
              onClick={handleSidebarToggle}
              className="md:hidden text-white absolute top-4 right-4 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
            {/* Avatar Section (Static) */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                <User className="w-12 h-12 text-indigo-800" />
              </div>
              <p className="text-md font-medium mt-2">{role === 'admin' ? 'Admin' : 'Shreya'}</p>
            </div>
            <nav className="space-y-2 w-full">
              {role === 'student' ? (
                <>
                  <Link
                    to="/student-dashboard"
                    onClick={(e) => {
                      if (location.pathname === '/student-dashboard') {
                        e.preventDefault(); // Prevent navigation if already on dashboard
                      }
                    }}
                    className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"
                  >
                    <Activity className="w-5 h-5 mr-2" /> Dashboard
                  </Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/submit-query" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><FileText className="w-5 h-5 mr-2" /> Submit Query</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/announcements" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><Bell className="w-5 h-5 mr-2" /> Announcements</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/support" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Support</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/profile" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><User className="w-5 h-5 mr-2" /> Profile</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/settings" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><Settings className="w-5 h-5 mr-2" /> Settings</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/logout" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><User className="w-5 h-5 mr-2" /> Logout</Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin-dashboard"
                    onClick={(e) => {
                      if (location.pathname === '/admin-dashboard') {
                        e.preventDefault(); // Prevent navigation if already on dashboard
                      }
                    }}
                    className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"
                  >
                    <Activity className="w-5 h-5 mr-2" /> Dashboard
                  </Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/manage-queries" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Manage Queries</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/user-management" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><Users className="w-5 h-5 mr-2" /> User Management</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/reports" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><BarChart2 className="w-5 h-5 mr-2" /> Reports</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/settings" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><Settings className="w-5 h-5 mr-2" /> Settings</Link>
                  <hr className="border-t border-gray-500 my-1" />
                  <Link to="/logout" className="block py-2 px-4 text-lg hover:bg-indigo-600 rounded flex items-center"><User className="w-5 h-5 mr-2" /> Logout</Link>
                </>
              )}
            </nav>
          </div>
          <div className="text-sm text-gray-200 text-center py-4 mt-4">v1.0 © 2025 CampusQ</div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className={`p-6 pt-28 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
        <div className="max-w-6xl ml-8">
          {role === 'student' ? <StudentDashboard /> : <AdminDashboard />}
        </div>
      </div>

      {/* Footer commented out as per your code */}
      {/* <Footer /> */}
    </div>
  );
};

export default Dashboard;