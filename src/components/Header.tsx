import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types/auth';
import { MdAccountCircle } from "react-icons/md";

interface NavItem {
  label: string;
  href: string;
  path?: string;
}

interface HeaderProps {
  logoSrc: string;
  logoAlt: string;
  logoText: string;
  navItems: NavItem[];
  signInLink: string;
  getStartedLink: string;
  currentUser: User | null;
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({
  logoSrc,
  logoAlt,
  logoText,
  navItems,
  signInLink,
  getStartedLink,
  currentUser,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="md:py-5">
      {/* Mobile Sidebar */}
      <div 
        className={`sidebar fixed left-[50%] transform -translate-x-[50%] h-auto bg-gray-800 text-white p-5 flex-col gap-5 z-10 top-[120px] rounded-2xl transition-all duration-300 ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
        style={{ width: '350px' }}
      >
        <div className="flex flex-col justify-center items-center">
          {/* Sidebar Close Button */}
          <button className="font-bold ml-auto" onClick={toggleMenu}>
            <i className='bx bx-x bx-lg'></i>
          </button>

          {/* Sidebar Links */}
          <ul className="flex flex-col text-2xl">
            {navItems.map((item) => (
              <li key={item.href} className="mb-4">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `hover:text-blue-500 ${isActive ? 'text-blue-500' : ''}`
                  }
                  onClick={toggleMenu}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Auth Section */}
          <div className="flex gap-5 mt-auto items-center">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-lg hover:text-blue-500" onClick={toggleMenu}>
                  {currentUser.username}
                </Link>
                <button
                  onClick={() => {
                    onLogout();
                    toggleMenu();
                  }}
                  className="px-5 py-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to={signInLink} className="text-lg hover:text-blue-500" onClick={toggleMenu}>
                  Sign In
                </Link>
                <Link
                  to={getStartedLink}
                  className="px-5 py-3 bg-[#060640] rounded-full text-white hover:bg-blue-700 transition-colors"
                  onClick={toggleMenu}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col sm:flex-row gap-8 py-4 px-8 bg-[#fff] items-center w-full sm:w-[60%] h-auto mx-auto rounded-b-3xl lg:rounded-full fixed top-0 md:relative z-10 shadow-lg">
        <div className="flex justify-between items-center w-full">
          {/* Logo */}
          <div className="navlogo">
            <Link to="/" className="flex items-center font-bold text-2xl">
              <img
                src={logoSrc}
                alt={logoAlt}
                className="w-[60px] h-auto filter brightness-0 invert-[0] sepia saturate-[1000%] hue-rotate-[240deg] logoImg"
              />
              <h1 className="logo-text font-montserrat">{logoText}</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden sm:flex justify-between gap-5 text-md">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `relative pb-1 nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex gap-5 items-center text-md">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-500 text-xl transition-colors flex items-center">
                <MdAccountCircle className='mr-1' />{currentUser.username}
                </Link>
                <button
                  onClick={onLogout}
                  className="px-5 py-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to={signInLink} className="hover:text-blue-500 transition-colors">
                  Sign In
                </Link>
                <Link
                  to={getStartedLink}
                  className="px-5 py-3 bg-[#060640] rounded-full text-white hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="hamburger sm:hidden" onClick={toggleMenu}>
            <i className='bx bx-menu bx-lg'></i>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;