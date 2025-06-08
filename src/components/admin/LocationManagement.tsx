import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Location } from '../../types';
import { useAsync } from '../../hooks/useAsync';
import { usePagination } from '../../hooks/usePagination';
import { useForm } from '../../hooks/useForm';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

interface LocationManagementProps {
  locations: Location[];
  selectedLocation: string | null;
  onLocationUpdate: () => void;
}

interface LocationFormData {
  name: string;
  address: string;
  isActive: boolean;
  notes?: string;
}

interface ExtendedLocation extends Location {
  notes?: string;
  status: 'active' | 'inactive';
  phone: string;
  email: string;
}

const defaultLocations: ExtendedLocation[] = [
  { 
    id: 'nasLodge', 
    name: 'Nas Lodge Minna', 
    status: 'active',
    address: 'Nas Lodge, Minna',
    city: 'Minna',
    state: 'Niger',
    zipCode: '920001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    phone: '+2341234567890',
    email: 'naslodge@example.com'
  },
  { 
    id: 'malete1', 
    name: 'Malete 1', 
    status: 'active',
    address: 'Malete 1, Minna',
    city: 'Minna',
    state: 'Niger',
    zipCode: '920001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    phone: '+2341234567891',
    email: 'malete1@example.com'
  }
];

const LocationManagement: FC<LocationManagementProps> = ({ locations, selectedLocation, onLocationUpdate }) => {
  console.log('LocationManagement rendered with props:', { locations, selectedLocation });
  
  const [selectedLoc, setSelectedLoc] = useState<ExtendedLocation | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [localLocations, setLocalLocations] = useState<ExtendedLocation[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      console.log('Fetching locations...');
      try {
        // First check if locations exist in local storage
        const cachedLocations = localStorage.getItem('locations');
        if (cachedLocations) {
          console.log('Using cached locations');
          const parsedLocations = JSON.parse(cachedLocations);
          setLocalLocations(parsedLocations);
          setLoading(false);
          return;
        }

        // If no cache, fetch from Firestore
        const locationsRef = collection(db, 'locations');
        const q = query(locationsRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedLocations = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: doc.data().status || 'active',
          isActive: doc.data().status === 'active'
        })) as ExtendedLocation[];

        console.log('Fetched locations:', fetchedLocations);

        // Cache the locations
        localStorage.setItem('locations', JSON.stringify(fetchedLocations));
        console.log('Fetched and cached locations:', fetchedLocations.length);
        
        setLocalLocations(fetchedLocations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Return default locations if there's an error
        setLocalLocations(defaultLocations);
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const showMessage = (message: string, type: 'success' | 'error') => {
    console.log('Showing message:', { message, type });
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleViewLocation = (location: Location) => {
    console.log('Viewing location:', location);
    const extendedLocation: ExtendedLocation = {
      ...location,
      notes: (location as ExtendedLocation).notes || '',
      status: (location as ExtendedLocation).status || 'active',
    };
    setSelectedLoc(extendedLocation);
    handleChange('name', extendedLocation.name);
    handleChange('address', extendedLocation.address);
    handleChange('isActive', extendedLocation.status === 'active');
    handleChange('notes', extendedLocation.notes || '');
    setShowLocationModal(true);
  };

  const handleUpdateLocation = async (formData: LocationFormData) => {
    console.log('Updating location:', { selectedLoc, formData });
    if (!selectedLoc) return;

    try {
      const updateData = {
        name: formData.name,
        address: formData.address,
        status: formData.isActive ? 'active' : 'inactive' as const,
        notes: formData.notes,
        updatedAt: new Date()
      };

      console.log('Updating location with data:', updateData);
      await updateDoc(doc(db, 'locations', selectedLoc.id), updateData);
      
      // Update local state
      setLocalLocations(prevLocations => 
        prevLocations.map(loc => 
          loc.id === selectedLoc.id 
            ? { 
                ...loc, 
                name: updateData.name,
                address: updateData.address,
                status: updateData.status,
                notes: updateData.notes,
                updatedAt: updateData.updatedAt,
                isActive: updateData.status === 'active'
              } as ExtendedLocation
            : loc
        )
      );

      setShowLocationModal(false);
      // Clear cache and refetch
      localStorage.removeItem('locations');
      onLocationUpdate();
      showMessage('Location updated successfully', 'success');
    } catch (error) {
      console.error('Error updating location:', error);
      showMessage('Error updating location. Please try again.', 'error');
    }
  };

  const handleStatusChange = async (locationId: string, newStatus: boolean) => {
    console.log('Changing location status:', { locationId, newStatus });
    try {
      await updateDoc(doc(db, 'locations', locationId), {
        status: newStatus ? 'active' : 'inactive',
        updatedAt: new Date()
      });
      // Clear cache and refetch
      localStorage.removeItem('locations');
      onLocationUpdate();
      showMessage(`Location ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating location status:', error);
      showMessage('Error updating location status. Please try again.', 'error');
    }
  };

  const handleAddLocation = async (formData: any) => {
    try {
      const locationId = formData.id.toLowerCase();
      const locationData: ExtendedLocation = {
        name: formData.name,
        address: formData.address,
        id: locationId,
        status: formData.status as 'active' | 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: formData.status === 'active',
        phone: '',
        email: '',
        city: '',
        state: '',
        zipCode: ''
      };

      console.log('Adding new location:', locationData);

      // Check if location ID already exists
      const docRef = doc(db, 'locations', locationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        showMessage('Location ID already exists. Please choose a different ID.', 'error');
        return;
      }

      // Add location with custom ID
      await setDoc(docRef, locationData);
      
      // Update local state
      setLocalLocations(prevLocations => [...prevLocations, locationData]);

      setShowAddLocationModal(false);
      showMessage('Location added successfully!', 'success');
      // Clear cache and refetch
      localStorage.removeItem('locations');
      onLocationUpdate();
    } catch (error) {
      console.error('Error adding location:', error);
      showMessage('Error adding location. Please try again.', 'error');
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    
    try {
      await deleteDoc(doc(db, 'locations', locationId));
      // Update local state
      setLocalLocations(prevLocations => prevLocations.filter(loc => loc.id !== locationId));
      showMessage('Location deleted successfully!', 'success');
      // Clear cache and refetch
      localStorage.removeItem('locations');
      onLocationUpdate();
    } catch (error) {
      console.error('Error deleting location:', error);
      showMessage('Error deleting location. Please try again.', 'error');
    }
  };

  const {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageItems,
  } = usePagination({
    totalItems: localLocations.length,
    pageSize: 10,
  });

  console.log('Pagination state:', { currentPage, totalPages, totalItems: localLocations.length });

  const { values, errors, touched, isSubmitting, handleChange, handleSubmit, resetForm } = useForm<LocationFormData>({
    name: '',
    address: '',
    isActive: true,
    notes: '',
  }, {
    name: (value) => !value ? 'Name is required' : undefined,
    address: (value) => !value ? 'Address is required' : undefined,
  }, handleUpdateLocation);

  const filteredLocations = localLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Filtered locations:', { 
    total: localLocations.length, 
    filtered: filteredLocations.length,
    searchQuery 
  });

  const paginatedLocations = getPageItems(filteredLocations);
  console.log('Paginated locations:', { 
    total: paginatedLocations.length,
    currentPage,
    totalPages 
  });

  if (loading) {
    console.log('Rendering loading spinner');
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  console.log('Rendering main component with locations:', paginatedLocations.length);

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

      {/* Location Management Header */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Location Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowAddLocationModal(true)}
            className="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add New Location
          </button>
          <button
            onClick={() => setShowLocationModal(true)}
            className="btn bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Manage Locations
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onLocationUpdate}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200"
              title="Refresh Locations"
            >
              <i className="bx bx-refresh bx-md"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No locations found. Click "Add New Location" to create one.
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {location.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {location.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={location.status}
                        onChange={(e) => handleStatusChange(location.id, e.target.value === 'active')}
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          location.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.createdAt instanceof Date 
                        ? location.createdAt.toLocaleDateString()
                        : location.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewLocation(location)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={goToPreviousPage}
                  disabled={!hasPreviousPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Details Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="Location Details"
      >
        {selectedLoc && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.name && touched.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={values.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.address && touched.address ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.address && touched.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={values.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleChange('isActive', e.target.value === 'active')}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.isActive && touched.isActive ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.isActive && touched.isActive && (
                <p className="mt-1 text-sm text-red-600">{errors.isActive}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={values.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Add any notes about this location..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
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

      {/* Add Location Modal */}
      <Modal
        isOpen={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        title="Add New Location"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = {
            id: (e.target as any).locationId.value,
            name: (e.target as any).locationName.value,
            address: (e.target as any).locationAddress.value,
            status: (e.target as any).locationStatus.value
          };
          handleAddLocation(formData);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location ID (camelCase)</label>
            <input
              id="locationId"
              type="text"
              pattern="[a-z]+([A-Z][a-z]*)*"
              title="Please use camelCase (e.g., nasLodge)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Example: nasLodge, malete1</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location Name</label>
            <input
              id="locationName"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              id="locationAddress"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="locationStatus"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              defaultValue="active"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowAddLocationModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LocationManagement;