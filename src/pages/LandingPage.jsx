import { useLayoutEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { Link } from 'react-router-dom';
import Footer from '../Components/Footer';


import { School, FileText, Users, Bell, Menu, User, X, Facebook, Twitter, Instagram, Home } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);



    gsap.fromTo(
      '.hero-text',
      { y: 30, opacity: 0, scale: 0.8 },
      { duration: 1.5, y: 0, opacity: 1, scale: 1, ease: 'elastic.out(1, 0.3)', clearProps: 'all' }
    );
    gsap.fromTo(
      '.hero-buttons',
      { y: 30, opacity: 0, scale: 0.8 },
      { duration: 1.5, y: 0, opacity: 1, scale: 1, delay: 0.2, ease: 'elastic.out(1, 0.3)', clearProps: 'all' }
    );
    gsap.fromTo(
      '.hero-animation',
      { y: 30, opacity: 0, scale: 0.8 },
      { duration: 1.5, y: 0, opacity: 1, scale: 1, delay: 0.4, ease: 'elastic.out(1, 0.3)', clearProps: 'all' }
    );

    // // Floating Icon Animation (Gentle pop and rotate)
    // gsap.fromTo(
    //   '.floating-icon',
    //   { y: 20, opacity: 0, scale: 0.7 },
    //   { duration: 1.5, y: 0, opacity: 1, scale: 1, ease: 'elastic.out(1, 0.3)', clearProps: 'all' }
    // );
    // gsap.to('.floating-icon', {
    //   y: 10,
    //   rotation: 360,
    //   repeat: -1,
    //   yoyo: true,
    //   duration: 3,
    //   ease: 'power2.inOut',
    //   willChange: 'transform',
    // });

    // Features Animation (Pop-up with scale and slide)
    gsap.utils.toArray('.feature-card').forEach((card, index) => {
      // console.log(`Triggering animation for ${card.textContent.trim()}`);
      gsap.fromTo(
        card,
        { y: 30, opacity: 0, scale: 0.8, boxShadow: '0 0 0 rgba(99, 102, 241, 0)' },
        {
          duration: 1.5,
          y: 0,
          opacity: 1,
          scale: 1,
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
          delay: index * 0.3,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            scrub: true,
            toggleActions: 'play none none reset',
          },
          ease: 'elastic.out(1, 0.3)',
          clearProps: 'all',
        }
      );
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)', duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { boxShadow: '0 0 0 rgba(99, 102, 241, 0)', duration: 0.3, ease: 'power2.out' });
      });
    });

    // How It Works Animation (Pop-up with scale and slide)
    gsap.utils.toArray('.step-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 30, opacity: 0, scale: 0.8 },
        {
          duration: 1.5,
          y: 0,
          opacity: 1,
          scale: 1,
          delay: index * 0.3,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            scrub: true,
            toggleActions: 'play none none reset',
          },
          ease: 'elastic.out(1, 0.3)',
          clearProps: 'all',
        }
      );
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)', duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { boxShadow: '0 0 0 rgba(236, 72, 153, 0)', duration: 0.3, ease: 'power2.out' });
      });
    });

    // Testimonials Animation (Pop-up with scale and enhanced hover)
    gsap.utils.toArray('.testimonial-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 30, opacity: 0, scale: 0.8 },
        {
          duration: 1.5,
          y: 0,
          opacity: 1,
          scale: 1,
          delay: index * 0.3,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            scrub: true,
            toggleActions: 'play none none reset',
          },
          ease: 'elastic.out(1, 0.3)',
          clearProps: 'all',
        }
      );
      gsap.to(card, { scale: 1.1, duration: 0.5, paused: true, ease: 'power2.inOut' });
      card.animation = gsap.to(card, { scale: 1.1, duration: 0.5, paused: true, ease: 'power2.inOut' });
      card.addEventListener('mouseenter', () => {
        card.animation.play();
        gsap.to(card, { boxShadow: '0 0 30px rgba(59, 130, 246, 0.7)', duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        card.animation.reverse();
        gsap.to(card, { boxShadow: '0 0 0 rgba(59, 130, 246, 0)', duration: 0.3, ease: 'power2.out' });
      });
    });

    // Button Hover Effects
    gsap.utils.toArray('.hero-buttons button').forEach(button => {
      gsap.to(button, { scale: 1.05, duration: 0.5, paused: true, ease: 'power2.inOut' });
      button.animation = gsap.to(button, { scale: 1.05, duration: 0.5, paused: true, ease: 'power2.inOut' });
      button.addEventListener('mouseenter', () => button.animation.play());
      button.addEventListener('mouseleave', () => button.animation.reverse());
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf('.hero-text, .hero-buttons, .hero-animation, .feature-card, .step-card, .testimonial-card, .hero-buttons button, .floating-icon');
    };
  }, []);

  const features = [
    {
      title: 'Submit Issues in a Snap!',
      desc: 'Submit issues for hostel, mess, network, or library in a few clicks.',
      icon: <FileText className="w-12 h-12 mx-auto text-indigo-600" />,
    },
    {
      title: 'Track Status',
      desc: 'Check real-time updates on your queries.',
      icon: <Bell className="w-12 h-12 mx-auto text-indigo-600" />,
    },
    {
      title: 'Admin Support',
      desc: 'Quick responses from campus admins.',
      icon: <Users className="w-12 h-12 mx-auto text-indigo-600" />,
    },
    {
      title: 'User-Friendly UI',
      desc: 'Enjoy a clean and intuitive interface.',
      icon: <Home className="w-12 h-12 mx-auto text-indigo-600" />,
    },
  ];

  const steps = [
    {
      step: '1. Login',
      desc: 'Login as a student or admin.',
      icon: <Users className="w-12 h-12 mx-auto text-pink-600" />,
    },
    {
      step: '2. Raise Query',
      desc: 'Submit your issue with category and details.',
      icon: <FileText className="w-12 h-12 mx-auto text-pink-600" />,
    },
    {
      step: '3. Track/Resolve',
      desc: 'Track status or resolve queries (for admins).',
      icon: <Bell className="w-12 h-12 mx-auto text-pink-600" />,
    },
    {
      step: '4. Get Notified',
      desc: 'Receive updates when issues are fixed!',
      icon: <Bell className="w-12 h-12 mx-auto text-pink-600" />,
    },
  ];

  const testimonials = [
    { quote: 'Isse hostel issues jaldi solve ho gaye!', author: 'Rahul, Student' },
    { quote: 'Admin dashboard makes query management super easy!', author: 'Priya, Admin' },
    { quote: 'UI is so clean and user-friendly!', author: 'Ankit, Student' },
  ];

  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-purple-100 via-blue-50 to-white relative overflow-x-hidden">
 
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 -right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      

   
      <section className="pt-28 pb-16 flex flex-col md:flex-row items-center justify-between container mx-auto px-20">
        <div className="hero-text md:w-1/2 text-center md:text-left">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text font-poppins">
            Empower Your Campus Life, Instantly!
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            Tackle hostel, mess, network, and library issues effortlessly—get swift solutions from admins!
          </p>
          <div className="hero-buttons mt-6 flex justify-center md:justify-start gap-4">
            
          <Link to="/student-login">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold shadow-md"
              >
                Student Login
              </button>
          </Link>
            
            <Link to="/admin-login">
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-md"
              >
                Admin Login
              </button>
            </Link>
          </div>
        </div>
        <div className="hero-animation md:w-1/2 mt-10 md:mt-0">
          <Player
            autoplay
            loop
            src="/assets/animations/formsubmission.json"
            style={{ height: '320px', width: '320px' }}
          />
        </div>
      </section>

      
      {/* <div
        className="floating-icon absolute top-20 px-16 left-5 hidden md:block"
        style={{ willChange: 'transform' }}
      >
        <Home className="w-10 h-10 text-indigo-500" />
      </div> */}

      {/* Features */}
      <section className="py-16 bg-gradient-to-br from-white to-purple-50">
        <div className="container mx-auto px-20">
          <h3 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose Us?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition duration-300"
                style={{ willChange: 'transform, opacity, boxShadow' }}
              >
                {feature.icon}
                <h4 className="text-xl font-semibold mt-4">{feature.title}</h4>
                <p className="text-gray-600 mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-white">
        <div className="container mx-auto px-20">
          <h3 className="text-4xl font-bold text-center text-gray-800 mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="step-card bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition duration-300"
                style={{ willChange: 'transform, opacity, boxShadow' }}
              >
                {step.icon}
                <h4 className="text-xl font-semibold mt-4">{step.step}</h4>
                <p className="text-gray-600 mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-20">
          <h3 className="text-4xl font-bold text-center text-gray-800 mb-12">What Our Users Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card bg-white p-8 rounded-2xl shadow-xl text-center transition duration-100"
                style={{ willChange: 'transform, opacity, boxShadow' }}
              >
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <p className="text-gray-900 font-medium mt-4">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      
    </div>
  );
};

export default LandingPage;