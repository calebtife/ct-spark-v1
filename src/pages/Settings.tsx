import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import DashboardLayout from '../components/DashboardLayout';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import type { User } from 'firebase/auth';

interface SettingsFormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  locationId: string;
}

interface Location {
  id: string;
  name: string;
}

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [formData, setFormData] = useState<SettingsFormData>({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    locationId: ''
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsRef = collection(db, 'locations');
        const snapshot = await getDocs(locationsRef);
        const locationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    const fetchUserLocation = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const locationId = userDoc.data()?.locationId;
            setCurrentLocation(locationId);
            setFormData(prev => ({ ...prev, locationId }));
          }
        } catch (error) {
          console.error('Error fetching user location:', error);
        }
      }
    };

    fetchLocations();
    fetchUserLocation();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }
    setTimeout(() => {
      if (type === 'error') setError(null);
      else setSuccess(null);
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!currentUser) throw new Error('No user found');

      // Update profile information
      if (formData.username !== currentUser.username) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          username: formData.username
        });
      }

      // Update location if changed
      if (formData.locationId !== currentLocation) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          locationId: formData.locationId
        });
        setCurrentLocation(formData.locationId);
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          formData.currentPassword
        );
        await reauthenticateWithCredential(currentUser as unknown as User, credential);
        await updatePassword(currentUser as unknown as User, formData.newPassword);
      }

      showMessage('Profile updated successfully', 'success');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center gap-2">
                  <i className="bx bx-error-circle text-xl"></i>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center gap-2">
                  <i className="bx bx-check-circle text-xl"></i>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      disabled
                      value={formData.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      name="locationId"
                      id="locationId"
                      value={formData.locationId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a location</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Leave blank if you don't want to change your password
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <i className="bx bx-loader-alt animate-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings; 