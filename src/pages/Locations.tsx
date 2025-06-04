import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { Location } from '../types';

const Locations = () => {
  const { currentUser } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, [currentUser]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const locationsRef = collection(db, 'locations');
      let q = query(locationsRef, where('isActive', '==', true));

      // If user is not a super admin, only show their location
      if (currentUser && !currentUser.isSuperAdmin) {
        q = query(q, where('id', '==', currentUser.locationId));
      }

      const querySnapshot = await getDocs(q);
      const locations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];

      setLocations(locations);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Locations</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">Loading locations...</div>
            ) : locations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {location.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>{location.address}</p>
                      <p>
                        {location.city}, {location.state} {location.zipCode}
                      </p>
                      <p>Phone: {location.phone}</p>
                      <p>Email: {location.email}</p>
                    </div>
                    {currentUser?.locationId === location.id && (
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Your Location
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No locations found
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Locations; 