import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import ctLogo from '../assets/images/CT-logo.png';
import { FaRegCopyright } from "react-icons/fa";

interface SocialLink {
  to: string;
  icon: string;
  label: string;
}

interface QuickLink {
  to: string;
  text: string;
}

const socialLinks: SocialLink[] = [
  { to: '#', icon: 'bx bxl-facebook-circle', label: 'Facebook' },
  { to: 'https://www.instagram.com/ctspark', icon: 'bx bxl-instagram-alt', label: 'Instagram' },
  { to: '#', icon: 'bx bxl-twitter', label: 'Twitter' },
  { to: '#', icon: 'bx bxl-linkedin', label: 'LinkedIn' },
  { to: 'https://wa.me/2349028741416', icon: 'bx bxl-whatsapp', label: 'WhatsApp' },
];

const quickLinks: QuickLink[] = [
  { to: '/', text: 'Home' },
  { to: '/#about', text: 'About Us' },
  { to: '/#services', text: 'Our Services' },
  { to: '/login', text: 'Sign In' },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    console.log('Newsletter form submitted');
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Manifesto Section */}
          <div className="flex flex-col gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-2xl"
              aria-label="CT Spark Home"
            >
              <img
                src={ctLogo}
                alt="CT Spark Logo"
                className="w-14 h-auto filter dark:brightness-0 dark:invert"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              />
              CT SPARK
            </Link>
            <p className="text-sm leading-relaxed">
              Connecting Lives, Empowering Communities. CT Spark provides fast, reliable internet
              solutions to bridge the digital divide with tailored connectivity.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.to}
                  aria-label={link.label}
                  className="hover:text-blue-600 transition-colors"
                  target={link.to.startsWith('http') ? '_blank' : '_self'}
                  rel={link.to.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <i className={`${link.icon} text-2xl`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Links</h2>
            <ul className="flex flex-col gap-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.text}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `hover:underline decoration-dotted hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600 underline' : ''
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href="mailto:info@ct-spark.com"
                  className="hover:underline decoration-dotted hover:text-blue-600 transition-colors"
                >
                  info@ct-spark.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+2349028741416"
                  className="hover:underline decoration-dotted hover:text-blue-600 transition-colors"
                >
                  (+234) 902 874 1416
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Newsletter</h2>
            <p className="text-sm leading-relaxed">
              Subscribe to our newsletter for the latest news and updates.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                aria-label="Email Address"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-900 dark:bg-blue-700 text-white py-3 rounded-md hover:bg-blue-800 dark:hover:bg-blue-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-900 dark:bg-gray-800 text-white text-center py-4">
        <span className='flex items-center justify-center gap-2'>
          <FaRegCopyright />{currentYear}. All rights reserved. CT SPARK
        </span>
      </div>
    </footer>
  );
};

export default Footer;