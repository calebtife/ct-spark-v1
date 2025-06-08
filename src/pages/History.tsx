import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import DashboardLayout from '../components/DashboardLayout';
import type { Transaction } from '../types';
import { HiDownload, HiShoppingCart, HiClock, HiCalendar, HiDownload as HiExport } from 'react-icons/hi';

const ITEMS_PER_PAGE = 10;

const History = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'purchase'>('all');

  const fetchTransactions = async (isLoadMore = false) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (filter !== 'all') {
        if (filter === 'deposit') {
          q = query(q, where('type', '==', 'deposit'));
        } else if (filter === 'purchase') {
          q = query(q, where('type', 'in', ['direct_payment', 'balance_payment']));
        }
      }

      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const newTransactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);

      if (isLoadMore) {
        setTransactions(prev => [...prev, ...newTransactions]);
      } else {
        setTransactions(newTransactions);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLastDoc(null);
    fetchTransactions();
  }, [filter]);

  const handleLoadMore = () => {
    fetchTransactions(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportTransactions = () => {
    // TODO: Implement export functionality
    console.log('Export transactions');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
                <HiClock className="w-6 h-6 text-blue-600" />
                <span>Transaction History</span>
              </h2>
              <button 
                onClick={exportTransactions}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <HiExport className="w-5 h-5" />
                Export
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <HiCalendar className="w-4 h-4" />
                All
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  filter === 'deposit'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <HiDownload className="w-4 h-4" />
                Deposits
              </button>
              <button
                onClick={() => setFilter('purchase')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  filter === 'purchase'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <HiShoppingCart className="w-4 h-4" />
                Purchases
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading && !transactions.length ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading transactions...</p>
              </div>
            ) : transactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Voucher Code
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              {transaction.type === 'deposit' ? (
                                <HiDownload className="w-4 h-4 text-green-500" />
                              ) : (
                                <HiShoppingCart className="w-4 h-4 text-red-500" />
                              )}
                              {transaction.type === 'deposit' ? 'Deposit' : transaction.plan || 'Payment'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'deposit' ? '+' : '-'}₦{Math.abs(transaction.amount).toLocaleString('en-NG', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="font-mono text-blue-600">#{transaction.reference || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {(transaction.type === 'direct_payment' || transaction.type === 'balance_payment') && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-600">Voucher Code: </span>
                                <span className="font-mono font-bold text-blue-600">{transaction.voucherCode || 'N/A'}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasMore && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <HiClock className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No transactions found</p>
                <p className="text-gray-400 text-sm mt-2">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default History; 