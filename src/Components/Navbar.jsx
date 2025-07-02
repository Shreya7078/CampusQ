import React, { useState, useEffect } from 'react';
import { School, FileText, Users, Bell, Menu, User, X, Facebook, Twitter, Instagram, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar({ onSidebarToggle }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
      // Update authentication state on every location change or localStorage change
      const handleAuthChange = () => {
        setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
      };
      handleAuthChange(); // Initial check
      window.addEventListener('storage', handleAuthChange); // Listen for storage changes
      return () => window.removeEventListener('storage', handleAuthChange);
    }, [location]);

    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      setIsAuthenticated(false); // Ensure state updates immediately
      setIsDropdownOpen(false); // Close dropdown on logout
      navigate('/'); // Redirect to home page
    };

    const handleLoginClick = (role) => {
      navigate(`/${role === 'admin' ? 'admin-login' : 'student-login'}`, { state: { role } });
      setIsDropdownOpen(false); // Close dropdown after selection
    };

    const handleHomeClick = () => {
      if (isAuthenticated) {
        onSidebarToggle(); // Open sidebar if authenticated
      } else {
        setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown if not authenticated
      }
    };

    return (
      <>
        {/* Navbar */}
        <nav className="bg-gradient-to-r from-indigo-900 to-purple-600 p-4 flex justify-between items-center fixed w-full top-0 z-10 shadow-lg">
          <div className="flex items-center px-8">
            <School className="text-white w-8 h-8 mr-2" />
            <h1 className="text-white text-2xl font-poppins font-bold">CampusQ</h1>
          </div>
          <div className="hidden md:flex space-x-6 text-md">
            <Link to="/" className={`text-white hover:text-indigo-200 relative group ${location.pathname === '/' ? 'border-b-2 border-white' : ''}`}>
              Home
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-200 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/dashboard" className={`text-white hover:text-indigo-200 relative group ${location.pathname === '/dashboard' ? 'border-b-2 border-white' : ''}`}>
              Dashboard
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-200 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/support" className={`text-white hover:text-indigo-200 relative group ${location.pathname === '/support' ? 'border-b-2 border-white' : ''}`}>
              Support
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-200 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/announcements" className={`text-white hover:text-indigo-200 relative group ${location.pathname === '/announcements' ? 'border-b-2 border-white' : ''}`}>
              Announcements
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-200 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/profile" className={`text-white hover:text-indigo-200 relative group ${location.pathname === '/profile' ? 'border-b-2 border-white' : ''}`}>
              Profile
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-200 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none mr-2">
                {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </button>
            </div>
            <div className="md:hidden relative">
              <button
                id="sidebar-toggle"
                onClick={handleHomeClick} // Updated to handleHomeClick
                className="text-white focus:outline-none"
                aria-label="Toggle sidebar"
              >
                <Home size={24} />
              </button>
              {isDropdownOpen && !isAuthenticated && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-indigo-700 rounded-md shadow-lg">
                  <button
                    onClick={() => handleLoginClick('student')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Login as Student
                  </button>
                  <hr className="border-t border-gray-300" />
                  <button
                    onClick={() => handleLoginClick('admin')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Login as Admin
                  </button>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center">
              <div className="relative px-8">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-white w-8 h-8 cursor-pointer focus:outline-none"
                >
                  <User className="w-8 h-8" />
                </button>
                {isDropdownOpen && !isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-indigo-700 rounded-md shadow-lg">
                    <button
                      onClick={() => handleLoginClick('student')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Login as Student
                    </button>
                    <hr className="border-t border-gray-300" />
                    <button
                      onClick={() => handleLoginClick('admin')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Login as Admin
                    </button>
                  </div>
                )}
                {isDropdownOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-32 bg-white text-indigo-700 rounded-md shadow-lg">
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-indigo-900 to-purple-600 text-white p-4 absolute w-full mt-12 z-20">
            <Link to="/" className={`block py-2 ${location.pathname === '/' ? 'border-b-2 border-white' : 'hover:bg-indigo-600'}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/dashboard" className={`block py-2 ${location.pathname === '/dashboard' ? 'border-b-2 border-white' : 'hover:bg-indigo-600'}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            <Link to="/support" className={`block py-2 ${location.pathname === '/support' ? 'border-b-2 border-white' : 'hover:bg-indigo-600'}`} onClick={() => setIsMenuOpen(false)}>Support</Link>
            <Link to="/announcements" className={`block py-2 ${location.pathname === '/announcements' ? 'border-b-2 border-white' : 'hover:bg-indigo-600'}`} onClick={() => setIsMenuOpen(false)}>Announcements</Link>
            <Link to="/profile" className={`block py-2 ${location.pathname === '/profile' ? 'border-b-2 border-white' : 'hover:bg-indigo-600'}`} onClick={() => setIsMenuOpen(false)}>Profile</Link>
          </div>
        )}
      </>
    );
}

export default Navbar;