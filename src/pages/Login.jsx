import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Mail, Lock, ArrowRight, X } from 'lucide-react';
import Footer from '../Components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 
  const location = useLocation();

  // Determine role based on URL path
  const role = location.pathname === '/admin-login' ? 'admin' : 'student';

  // Determine welcome message based on role
  const welcomeMessage = role === 'admin' ? 'Welcome, Admin!' : 'Welcome, Student!';

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, role });

    // Hardcoded validation with updated student email
    const isValid = 
      (email === 'student1@example.com' && password === 'password123' && role === 'student') ||
      (email === 'admin@example.com' && password === 'admin123' && role === 'admin');

    if (isValid) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role || 'student');
      const redirectPath = role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
      navigate(redirectPath);
      console.log('Redirecting to:', redirectPath); // Debug log
    } else {
      const validUsers = role === 'admin' 
        ? [{ email: 'admin@example.com', password: 'admin123' }]
        : [{ email: 'student1@example.com', password: 'password123' }];
      setMessage(`Invalid credentials!\nValid ${role} users:\nEmail: ${validUsers[0].email}\nPassword:  ${validUsers[0].password}`);
      setShowMessageBox(true);
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup', { state: { role } }); // Ensure role is passed
  };

  return (
    <>
      <div className="h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-14 sm:mb-4 sm:m-5">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <School className="text-indigo-600 w-10 sm:w-12 h-10 sm:h-12 mr-1 sm:mr-2" />
              <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-indigo-800">CampusQ</h1>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-center text-purple-700 mb-4 sm:mb-6">{welcomeMessage}</h2>
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} sm={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} sm={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <a href="#" className="text-indigo-600 hover:text-indigo-800 hover:underline">Forgot Password?</a>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-1 sm:space-x-2 transition duration-300 text-md"
              >
                <span>Login</span>
                <ArrowRight size={16} sm={18} />
              </button>
            </form>
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-600 text-sm sm:text-sm">Don't have an account? <span onClick={handleSignUpClick} className="text-indigo-700 text-md hover:text-indigo-800 hover:underline cursor-pointer underline">Sign Up</span></p>
            </div>
          </div>
        </div>
        <Footer className="h-8" /> {/* Maintained height at 32px */}
      </div>

      {/* Improved Message Box */}
      {showMessageBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/5 max-h-1/2 border border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-white text-center relative">
            <button
              onClick={() => setShowMessageBox(false)}
              className="absolute top-2 right-4 text-indigo-600 hover:text-indigo-800"
            >
              <X size={18} />
            </button>
            <p className="text-indigo-800 text-sm sm:text-md font-poppins whitespace-pre break-words p-2 overflow-auto">{message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;