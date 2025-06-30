import React from 'react'
import { Facebook, Twitter, Instagram } from 'lucide-react'

function Footer() {
  return (
    <>
        <footer className="bg-gradient-to-r from-indigo-800 to-purple-700 text-white py-2 sm:py-4">
            <div className="container mx-auto px-4 sm:px-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6">
                    <div className="w-full md:w-auto">
                        <h4 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Contact Us</h4>
                        <p className="text-xs sm:text-sm">Email: support@campusq.com</p>
                        <p className="text-xs sm:text-sm">Phone: +91-123-456-7890</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <h4 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Follow Us</h4>
                        <div className="flex flex-col justify-center items-start md:justify-center gap-1 sm:gap-1.5">
                            <a href="#" className="hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">Facebook <Facebook className='w-4 sm:w-5 h-4 sm:h-5' /></a>
                            <a href="#" className="hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">Twitter <Twitter className='w-4 sm:w-5 h-4 sm:h-5' /></a>
                            <a href="#" className="hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">Instagram <Instagram className='w-4 sm:w-5 h-4 sm:h-5' /></a>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <h4 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Quick Links</h4>
                        <div className="flex flex-col gap-1">
                            <a href="#" className="hover:underline text-xs sm:text-sm">About Us</a>
                            <a href="#" className="hover:underline text-xs sm:text-sm">Privacy Policy</a>
                            <a href="#" className="hover:underline text-xs sm:text-sm">Terms</a>
                        </div>
                    </div>
                    <div className="w-full md:w-auto text-center md:text-right">
                        <p className="text-base sm:text-lg font-poppins">CampusQ © 2025</p>
                    </div>
                </div>
            </div>
        </footer>
    </>
  )
}

export default Footer