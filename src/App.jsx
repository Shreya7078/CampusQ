import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import Dashboard from './Components/Dashboard';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Login from './pages/Login';
import SignUp from './pages/Signup';


function App() {
  return (
    <>
      
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

        </Routes>
        {/* <Footer /> */}
      </BrowserRouter>
    </>
  );
}

export default App;