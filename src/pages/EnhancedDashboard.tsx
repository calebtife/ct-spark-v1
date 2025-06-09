import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import DashboardLayout from '../components/DashboardLayout';
import { TbCurrencyNaira } from "react-icons/tb";
import { HiDownload, HiShoppingCart, HiArrowRight, HiTrendingUp, HiWifi, HiClock } from "react-icons/hi";
import Plans from '../components/plans/Plans';
import UsageChart from '../components/analytics/UsageChart';
import SpeedTest from '../components/analytics/SpeedTest';
import SmartNotifications from '../components/notifications/SmartNotifications';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import type { Transaction } from '../types';

const EnhancedDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [usageData, setUsageData] = useState([
    { date: '2024-01-01', usage: 2.5, limit: 10 },
    { date: '2024-01-02', usage: 3.2, limit: 10 },
    { date: '2024-01-03', usage: 4.1, limit: 10 },
    { date: '2024-01-04', usage: 5.8, limit: 10 },
    { date: '2024-01-05', usage: 7.2, limit: 10 },
    { date: '2024-01-06', usage: 8.9, limit: 10 },
    { date: '2024-01-07', usage: 9.1, limit: 10 },
  ]);

  useEffect(() => {
    if (!currentUser) return;

    // Set up real-time listener for user's balance
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeBalance = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserBalance(doc.data().balance || 0);
      }
    });

    // Set up real-time listener for recent transactions
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribeTransactions = onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setRecentTransactions(transactions);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeBalance();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentUsage = usageData[usageData.length - 1];
  const usagePercentage = (currentUsage.usage / currentUsage.limit) * 100;

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl">
            <div className="px-6 py-8">
              <h3 className="text-lg font-medium text-blue-100">
                Available Balance
              </h3>
              <div className="mt-4 flex items-baseline">
                <TbCurrencyNaira className="text-3xl text-blue-100" />
                <span className="text-4xl font-bold text-white tracking-tight">
                  {userBalance.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/deposit')}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Add Money
                </button>
              </div>
            </div>
          </div>

          {/* Data Usage Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl">
            <div className="px-6 py-8">
              <div className="flex items-center">
                <HiWifi className="text-2xl text-green-500" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">Data Usage</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900">
                  {currentUsage.usage.toFixed(1)} GB
                </div>
                <div className="text-sm text-gray-500">
                  of {currentUsage.limit} GB used
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage > 90 ? 'bg-red-500' : 
                      usagePercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {usagePercentage.toFixed(1)}% used
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl">
            <div className="px-6 py-8">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="ml-2 text-lg font-medium text-gray-900">Connection</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-green-600">Online</div>
                <div className="text-sm text-gray-500">Connected for 2h 34m</div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  <div>Speed: 45.2 Mbps</div>
                  <div>Ping: 12ms</div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Status Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl">
            <div className="px-6 py-8">
              <div className="flex items-center">
                <HiClock className="text-2xl text-orange-500" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">Current Plan</h3>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">Proficient</div>
                <div className="text-sm text-gray-500">90GB Monthly</div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  <div>Expires: Jan 15, 2024</div>
                  <div className="text-orange-600">5 days remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UsageChart data={usageData} title="7-Day Usage Trend" />
          <SpeedTest />
        </div>

        {/* Smart Notifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <SmartNotifications />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Transactions
              </h3>
              <button
                onClick={() => navigate('/history')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                View All
                <HiArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading transactions...</p>
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="mt-4">
                <div className="flow-root">
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 min-w-0">
                            {transaction.type === 'deposit' ? (
                              <HiDownload className="w-6 h-6 text-green-500 flex-shrink-0" />
                            ) : (
                              <HiShoppingCart className="w-6 h-6 text-red-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {transaction.type === 'deposit' ? 'Deposit' : transaction.plan || 'Purchase'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(transaction.timestamp)}
                              </p>
                              <p className="text-xs text-gray-400 font-mono truncate">
                                #{transaction.reference || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'} flex-shrink-0`}>
                            {transaction.type === 'deposit' ? '+' : '-'}₦{Math.abs(transaction.amount).toLocaleString('en-NG', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center text-gray-500">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Data Plans */}
        <div className="">
          <Plans />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedDashboard;