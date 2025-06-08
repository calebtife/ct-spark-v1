import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Location } from '../../types';
import { useAsync } from '../../hooks/useAsync';
import { useForm } from '../../hooks/useForm';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Plan } from '../plans/PlanCard';

// Import plans from Plans.tsx
const dailyPlans: Plan[] = [
  { 
    id: 'novice',
    title: "Novice",
    data: "1GB",
    price: 400,
    validity: "1 Day",
    device: "1"
  },
  { 
    id: 'amateur',
    title: "Amateur",
    data: "3GB",
    price: 1250,
    validity: "3 Days",
    device: "1"
  },
  { 
    id: 'day-king',
    title: "Day King",
    data: "unlimited",
    price: 2150,
    validity: "1 Day",
    device: "1",
    isPopular: true
  }
];

const weeklyPlans: Plan[] = [
  { 
    id: 'active',
    title: "ACTIVE",
    data: "5GB",
    price: 2100,
    validity: "7 Days",
    device: "1"
  },
  { 
    id: 'beginner',
    title: "Beginner",
    data: "20GB",
    price: 3750,
    validity: "14 Days",
    device: "2",
    isPopular: true
  }
];

const monthlyPlans: Plan[] = [
  { 
    id: 'intermediate',
    title: "Intermediate",
    data: "40GB",
    price: 6500,
    validity: "30 Days",
    device: "2"
  },
  { 
    id: 'proficient',
    title: "Proficient",
    data: "90GB",
    price: 12500,
    validity: "30 Days",
    device: "2",
    isPopular: true
  },
  { 
    id: 'skilled',
    title: "Skilled",
    data: "150GB",
    price: 18800,
    validity: "30 Days",
    device: "2"
  },
  { 
    id: 'advanced',
    title: "Advanced",
    data: "250GB",
    price: 25000,
    validity: "30 Days",
    device: "3"
  },
  { 
    id: 'expert',
    title: "Expert",
    data: "Unlimited",
    price: 31500,
    validity: "30 Days",
    device: "3"
  }
];

const allPlans = [...dailyPlans, ...weeklyPlans, ...monthlyPlans];

interface VoucherManagementProps {
  selectedLocation: string | null;
  onLocationChange: (locationId: string | null) => void;
}

interface VoucherStats {
  unusedCount: number;
  totalCount: number;
  purchasedCount: number;
  lastPurchaseDate?: Date;
}

