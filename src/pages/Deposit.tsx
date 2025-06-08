import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import DashboardLayout from '../components/DashboardLayout';
import { TbCurrencyNaira } from "react-icons/tb";
import { HiArrowLeft } from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi";
import { PAYSTACK_CONFIG } from '../config/paystack';
import { toast } from 'react-hot-toast';

interface DepositFormData {
  amount: string;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const Deposit = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);
  const [formData, setFormData] = useState<DepositFormData>({
    amount: ''
  });

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Listen for transaction status changes
  useEffect(() => {
    if (!currentTransaction) return;

    const unsubscribe = onSnapshot(
      doc(db, 'transactions', currentTransaction),
      (doc) => {
        const data = doc.data();
        if (!data) return;

        if (data.status === 'success') {
          toast.success('Payment successful! Your balance has been updated.');
          navigate('/dashboard');
        } else if (data.status === 'failed') {
          toast.error(data.failureReason || 'Payment failed. Please try again.');
          setLoading(false);
          setCurrentTransaction(null);
        }
      },
      (error) => {
        console.error('Error listening to transaction:', error);
      }
    );

    return () => unsubscribe();
  }, [currentTransaction, navigate]);

  const handlePaystackPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount < PAYSTACK_CONFIG.minAmount || amount > PAYSTACK_CONFIG.maxAmount) {
        throw new Error(`Please enter a valid amount between ₦${PAYSTACK_CONFIG.minAmount.toLocaleString()} and ₦${PAYSTACK_CONFIG.maxAmount.toLocaleString()}`);
      }

      // Get user's location ID
      const userDoc = await getDoc(doc(db, 'users', currentUser?.uid!));
      const locationId = userDoc.data()?.locationId || 'NOLOC';
      
      // Generate a unique reference
      const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const reference = `CTS_${locationId}_${randomDigits}`;

      // Create initial transaction record
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        userId: currentUser?.uid,
        amount,
        type: 'deposit',
        status: 'pending',
        timestamp: new Date(),
        reference,
        email: currentUser?.email,
        paymentGateway: 'paystack',
        locationId // Add locationId to transaction record
      });

      setCurrentTransaction(transactionRef.id);

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_CONFIG.publicKey,
        email: currentUser?.email,
        amount: amount * 100, // Convert to kobo
        currency: PAYSTACK_CONFIG.currency,
        ref: reference,
        channels: PAYSTACK_CONFIG.channels,
        metadata: {
          ...PAYSTACK_CONFIG.metadata,
          custom_fields: [
            ...PAYSTACK_CONFIG.metadata.custom_fields,
            {
              display_name: 'User ID',
              variable_name: 'user_id',
              value: currentUser?.uid
            },
            {
              display_name: 'Location ID',
              variable_name: 'location_id',
              value: locationId
            }
          ]
        },
        onClose: () => {
          setLoading(false);
          setError('Transaction cancelled');
          setCurrentTransaction(null);
        }
      });

      handler.openIframe();
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      setCurrentTransaction(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
                  <span>Deposit Details</span>
                </h2>
                <p className="text-gray-600">Add funds to your wallet</p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handlePaystackPayment}>
                <div className="space-y-6">
                  <div className="deposit-amount bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-4">Enter Deposit Amount</h3>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        required
                        min={PAYSTACK_CONFIG.minAmount}
                        step="100"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold text-gray-700"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Minimum deposit: ₦{PAYSTACK_CONFIG.minAmount.toLocaleString()}
                    </p>
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
                        <span>Proceed to Payment</span>
                      </>
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

export default Deposit; 