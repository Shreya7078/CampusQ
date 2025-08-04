import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-8" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="bg-white/40 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full text-center transform transition-all duration-300 hover:shadow-indigo-400/50 mt-16">
        <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Page Not Found</h2>
        <p className="text-gray-800 mb-8">Oops! It seems the page you’re looking for doesn’t exist. Let’s get you back on track!</p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-pink-600 transition-all duration-300 font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;