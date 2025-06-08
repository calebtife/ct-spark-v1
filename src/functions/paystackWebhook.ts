import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

export const paystackWebhook = functions.https.onRequest(async (req, res) => {
  // Verify Paystack signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  // Handle the event
  switch (event.event) {
    case 'charge.success':
      await handleSuccessfulPayment(event.data);
      break;
    case 'charge.failed':
      await handleFailedPayment(event.data);
      break;
    default:
      console.log(`Unhandled event type: ${event.event}`);
  }

  res.json({ received: true });
});

async function handleSuccessfulPayment(data: any) {
  const db = admin.firestore();
  const { reference, amount, customer } = data;

  try {
    // Get the transaction
    const transactionRef = db.collection('transactions').doc(reference);
    const transaction = await transactionRef.get();

    if (!transaction.exists) {
      throw new Error('Transaction not found');
    }

    const transactionData = transaction.data();
    const userId = transactionData?.userId;

    if (!userId) {
      throw new Error('User ID not found in transaction');
    }

    // Update transaction status
    await transactionRef.update({
      status: 'success',
      paymentDetails: {
        gateway: 'paystack',
        reference: reference,
        amount: amount / 100, // Convert from kobo to naira
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        customer: customer
      }
    });

    // Update user's balance
    const userRef = db.collection('users').doc(userId);
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const currentBalance = userDoc.data()?.balance || 0;
      const newBalance = currentBalance + (amount / 100);

      transaction.update(userRef, {
        balance: newBalance,
        lastDepositAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Send notification to user
    await sendPaymentNotification(userId, 'success', amount / 100);
  } catch (error) {
    console.error('Error processing successful payment:', error);
    throw error;
  }
}

async function handleFailedPayment(data: any) {
  const db = admin.firestore();
  const { reference, customer } = data;

  try {
    // Update transaction status
    const transactionRef = db.collection('transactions').doc(reference);
    await transactionRef.update({
      status: 'failed',
      paymentDetails: {
        gateway: 'paystack',
        reference: reference,
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        customer: customer,
        failureReason: data.gateway_response || 'Payment failed'
      }
    });

    // Get user ID from transaction
    const transaction = await transactionRef.get();
    const userId = transaction.data()?.userId;

    if (userId) {
      // Send notification to user
      await sendPaymentNotification(userId, 'failed', 0);
    }
  } catch (error) {
    console.error('Error processing failed payment:', error);
    throw error;
  }
}

async function sendPaymentNotification(userId: string, status: 'success' | 'failed', amount: number) {
  const db = admin.firestore();
  
  console.log('Sending payment notification:', {
    userId,
    status,
    amount,
    path: `users/${userId}/notifications`
  });

  try {
    const notificationRef = db.collection('users').doc(userId).collection('notifications');
    const notification = {
      type: 'payment',
      status,
      amount,
      message: status === 'success' 
        ? `Your deposit of ₦${amount.toLocaleString()} was successful`
        : 'Your deposit failed. Please try again.',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Creating notification with data:', notification);

    const docRef = await notificationRef.add(notification);
    console.log('Notification created successfully with ID:', docRef.id);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
} 