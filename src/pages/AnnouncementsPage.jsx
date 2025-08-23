import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../Components/Footer';

const AnnouncementsPage = () => {
  const [announcements] = useState([
    { id: 1, title: 'New Hostel Rules', date: 'Aug 10, 2025', content: 'New curfew timings effective from tomorrow. All students must adhere to the updated schedule: 10 PM to 6 AM. Additional security measures will be in place.', fullContent: 'New curfew timings effective from tomorrow. All students must adhere to the updated schedule: 10 PM to 6 AM. Additional security measures will be in place, including night patrols. Please contact the warden for further details.' },
    { id: 2, title: 'Library Extension', date: 'Aug 09, 2025', content: 'Library hours extended till 10 PM.', fullContent: 'Library hours extended till 10 PM starting this week. This change aims to support students with late-night study needs. Quiet zones will be enforced, and access requires a valid ID.' },
    { id: 3, title: 'Network Upgrade', date: 'Aug 08, 2025', content: 'Wi-Fi upgrade scheduled this weekend.', fullContent: 'Wi-Fi upgrade scheduled this weekend from 8 AM to 6 PM on Saturday. Expect temporary disruptions. The new system will offer improved speed and security. Updates will be posted on the portal.' },
  ]);

  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpand = (id) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((eid) => eid !== id)); // remove if already expanded
    } else {
      setExpandedIds([...expandedIds, id]); // add to expanded list
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      '.hero-text',
      { y: 30, opacity: 0, scale: 0.8 },
      {
        duration: 1.2,
        y: 0,
        opacity: 1,
        scale: 1,
        ease: 'elastic.out(1, 0.3)',
        scrollTrigger: {
          trigger: '.hero-text',
          start: 'top 85%',
          once: true // animate only once, won't reset
        },
        clearProps: 'transform' // remove transform props later but keep opacity
      }
    );
    
    gsap.fromTo(
      ".announcement-card",
      {
        opacity: 0.2,   // thoda visible from start
        y: 40,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".announcements-container", // parent container
          start: "top 85%",
          toggleActions: "play none none none",
        },
        clearProps: "transform"
      }
    );
    
    
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf('.hero-text, .announcement-card');
    };
  }, []);

  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-purple-100 via-blue-50 to-white relative overflow-x-hidden">
      <section className="pt-36 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="hero-text text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            Announcements
          </h1>
          <p className="hero-text text-lg text-gray-700 mt-2 md:mt-3">
            Stay updated with the latest campus news and updates.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-white to-purple-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => {
              const isExpanded = expandedIds.includes(announcement.id);
              return (
                <div
                  key={announcement.id}
                  className="announcement-card bg-white p-6 rounded-xl shadow-2xl hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <Bell className="w-6 h-6 text-indigo-600 mr-2" />
                    <h3 className="text-xl font-semibold text-black">{announcement.title}</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{announcement.date}</p>
                  <p className="text-gray-800">
                    {isExpanded ? announcement.fullContent : `${announcement.content}...`}
                  </p>
                  <button
                    onClick={() => toggleExpand(announcement.id)}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {isExpanded ? 'Show Less' : 'Read More'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnnouncementsPage;
