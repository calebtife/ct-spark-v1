import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  logoSrc: string;
  logoAlt: string;
  logoText: string;
  navItems: NavItem[];
  signInLink: string;
  getStartedLink: string;
}

const Header: React.FC<HeaderProps> = ({
  logoSrc,
  logoAlt,
  logoText,
  navItems,
  signInLink,
  getStartedLink,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="py-4 md:py-5 bg-white shadow-lg fixed top-0 left-0 right-0 z-20">
      <nav className="container mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src={logoSrc} 
            alt={logoAlt} 
            className="w-12 h-auto filter brightness-0 sepia saturate-[1000%] hue-rotate-[240deg]"
          />
          <span className="text-2xl font-bold font-montserrat">{logoText}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-6">
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `text-gray-500 hover:text-blue-500 transition-colors duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500 after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100 ${
                      isActive ? 'text-blue-500 after:scale-x-100' : ''
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-4">
            <Link to={signInLink} className="text-gray-600 hover:text-blue-500 transition-colors">
              Sign In
            </Link>
            <Link
              to={getStartedLink}
              className="px-5 py-2 bg-[#060640] text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="sm:hidden text-3xl text-gray-600 hover:text-blue-500 transition-colors"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`sm:hidden fixed top-16 left-0 right-0 bg-gray-800 text-white p-6 transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <ul className="flex flex-col space-y-4 text-xl">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `block py-2 hover:text-blue-500 transition-colors ${isActive ? 'text-blue-500' : ''}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex flex-col space-y-4 mt-6">
          <Link 
            to={signInLink} 
            className="text-lg hover:text-blue-500 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to={getStartedLink}
            className="px-5 py-3 bg-[#060640] rounded-full text-white hover:bg-blue-700 transition-colors text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;