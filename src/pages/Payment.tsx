import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

interface PaymentFormData {
  recipientId: string;
  amount: string;
  note: string;
}

const Payment = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    recipientId: '',
    amount: '',
    note: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > currentUser.balance) {
        throw new Error('Insufficient balance');
      }

      // Check if recipient exists
      const recipientRef = collection(db, 'users');
      const q = query(recipientRef, where('uid', '==', formData.recipientId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Recipient not found');
      }

      const recipient = querySnapshot.docs[0].data();

      // Create transaction
      const transactionData = {
        userId: currentUser.uid,
        recipientId: formData.recipientId,
        amount: amount,
        type: 'withdrawal',
        status: 'completed',
        note: formData.note,
        createdAt: serverTimestamp(),
        locationId: currentUser.locationId
      };

      // Start a batch write
      const batch = db.batch();

      // Add transaction
      const transactionRef = doc(collection(db, 'transactions'));
      batch.set(transactionRef, transactionData);

      // Update sender's balance
      const senderRef = doc(db, 'users', currentUser.uid);
      batch.update(senderRef, {
        balance: currentUser.balance - amount
      });

      // Update recipient's balance
      const recipientDocRef = doc(db, 'users', formData.recipientId);
      batch.update(recipientDocRef, {
        balance: recipient.balance + amount
      });

      // Commit the batch
      await batch.commit();

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Payment</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700">
                      Recipient ID
                    </label>
                    <input
                      type="text"
                      name="recipientId"
                      id="recipientId"
                      required
                      value={formData.recipientId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter recipient's user ID"
                    />
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Available balance: ${currentUser?.balance.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                      Note (Optional)
                    </label>
                    <textarea
                      name="note"
                      id="note"
                      rows={3}
                      value={formData.note}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Add a note to your payment"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {loading ? 'Processing...' : 'Send Payment'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment; 