import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import Footer from '../Components/Footer';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setShowToast(true);
    setToastMessage('Message sent successfully!');
    setTimeout(() => setShowToast(false), 3000);
    setName('');
    setEmail('');
    setMessage('');
  };

  const handleContactClick = (contact, type) => {
    navigator.clipboard.writeText(contact).then(() => {
      setShowToast(true);
      setToastMessage(`${type} copied to clipboard!`);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  useEffect(() => {
    if (showToast && toastRef.current) {
      gsap.fromTo(toastRef.current, { x: '100%', opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(toastRef.current, { opacity: 0, x: '100%', duration: 0.5, delay: 2.5, ease: 'power2.in', onComplete: () => setShowToast(false) });
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 font-sans text-gray-800 relative">

      {showToast && (
        <div
          ref={toastRef}
          className="fixed top-4 right-4 bg-gradient-to-r from-indigo-200 to-purple-400 text-gray-800 px-4 py-4 rounded-md shadow-lg z-50 flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

     
      <header className="pt-32 md:pt-36 pb-16 md:pb-20 text-center relative bg-gradient-to-br from-purple-200 via-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-6xl font-bold animate-fadeIn bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent tracking-wide bg-clip-text">
            <span className="px-6 py-3 rounded-lg">Connect With Us</span>
          </h1>
          <p className="text-lg font-poppins md:text-xl text-gray-700 mt-2 md:mt-3 animate-slideUp leading-relaxed">
            Let’s Overcome Your Challenges Together!
          </p>
        </div>
      </header>

      
      <main className="px-4  md:px-8 max-w-5xl mx-auto py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
         
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-2xl hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-indigo-800 mb-6">Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none focus:border-transparent text-base placeholder-gray-400"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none focus:border-transparent text-base placeholder-gray-400"
                required
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your Message"
                className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:outline-none text-base placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-colors duration-300 text-base font-medium shadow-md"
              >
                Send Message
              </button>
            </form>
          </div>

         
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-5">Contact Details</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Mail className="w-6 h-6 text-teal-500 mr-4" />
                  <span onClick={() => handleContactClick('contact@campusq.com', 'Email')} className="text-lg text-indigo-700 hover:text-teal-500 cursor-pointer transition-colors">contact@campusq.com</span>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Phone className="w-6 h-6 text-teal-500 mr-4" />
                  <span onClick={() => handleContactClick('+91-123-456-7890', 'Phone')} className="text-lg text-indigo-700 hover:text-teal-500 cursor-pointer transition-colors">+91-123-456-7890</span>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  <MapPin className="w-6 h-6 text-teal-500 mr-4" />
                  <span className="text-lg text-indigo-700">123 Tech Street, Mumbai, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;