import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import type { User, Location, Transaction } from '../types/index';

interface UserFormData {
  email: string;
  username: string;
  locationId: string;
  isAdmin: boolean;
}

interface UserDetails {
  user: User;
  transactions: Transaction[];
}

const UserManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    username: '',
    locationId: '',
    isAdmin: false
  });

  useEffect(() => {
    fetchUsers();
    if (currentUser?.isSuperAdmin) {
      fetchLocations();
    }
  }, [currentUser]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const filterUsers = () => {
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const fetchUsers = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      let q = query(usersRef);

      if (!currentUser.isSuperAdmin) {
        q = query(q, where('locationId', '==', currentUser.locationId));
      }

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];

      setUsers(users);
      setFilteredUsers(users);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      const user = users.find(u => u.uid === userId);
      if (!user) throw new Error('User not found');

      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      setSelectedUserDetails({ user, transactions });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsRef = collection(db, 'locations');
      const q = query(locationsRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      const locations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];
      setLocations(locations);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!currentUser) throw new Error('No user found');

      // Create new user document
      const userData = {
        email: formData.email,
        username: formData.username,
        locationId: formData.locationId,
        isAdmin: formData.isAdmin,
        balance: 0,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users'), userData);
      setSuccess('User added successfully');
      setFormData({
        email: '',
        username: '',
        locationId: '',
        isAdmin: false
      });
      setShowAddUserForm(false);
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentIsAdmin
      });
      setSuccess(`User ${currentIsAdmin ? 'removed from' : 'added to'} admin role`);
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus
      });
      setSuccess(`User ${currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
    try {
      setLoading(true);
      const batch = db.batch();

      for (const userId of selectedUsers) {
        const userRef = doc(db, 'users', userId);
        switch (action) {
          case 'suspend':
            batch.update(userRef, { isActive: false });
            break;
          case 'activate':
            batch.update(userRef, { isActive: true });
            break;
          case 'delete':
            batch.delete(userRef);
            break;
        }
      }

      await batch.commit();
      setSuccess(`Bulk action completed successfully`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(prev =>
      prev.length === filteredUsers.length
        ? []
        : filteredUsers.map(user => user.uid)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {currentUser?.isSuperAdmin && (
                  <button
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {showAddUserForm ? 'Cancel' : 'Add New User'}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}

            {showAddUserForm && currentUser?.isSuperAdmin && (
              <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <select
                      name="locationId"
                      id="locationId"
                      required
                      value={formData.locationId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAdmin"
                      id="isAdmin"
                      checked={formData.isAdmin}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                      Make this user an admin
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {loading ? 'Adding...' : 'Add User'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {selectedUsers.length > 0 && (
              <div className="mb-4 flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {selectedUsers.length} users selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Suspend Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Activate Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            {loading && !users.length ? (
              <div className="text-center py-4">Loading users...</div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className={!user.isActive ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.uid)}
                            onChange={() => handleSelectUser(user.uid)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {locations.find(l => l.id === user.locationId)?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${user.balance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isSuperAdmin
                              ? 'bg-purple-100 text-purple-800'
                              : user.isAdmin
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isSuperAdmin ? 'Super Admin' : user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchUserDetails(user.uid)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Details
                            </button>
                            {currentUser?.isSuperAdmin && user.uid !== currentUser.uid && (
                              <>
                                <button
                                  onClick={() => handleToggleAdmin(user.uid, user.isAdmin)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(user.uid, user.isActive)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  {user.isActive ? 'Suspend' : 'Activate'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No users found
              </div>
            )}

            {selectedUserDetails && (
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    User Details: {selectedUserDetails.user.username}
                  </h3>
                  <button
                    onClick={() => setSelectedUserDetails(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">User Information</h4>
                    <dl className="mt-2 space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{selectedUserDetails.user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Location</dt>
                        <dd className="text-sm text-gray-900">
                          {locations.find(l => l.id === selectedUserDetails.user.locationId)?.name || 'Unknown'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Balance</dt>
                        <dd className="text-sm text-gray-900">
                          ${selectedUserDetails.user.balance.toFixed(2)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Joined</dt>
                        <dd className="text-sm text-gray-900">
                          {formatDate(selectedUserDetails.user.createdAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Recent Transactions</h4>
                    <div className="mt-2 space-y-2">
                      {selectedUserDetails.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="bg-white p-3 rounded-md shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </span>
                            <span className={`text-sm font-medium ${
                              transaction.type === 'deposit'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : '-'}
                              ${Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement; 