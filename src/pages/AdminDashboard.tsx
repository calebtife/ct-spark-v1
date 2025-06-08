import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import type { AdminStats, Transaction, Location, User as IndexUser } from '../types';
import type { User as AuthUser } from '../types/auth';
import StatsOverview from '../components/admin/StatsOverview';


const isSuperAdmin = (user: AuthUser): boolean => {
  return user.isAdmin === true && user.isSuperAdmin === true;
};

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (currentUser && isSuperAdmin(currentUser)) {
      fetchLocations();
    }
    fetchStats();
  }, [currentUser, selectedLocation]);

  const fetchLocations = async () => {
    try {
      const locationsRef = collection(db, 'locations');
      const q = query(locationsRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      const locations = querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];
      setLocations(locations);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const fetchStats = async () => {
    if (!currentUser || !currentUser.locationId) return;

    try {
      setLoading(true);
      const locationId = isSuperAdmin(currentUser) ? selectedLocation : currentUser.locationId;

      // Fetch users
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        where('locationId', '==', locationId || currentUser.locationId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map((doc: DocumentData) => ({
        uid: doc.id,
        ...doc.data()
      })) as IndexUser[];

      // Fetch transactions
      const transactionsRef = collection(db, 'transactions');
      const transactionsQuery = query(
        transactionsRef,
        where('locationId', '==', locationId || currentUser.locationId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      // Calculate stats
      const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
      const locationStats = isSuperAdmin(currentUser)
        ? await Promise.all(
            locations.map(async (location) => {
              const locationTransactionsQuery = query(
                transactionsRef,
                where('locationId', '==', location.id)
              );
              const locationTransactionsSnapshot = await getDocs(locationTransactionsQuery);
              const locationTransactions = locationTransactionsSnapshot.docs.map((doc: DocumentData) => ({
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
          )
        : [];

      setStats({
        totalUsers: users.length,
        totalTransactions: transactions.length,
        totalLocations: isSuperAdmin(currentUser) ? locations.length : 1,
        totalRevenue,
        recentTransactions: transactions,
        recentUsers: users.slice(0, 5),
        locationStats
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Location Selector */}
        {currentUser && isSuperAdmin(currentUser) && (
          <div className="bg-white p-4 rounded-lg shadow">
            <select
              value={selectedLocation || ''}
              onChange={(e) => setSelectedLocation(e.target.value || null)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <StatsOverview stats={stats} loading={loading} />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard; 