interface VoucherFormData {
  file: File | null;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const VoucherManagement: FC<VoucherManagementProps> = ({ selectedLocation, onLocationChange }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState<Record<string, VoucherStats>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [uploading, setUploading] = useState(false);

  const { execute: loadVoucherStats, error } = useAsync<void>();

  const { values, errors, touched, isSubmitting, handleChange, handleSubmit, resetForm } = useForm<VoucherFormData>({
    file: null,
  }, {
    file: (value) => !value ? 'File is required' : undefined,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchVoucherStats();
  }, [selectedLocation, timeFilter]);

  const fetchLocations = async () => {
    try {
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const locationsData = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const normalizePlanName = (planName: string) => {
    const planNameMapping: Record<string, string> = {
      'Day King': 'day king',
      'Intermediate': 'Intermediate',
    };
    return planNameMapping[planName] || planName.toLowerCase().trim().replace(/\s+/g, '_');
  };

  const getTimeFilterDate = () => {
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return new Date(0);
    }
  };

  const fetchVoucherStats = async () => {
    try {
      setLoading(true);
      const stats: Record<string, VoucherStats> = {};
      const timeFilterDate = getTimeFilterDate();

      console.log('Fetching stats for location:', selectedLocation);
      console.log('Time filter date:', timeFilterDate);

      for (const plan of allPlans) {
        const normalizedPlanName = normalizePlanName(plan.title);
        console.log('Processing plan:', plan.title, 'Normalized name:', normalizedPlanName);
        
        let unusedCount = 0;
        let totalCount = 0;
        let purchasedCount = 0;
        let lastPurchaseDate: Date | undefined;

        try {
          // Create all queries upfront
          const queries = [];
          for (let i = 1; i <= 20; i++) {
            const baseQuery = collection(db, 'vouchers', normalizedPlanName, `voucher${i}`);
            
            if (selectedLocation) {
              // Query for specific location
              const locationQuery = query(baseQuery, where('locationId', '==', selectedLocation));
              queries.push(
                getDocs(locationQuery), // Total vouchers for location
                getDocs(query(locationQuery, where('used', '==', false))), // Unused vouchers for location
                getDocs(query(locationQuery, where('used', '==', true))) // Used vouchers for location
              );
            } else {
              // Query for all locations
              queries.push(
                getDocs(baseQuery), // Total vouchers
                getDocs(query(baseQuery, where('used', '==', false))), // Unused vouchers
                getDocs(query(baseQuery, where('used', '==', true))) // Used vouchers
              );
            }
          }

          // Execute all queries in parallel
          const results = await Promise.all(queries);

          // Process results
          for (let i = 0; i < results.length; i += 3) {
            const totalSnapshot = results[i];
            const unusedSnapshot = results[i + 1];
            const usedSnapshot = results[i + 2];
            
            totalCount += totalSnapshot.size;
            unusedCount += unusedSnapshot.size;

            // Process used vouchers
            usedSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.usedAt) {
                const usedAt = data.usedAt.toDate();
                if (usedAt >= timeFilterDate) {
                  purchasedCount++;
                  if (!lastPurchaseDate || usedAt > lastPurchaseDate) {
                    lastPurchaseDate = usedAt;
                  }
                }
              }
            });
          }

          stats[plan.title] = { 
            unusedCount, 
            totalCount, 
            purchasedCount,
            lastPurchaseDate
          };

          console.log('Stats for plan:', plan.title, stats[plan.title]);
        } catch (planError) {
          console.error(`Error processing plan ${plan.title}:`, planError);
          stats[plan.title] = { 
            unusedCount: 0, 
            totalCount: 0, 
            purchasedCount: 0,
            lastPurchaseDate: undefined
          };
        }
      }

      console.log('Final stats:', stats);
      setStats(stats);
    } catch (error) {
      console.error('Error fetching voucher stats:', error);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData: VoucherFormData) => {
    if (!formData.file || !selectedPlan) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const vouchers = text.split('\n').filter(code => code.trim());
        
        const normalizedPlanName = normalizePlanName(selectedPlan.title);
        const planRef = doc(db, 'vouchers', normalizedPlanName);

        // Find the last non-full voucher collection
        let collectionIndex = 1;
        for (let i = 1; i <= 20; i++) {
          const snapshot = await getDocs(collection(db, 'vouchers', normalizedPlanName, `voucher${i}`));
          if (snapshot.size < 500) {
            collectionIndex = i;
            break;
          }
        }

        // Upload vouchers in batches
        const batchSize = 500;
        for (let i = 0; i < vouchers.length; i += batchSize) {
          const batch = vouchers.slice(i, i + batchSize);
          const batchPromises = batch.map(code => 
            addDoc(collection(db, 'vouchers', normalizedPlanName, `voucher${collectionIndex}`), {
              code: code.trim(),
              used: false,
              locationId: selectedLocation,
              createdAt: new Date()
            })
          );
          await Promise.all(batchPromises);
        }

        setShowUploadModal(false);
        resetForm();
        await fetchVoucherStats();
      };
      reader.readAsText(formData.file);
    } catch (error) {
      console.error('Error uploading vouchers:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (planName: string) => {
    try {
      const normalizedPlanName = normalizePlanName(planName);
      let report = `Voucher Report for ${planName}\nGenerated on ${new Date().toLocaleString()}\n\n`;
      report += `Code,Status,Assigned To,Assigned Date\n`;

      for (let i = 1; i <= 20; i++) {
        const snapshot = await getDocs(collection(db, 'vouchers', normalizedPlanName, `voucher${i}`));
        snapshot.forEach(doc => {
          const data = doc.data();
          report += `${data.code},${data.used ? 'Used' : 'Available'},${data.assignedTo || 'N/A'},${data.assignedAt ? new Date(data.assignedAt.toDate()).toLocaleString() : 'N/A'}\n`;
        });
      }

      // Create and download CSV file
      const blob = new Blob([report], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${planName}_voucher_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || uploading) return;
    
    try {
      await handleUpload(values);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error.message}
        </div>
      )}

      {/* Location and Time Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <i className="bx bx-map absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <select
                value={selectedLocation || ''}
                onChange={(e) => onLocationChange(e.target.value || null)}
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              <i className="bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <div className="relative">
              <i className="bx bx-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <i className="bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                <p className="text-sm text-gray-500">{plan.data} / {plan.validity}</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {formatCurrency(plan.price)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Vouchers</p>
                  <p className="text-lg font-semibold">{stats[plan.title]?.totalCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unused Vouchers</p>
                  <p className="text-lg font-semibold text-green-600">{stats[plan.title]?.unusedCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchased ({timeFilter})</p>
                  <p className="text-lg font-semibold text-blue-600">{stats[plan.title]?.purchasedCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Purchase</p>
                  <p className="text-lg font-semibold text-gray-600">
                    {stats[plan.title]?.lastPurchaseDate 
                      ? new Date(stats[plan.title].lastPurchaseDate!).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              {stats[plan.title]?.unusedCount < 5 && (
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">
                    <i className="bx bx-error-circle mr-1"></i>
                    Low voucher count! Please upload more.
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowUploadModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload
                </button>
                <button
                  onClick={() => handleDownload(plan.title)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          resetForm();
          setUploading(false);
        }}
        title={`Upload Vouchers - ${selectedPlan?.title}`}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Voucher File</label>
            <input
              type="file"
              onChange={(e) => handleChange('file', e.target.files?.[0] || null)}
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.file && touched.file ? 'border-red-300' : 'border-gray-300'
              }`}
              accept=".csv,.txt"
              disabled={uploading}
            />
            <p className="mt-1 text-sm text-gray-500">File should contain one voucher code per line</p>
            {errors.file && touched.file && (
              <p className="mt-1 text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                resetForm();
                setUploading(false);
              }}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VoucherManagement; 