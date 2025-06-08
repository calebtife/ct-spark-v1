import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { 
  HiHome, 
  HiChartBar, 
  HiClock, 
  HiCreditCard, 
  HiSupport, 
  HiLogout,
  HiCog,
  HiBell,
  HiSun,
  HiMoon,
  HiCloud,
  HiMenu,
  HiX,
  HiMail
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import WhatsAppButton from './WhatsAppButton';
import Notifications from './Notifications';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning', icon: HiSun };
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Good afternoon', icon: HiCloud };
    } else {
      return { text: 'Good evening', icon: HiMoon };
    }
  };

  const greeting = getGreeting();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '2349028741416'; // Remove spaces and + for WhatsApp API
    const message = 'Hello! I need support with CT SPARK.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const navItems = [
    { name: 'Home', icon: HiHome, path: '/' },
    { name: 'Dashboard', icon: HiChartBar, path: '/dashboard' },
    { name: 'History', icon: HiClock, path: '/history' },
    { name: 'Payments', icon: HiCreditCard, path: '/payment' },
    { name: 'Contact Us', icon: HiMail, path: '/contact-us' },
    { name: 'Settings', icon: HiCog, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${isMobile ? 'w-64' : 'w-64'}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        ${!isMobile ? 'translate-x-0' : ''}
        bg-white shadow-lg
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-2xl font-bold text-blue-900 animate-pulse">CT SPARK</h1>
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <HiLogout className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${!isMobile ? 'pl-64' : 'pl-0'}
      `}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center space-x-3 min-w-0">
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 mr-2 flex-shrink-0"
                >
                  <HiMenu className="w-6 h-6" />
                </button>
              )}
              <greeting.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                {greeting.text}, {currentUser?.username}!
              </h2>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <Notifications />
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200"
              >
                <HiCog className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {children}
        </main>

        {/* WhatsApp Support Button */}
        <WhatsAppButton 
          phoneNumber="+234 902 874 1416"
          message="Hello! I need support with CT SPARK."
        />
      </div>
    </div>
  );
};

export default DashboardLayout; 