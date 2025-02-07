import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6">
        {/* Newsletter Section */}
        <div className="mb-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Stay up to date with our latest products, deals, and updates delivered straight to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 text-gray-900 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors sm:w-auto w-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* About Section */}
          <div className="space-y-6">
            <Link href="/about" className="inline-block">
              <h3 className="text-xl font-bold hover:text-blue-500 transition-colors">About Us</h3>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Your trusted destination for quality products. We provide the best shopping experience for our customers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <FaLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Special Deals
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Customer Service</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span>+1 234 567 890</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>support@store.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>123 Store Street, City, Country</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-white">STORE</span>
              <p className="text-gray-400">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-blue-500 transition-colors">Terms of Service</Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-blue-500 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
