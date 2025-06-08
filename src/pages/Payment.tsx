import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, getDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { TbCurrencyNaira } from "react-icons/tb";
import { HiArrowLeft, HiLockClosed, HiCreditCard } from "react-icons/hi";
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  title: string;
  data: string;
  price: number;
  validity: string;
  device: string;
}

interface PaymentFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

type PaymentMethod = 'balance' | 'paystack';

const Payment = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    fullName: '',
    email: currentUser?.email || '',
    phoneNumber: ''
  });

  useEffect(() => {
    // Get selected plan from location state
    const plan = location.state?.plan;
    if (!plan) {
      toast.error('No plan selected');
      navigate('/dashboard');
      return;
    }

    // Check if plan has available vouchers
    checkVoucherAvailability(plan.title).then(hasVouchers => {
      if (!hasVouchers) {
        toast.error('No vouchers available for this plan');
        navigate('/dashboard');
      } else {
        setSelectedPlan(plan);
      }
    });
  }, [location.state, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkVoucherAvailability = async (planName: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const locationId = userData?.locationId;

      // Normalize plan name to match Firestore document names
      const firestoreNames: { [key: string]: string } = {
        'Day King': 'day king',
        'Intermediate': 'Intermediate',
        'ACTIVE': 'active'
      };

      const normalizedPlanName = firestoreNames[planName] || 
        planName.toLowerCase().trim().replace(/\s+/g, '_');
      
      const planRef = doc(db, 'vouchers', normalizedPlanName);
      
      for (let i = 1; i <= 20; i++) {
        const voucherQuery = query(
          collection(planRef, `voucher${i}`),
          where('used', '==', false),
          where('locationId', '==', locationId)
        );
        
        const voucherDoc = await getDocs(voucherQuery);
        if (!voucherDoc.empty) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking voucher availability:', error);
      return false;
    }
  };

  const assignVoucher = async (planName: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    const locationId = userData?.locationId;

    // Normalize plan name to match Firestore document names
    const firestoreNames: { [key: string]: string } = {
      'Day King': 'day king',
      'Intermediate': 'Intermediate',
      'ACTIVE': 'active'
    };

    const normalizedPlanName = firestoreNames[planName] || 
      planName.toLowerCase().trim().replace(/\s+/g, '_');
    
    const planRef = doc(db, 'vouchers', normalizedPlanName);
    
    for (let i = 1; i <= 20; i++) {
      const voucherQuery = query(
        collection(planRef, `voucher${i}`),
        where('used', '==', false),
        where('locationId', '==', locationId)
      );
      
      const voucherDoc = await getDocs(voucherQuery);
      if (!voucherDoc.empty) {
        const voucher = voucherDoc.docs[0];
        const voucherCode = voucher.data().code;

        await writeBatch(db).update(voucher.ref, {
          used: true,
          assignedTo: currentUser.uid,
          assignedAt: serverTimestamp()
        }).commit();

        return voucherCode;
      }
    }
    
    throw new Error(`No available vouchers for ${planName} at your location`);
  };

  const handlePaystackPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const handler = window.PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount: selectedPlan.price * 100, // Convert to kobo
        currency: 'NGN',
        ref: `CT_SPARK_${Math.floor(Math.random() * 1000000) + 1}`,
        metadata: {
          custom_fields: [
            {
              display_name: 'User ID',
              variable_name: 'user_id',
              value: currentUser.uid
            },
            {
              display_name: 'Plan',
              variable_name: 'plan',
              value: selectedPlan.title
            }
          ]
        },
        callback: async (response: any) => {
          try {
            const voucherCode = await assignVoucher(selectedPlan.title);
            
            // Create transaction record
            await writeBatch(db)
              .set(doc(collection(db, 'transactions')), {
                userId: currentUser.uid,
                plan: selectedPlan.title,
                amount: selectedPlan.price,
                type: 'direct_payment',
                status: 'completed',
                paymentMethod: 'paystack',
                reference: response.reference,
                voucherCode,
                timestamp: serverTimestamp()
              })
              .commit();

            setVoucherCode(voucherCode);
            toast.success('Payment successful! Your voucher code has been generated.');
          } catch (error: any) {
            toast.error(error.message);
          }
        },
        onClose: () => {
          setLoading(false);
          toast.error('Payment cancelled');
        }
      });

      handler.openIframe();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBalancePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      if (!currentUser.balance || currentUser.balance < selectedPlan.price) {
        throw new Error('Insufficient balance');
      }

      const voucherCode = await assignVoucher(selectedPlan.title);
      const reference = `BAL_${Math.floor(Math.random() * 1000000) + 1}`;

      // Create transaction and update balance in a batch
      await writeBatch(db)
        .set(doc(collection(db, 'transactions')), {
          userId: currentUser.uid,
          plan: selectedPlan.title,
          amount: selectedPlan.price,
          type: 'balance_payment',
          status: 'completed',
          paymentMethod: 'balance',
          reference,
          voucherCode,
          timestamp: serverTimestamp()
        })
        .update(doc(db, 'users', currentUser.uid), {
          balance: currentUser.balance - selectedPlan.price
        })
        .commit();

      setVoucherCode(voucherCode);
      toast.success('Payment successful! Your voucher code has been generated.');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                  <TbCurrencyNaira className="text-blue-600 w-6 h-6" />
                  <span>Complete Your Purchase</span>
                </h2>
                <p className="text-gray-600">Activate your selected data plan</p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {voucherCode ? (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Payment Successful!</h3>
                  <p className="text-gray-700 mb-2">Your voucher code is:</p>
                  <div className="bg-white p-4 rounded-lg border border-green-300 flex justify-between items-center">
                    <code className="text-lg font-mono font-bold text-green-700">{voucherCode}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(voucherCode);
                        toast.success('Voucher code copied to clipboard!');
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Use the voucher code to connect on the wifi network "CT SPARK" at your location .
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <div className="selected-plan bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-2">Selected Plan</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-700">{selectedPlan.title}</p>
                        <p className="text-sm text-gray-500">{selectedPlan.validity} Validity</p>
                      </div>
                      <p className="text-xl font-bold text-blue-600">
                        ₦{selectedPlan.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod('paystack')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          paymentMethod === 'paystack'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <HiCreditCard className="w-6 h-6 text-blue-600" />
                          <div className="text-left">
                            <p className="font-medium">Pay Now</p>
                            <p className="text-sm text-gray-500">Paystack Checkout</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('balance')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          paymentMethod === 'balance'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TbCurrencyNaira className="w-6 h-6 text-blue-600" />
                          <div className="text-left">
                            <p className="font-medium">Pay with Balance</p>
                            <p className="text-sm text-gray-500">
                              Available: ₦{currentUser?.balance?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'paystack' && (
                    <form onSubmit={handlePaystackPayment} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            required
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <HiLockClosed className="w-5 h-5" />
                            <span>Pay Now</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {paymentMethod === 'balance' && (
                    <form onSubmit={handleBalancePayment}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <TbCurrencyNaira className="w-5 h-5" />
                            <span>Pay with Balance</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payment; 