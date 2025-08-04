import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import SubmitQuery from './pages/SubmitQuery';
import { QueryProvider } from "./context/QueryContext";
import QueryDetail from './pages/QueryDetail';
import NotFound from './pages/NotFound';


function App() {
  return (
    <>
      <QueryProvider>
        <BrowserRouter>
        <Navbar/>
        
          <Routes>
            <Route path="/" element={<LandingPage />}employing />
            <Route path="/student-login" element={<Login />} />
            <Route path="/admin-login" element={<Login />} />
            <Route path="/student-dashboard" element={<Dashboard />} /> 
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/student-dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/submit-query" element={<SubmitQuery />} />
            <Route path="/query/:id" element={<QueryDetail />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        
          {/* <Footer /> */}
        </BrowserRouter>
      </QueryProvider>
    </>
  );
}

export default App;