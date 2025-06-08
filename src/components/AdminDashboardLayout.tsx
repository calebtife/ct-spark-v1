import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  HiChartBar,
  HiUserGroup,
  HiLocationMarker,
  HiCreditCard,
  HiLogout,
  HiCog,
  HiBell,
  HiMenu,
  HiX
} from 'react-icons/hi';
import { useState, useEffect } from 'react';
import StatsOverview from './admin/StatsOverview';
import UserManagement from './admin/UserManagement';
import LocationManagement from './admin/LocationManagement';
import VoucherManagement from './admin/VoucherManagement';
import type { Location, AdminStats, Transaction, User as IndexUser } from '../types';

interface AdminDashboardLayoutProps {
  children?: ReactNode;
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('overview');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [currentUser, selectedLocation]);

  const fetchLocations = async () => {
    try {
      const locationsRef = collection(db, 'locations');
      const q = query(locationsRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      const locations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];
      console.log('Fetched active locations:', locations.length);
      setLocations(locations);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchStats = async () => {
    if (!currentUser) {
      console.error('No current user found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Current user:', currentUser); // Debug log

      // Fetch users
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef);
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as IndexUser[];

      // Fetch transactions
      const transactionsRef = collection(db, 'transactions');
      const transactionsQuery = query(
        transactionsRef,
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      // Calculate stats
      const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
      const locationStats = await Promise.all(
        locations.map(async (location) => {
          const locationTransactionsQuery = query(
            transactionsRef,
            where('locationId', '==', location.id)
          );
          const locationTransactionsSnapshot = await getDocs(locationTransactionsQuery);
          const locationTransactions = locationTransactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Transaction[];

          return {
            locationId: location.id,
            locationName: location.name,
            totalTransactions: locationTransactions.length,
            totalRevenue: locationTransactions.reduce((sum, t) => sum + t.amount, 0)
          };
        })
      );

      setStats({
        totalUsers: users.length,
        totalTransactions: transactions.length,
        totalLocations: locations.length,
        totalRevenue,
        recentTransactions: transactions,
        recentUsers: users.slice(0, 5),
        locationStats
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navItems = [
    { name: 'Overview', icon: HiChartBar, path: '/admin', component: 'overview' },
    { name: 'Users', icon: HiUserGroup, path: '/admin', component: 'users' },
    { name: 'Locations', icon: HiLocationMarker, path: '/admin', component: 'locations' },
    { name: 'Vouchers', icon: HiCreditCard, path: '/admin', component: 'vouchers' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StatsOverview stats={stats} loading={loading} locations={locations} />;
      case 'users':
        return <UserManagement locations={locations} selectedLocation={selectedLocation} />;
      case 'locations':
        return <LocationManagement 
          locations={locations} 
          selectedLocation={selectedLocation}
          onLocationUpdate={() => fetchLocations()} 
        />;
      case 'vouchers':
        return <VoucherManagement 
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />;
      default:
        return <StatsOverview stats={stats} loading={loading} locations={locations} />;
    }
  };

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
            <h1 className="text-2xl font-bold text-blue-900">Admin Panel</h1>
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
                  setActiveTab(item.component);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 ${
                  activeTab === item.component ? 'bg-blue-50 text-blue-600' : ''
                }`}
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
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                {navItems.find(item => item.component === activeTab)?.name || 'Admin Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              
              <button className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200">
                <HiBell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200">
                <HiCog className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout; 