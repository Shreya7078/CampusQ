import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Mail, Lock, User as UserIcon, Phone, ArrowRight } from 'lucide-react';
import Footer from '../Components/Footer';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [role, setRole] = useState('student'); 
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initialRole = location.state?.role || (location.pathname.includes('/admin-signup') ? 'admin' : 'student');
    setRole(initialRole);
    console.log('Initial role from state or path:', initialRole); 
  }, [location.state, location.pathname]);

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      setShowMessageBox(true);
      setTimeout(() => {
        setShowMessageBox(false);
      }, 5000); 
      return;
    }
    console.log('Sign-up attempt:', { role, fullName, email, password, studentId, department, year, phoneNumber, adminRole });
    setMessage('Sign-up successful! (Mock)');
    setShowMessageBox(true);
    setTimeout(() => {
      setShowMessageBox(false);
      const redirectPath = role === 'admin' ? '/admin-login' : '/student-login';
      navigate(redirectPath);
      console.log('Redirecting to:', redirectPath); 
    }, 2000); 
  };

  const handleloginClick = () => {
    
    const redirectPath = role === 'admin' ? '/admin-login' : '/student-login';
    navigate(redirectPath, { state: { role } }); 
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
      <div className="flex-1 flex items-center justify-center pt-24 pb-4 px-3 mb-3"> 
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-center mb-4">
            <School className="text-indigo-600 w-10 h-10 mr-2" />
            <h1 className="text-2xl font-poppins font-bold text-indigo-800">CampusQ</h1>
          </div>
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-8 pr-4 text-sm py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 text-sm pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>
            {role === 'student' ? (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Student ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-2 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your student ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-2 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your department"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full pl-2 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your year (e.g., 1st, 2nd)"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Admin Role</label>
                  <input
                    type="text"
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full pl-2 pr-4 py-2 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your admin role (e.g., Hostel Manager)"
                    required
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2 transition duration-300"
            >
              <span>Sign Up</span>
              <ArrowRight size={18} />
            </button>
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-700 text-sm sm:text-sm">Already have an account? <span onClick={handleloginClick} className="text-indigo-700 text-md hover:text-indigo-800 hover:underline underline cursor-pointer">Login</span></p>
            </div>
          </form>
        </div>
      </div>
      <Footer className="h-10" /> 
     
      {showMessageBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/5 max-h-1/2 border border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-white text-center">
            <p className="text-indigo-800 text-sm sm:text-md font-poppins whitespace-pre break-words p-2 overflow-auto">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;