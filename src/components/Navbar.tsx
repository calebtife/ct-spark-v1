import { Link } from 'react-router-dom';
import { useState } from 'react';
import ctLogo from '../assets/images/CT-logo.png';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header className="w-full md:py-5">
      {/* Sidebar */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 top-[120px] w-[350px] bg-gray-800 text-white p-5 rounded-2xl z-50 transition-all duration-300 ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Sidebar Close Button */}
          <button 
            className="self-end font-bold hover:text-blue-500 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <i className='bx bx-x bx-lg'></i>
          </button>

          {/* Sidebar Links */}
          <ul className="flex flex-col text-2xl w-full mt-4">
            <li className="mb-4">
              <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            </li>
            <li className="mb-4">
              <Link to="/about" className="hover:text-blue-500 transition-colors">About</Link>
            </li>
            <li className="mb-4">
              <Link to="/services" className="hover:text-blue-500 transition-colors">Packages</Link>
            </li>
            <li className="mb-4">
              <Link to="/reviews" className="hover:text-blue-500 transition-colors">Reviews</Link>
            </li>
            <li className="mb-4">
              <Link to="/contact-us" className="hover:text-blue-500 transition-colors">Contact Us</Link>
            </li>
          </ul>

          {/* Sign In / Get Started Section */}
          <div className="flex gap-5 mt-8 items-center">
            <Link to="/login" className="text-lg hover:text-blue-500 transition-colors">Sign In</Link>
            <Link 
              to="/login?register=true" 
              className="px-5 py-3 bg-[#060640] rounded-full text-white hover:bg-[#060640]/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="w-full sm:w-[60%] mx-auto bg-white rounded-b-3xl lg:rounded-full fixed top-0 md:relative z-40 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-8 py-4 px-8">
          <div className="flex justify-between items-center w-full">
            <div className="navlogo">
              <Link to="/" className="flex items-center font-bold text-2xl">
                <img 
                  src={ctLogo}
                  alt="CT-logo" 
                  style={{ width: '60px', height: 'auto' }} 
                  className="filter brightness-0 invert-[0] sepia saturate-[1000%] hue-rotate-[240deg]"
                />
                <h1 className="logo-text ml-2">CT SPARK</h1>
              </Link>
            </div>

            <ul className="hidden sm:flex justify-between gap-5 text-md">
              <li>
                <Link to="/" className="nav-link text-white">Home</Link>
              </li>
              <li>
                <Link to="#about" className="nav-link text-white">About</Link>
              </li>
              <li>
                <Link to="#services" className="nav-link text-white">Packages</Link>
              </li>
              <li>
                <Link to="#reviews" className="nav-link text-white">Reviews</Link>
              </li>
              <li>
                <Link to="/contact-us" className="nav-link text-white">Contact Us</Link>
              </li>
            </ul>

            <div className="hidden sm:flex gap-5 items-center text-md">
              <Link to="/login" className="hover:text-blue-500 transition-colors">Sign In</Link>
              <Link 
                to="/login?register=true" 
                className="px-5 py-3 bg-[#060640] rounded-full text-white hover:bg-[#060640]/90 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <button 
              className="sm:hidden text-gray-700 hover:text-blue-500 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className='bx bx-menu bx-lg'></i>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;