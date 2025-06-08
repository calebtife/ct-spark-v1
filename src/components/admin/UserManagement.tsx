import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Location } from '../../types';
import { useAsync } from '../../hooks/useAsync';
import { usePagination } from '../../hooks/usePagination';
import { useForm } from '../../hooks/useForm';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

interface UserManagementProps {
  locations: Location[];
  selectedLocation: string | null;
}

interface User {
  uid: string;
  username: string;
  email: string;
  balance: number;
  locationId: string;
  createdAt: string;
  lastDepositAt?: any;
}

interface UserFormData {
  balance: number;
  notes?: string;
}

const UserManagement: FC<UserManagementProps> = ({ locations, selectedLocation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { execute: loadUsers, loading, error } = useAsync<User[]>();

  const showMessage = (message: string, type: 'success' | 'error') => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleUpdateUser = async (formData: UserFormData) => {
    if (!selectedUser) return;

    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        balance: formData.balance,
        notes: formData.notes,
        updatedAt: new Date()
      });
      setShowUserModal(false);
      fetchUsers();
      showMessage('User balance updated successfully', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage('Error updating user balance', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prevUsers => prevUsers.filter(user => user.uid !== userId));
      showMessage('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage('Error deleting user', 'error');
    }
  };

  const {
    currentPage,
    totalPages,
    paginationRange,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageItems,
  } = usePagination({
    totalItems: users.length,
    pageSize: 10,
  });

  const { values, errors, touched, isSubmitting, handleChange, handleSubmit, resetForm } = useForm<UserFormData>({
    balance: 0,
    notes: '',
  }, {
    balance: (value) => typeof value === 'number' && value < 0 ? 'Balance cannot be negative' : undefined,
  }, handleUpdateUser);

  useEffect(() => {
    fetchUsers();
  }, [selectedLocation]);

  const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      let q = query(usersRef);

      if (selectedLocation) {
        q = query(q, where('locationId', '==', selectedLocation));
      }

      q = query(q, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
    resetForm();
    handleChange('balance', user.balance);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = getPageItems(filteredUsers);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error.message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(user.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {locations.find(loc => loc.id === user.locationId)?.name || user.locationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit Balance
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={goToPreviousPage}
                    disabled={!hasPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <i className="bx bx-chevron-left"></i>
                  </button>
                  {Array.from({ length: paginationRange.end - paginationRange.start + 1 }, (_, i) => (
                    <button
                      key={paginationRange.start + i}
                      onClick={() => goToPage(paginationRange.start + i)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === paginationRange.start + i
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {paginationRange.start + i}
                    </button>
                  ))}
                  <button
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <i className="bx bx-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Edit User Balance"
        size="lg"
      >
        {selectedUser && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900">
                  {locations.find(loc => loc.id === selectedUser.locationId)?.name || selectedUser.locationId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedUser.balance)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Balance (₦)</label>
              <input
                type="number"
                value={values.balance}
                onChange={(e) => handleChange('balance', parseFloat(e.target.value))}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.balance && touched.balance ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
              {errors.balance && touched.balance && (
                <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={values.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Add any notes about this balance change..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement; 