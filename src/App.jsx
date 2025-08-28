import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import SubmitQuery from './pages/SubmitQuery';
import { QueryProvider } from './context/QueryContext';
import QueryDetail from './pages/QueryDetail';
import NotFound from './pages/NotFound';
import ContactPage from './pages/ContactPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import Profile from './pages/ProfilePage';
import ManageQueries from './pages/ManageQueries';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  return (
    <>
      <QueryProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/student-login" element={<Login />} />
            <Route path="/admin-login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/student-dashboard"
              element={isAuthenticated && userRole === 'student' ? <Dashboard /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/admin-dashboard"
              element={isAuthenticated && userRole === 'admin' ? <Dashboard /> : <Navigate to="/dashboard" replace />}
            />
            <Route path="/support" element={<ContactPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/submit-query" element={<SubmitQuery />} />
            <Route path="/query/:id" element={<QueryDetail />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/announcements" element={<AnnouncementsPage/>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/manage-queries" element={<ManageQueries />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/reports" element={<Reports />}/>
            <Route path="/notifications-page" element={<NotificationsPage />}/>
          </Routes>
          {/* <Footer /> */}
        </BrowserRouter>
      </QueryProvider>
    </>
  );
}

export default App;