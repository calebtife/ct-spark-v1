import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import DashboardLayout from '../components/DashboardLayout';
import { TbCurrencyNaira } from "react-icons/tb";
import { HiDownload, HiShoppingCart, HiArrowRight } from "react-icons/hi";
import Plans from '../components/plans/Plans';
import type { Transaction } from '../types';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState<number>(0);

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
      limit(1)
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

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Balance Card */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl">
            <div className="px-6 py-8 sm:p-8">
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
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Transaction
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
                  <p className="mt-2 text-gray-500">Loading transaction...</p>
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="mt-4">
                  <div className="flow-root">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 min-w-0">
                          {recentTransactions[0].type === 'deposit' ? (
                            <HiDownload className="w-6 h-6 text-green-500 flex-shrink-0" />
                          ) : (
                            <HiShoppingCart className="w-6 h-6 text-red-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {recentTransactions[0].type === 'deposit' ? 'Deposit' : recentTransactions[0].plan || 'Purchase'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(recentTransactions[0].timestamp)}
                            </p>
                            <p className="text-xs text-gray-400 font-mono truncate">
                              #{recentTransactions[0].reference || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${recentTransactions[0].type === 'deposit' ? 'text-green-600' : 'text-red-600'} flex-shrink-0`}>
                          {recentTransactions[0].type === 'deposit' ? '+' : '-'}₦{Math.abs(recentTransactions[0].amount).toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
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
        </div>
        <div className=''>
          <Plans />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 