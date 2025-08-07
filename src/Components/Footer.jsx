import React from 'react'
import { Facebook, Twitter, Instagram } from 'lucide-react'

function Footer() {
  return (
    <>
        <footer className="bg-gradient-to-r px-10 from-indigo-800 to-purple-700 text-white py-2 sm:py-4">
            <div className="container mx-auto px-4 sm:px-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6">
                    <div className="w-full md:w-auto">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 underline" >Contact Us</h4>
                        <p className="text-sm sm:text-sm">Email: support@campusq.com</p>
                        <p className="text-sm sm:text-sm">Phone: +91-123-456-7890</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 underline">Follow Us</h4>
                        <div className="flex flex-col justify-center items-start md:justify-center gap-1 sm:gap-1.5">
                            <a href="#" className="hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"><Facebook className='w-4 sm:w-5 h-4 sm:h-5' />Facebook </a>
                            <a href="#" className="hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"><Twitter className='w-4 sm:w-5 h-4 sm:h-5' />Twitter </a>
                            <a href="#" className="hover:text-indigo-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"><Instagram className='w-4 sm:w-5 h-4 sm:h-5' />Instagram </a>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 underline">Quick Links</h4>
                        <div className="flex flex-col gap-1">
                            <a href="#" className="hover:underline text-xs sm:text-sm">About Us</a>
                            <a href="#" className="hover:underline text-xs sm:text-sm">Privacy Policy</a>
                            <a href="#" className="hover:underline text-xs sm:text-sm">Terms</a>
                        </div>
                    </div>

                </div>
                <div className="w-full pt-10 justify-center flex md:w-auto md:text-right">
                    <p className="text-base sm:text-lg font-poppins">CampusQ © 2025</p>
                </div>
            </div>

        </footer>
    </>
  )
}

export default Footer