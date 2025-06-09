import React, { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useAuth } from '../../contexts/AuthContext';
import { HiCreditCard } from 'react-icons/hi';

interface FlutterwavePaymentProps {
  amount: number;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

const FlutterwavePayment: React.FC<FlutterwavePaymentProps> = ({
  amount,
  onSuccess,
  onError,
  disabled = false
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const config = {
    public_key: process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: `CT_SPARK_FLW_${Date.now()}`,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: currentUser?.email || '',
      phone_number: '',
      name: currentUser?.username || '',
    },
    customizations: {
      title: 'CT SPARK Payment',
      description: 'Payment for CT SPARK services',
      logo: '/assets/CT-logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePayment = () => {
    setLoading(true);
    handleFlutterPayment({
      callback: (response) => {
        setLoading(false);
        if (response.status === 'successful') {
          onSuccess(response);
        } else {
          onError(response);
        }
        closePaymentModal();
      },
      onClose: () => {
        setLoading(false);
      },
    });
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <HiCreditCard className="w-5 h-5" />
      {loading ? 'Processing...' : 'Pay with Flutterwave'}
    </button>
  );
};

export default FlutterwavePayment;