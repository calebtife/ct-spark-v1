import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'crypto';
import axios from 'axios';

// Validate required environment variables
const requiredEnvVars = {
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// Use ES module export
const handler = async (req: VercelRequest, res: VercelResponse) => {
  console.log('=== Webhook Received ===');
  console.log('Event Type:', req.body?.event);
  console.log('Reference:', req.body?.data?.reference);

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the signature from the headers
  const signature = req.headers['x-paystack-signature'];
  if (!signature) {
    console.error('No Paystack signature found in request');
    return res.status(401).json({ error: 'No signature found' });
  }

  // Verify the signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    console.error('Invalid Paystack signature');
    console.log('Expected:', hash);
    console.log('Received:', signature);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log('Signature verified successfully');

  // Get the event from the request body
  const event = req.body;

  try {
    console.log('Verifying transaction with Paystack...');
    // Verify the event with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${event.data.reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    console.log('Paystack verification response status:', response.status);
    const verificationData = response.data.data;
    console.log('Transaction status from Paystack:', verificationData.status);

    // Process the event based on its type
    switch (event.event) {
      case 'charge.success': {
        console.log('Processing successful charge...');
        const { reference, amount, customer } = event.data;
        const amountInNaira = amount / 100; // Convert from kobo to Naira

        // Get transaction details by querying for the reference
        const transactionsRef = db.collection('transactions');
        const querySnapshot = await transactionsRef.where('reference', '==', reference).get();

        if (querySnapshot.empty) {
          console.error('Transaction not found:', reference);
          return res.status(404).json({ error: 'Transaction not found' });
        }

        // Get the first matching transaction
        const transactionDoc = querySnapshot.docs[0];
        const transactionData = transactionDoc.data();
        console.log('Current transaction status:', transactionData?.status);
        const userId = transactionData?.userId;

        if (!userId) {
          console.error('User ID not found in transaction:', reference);
          return res.status(400).json({ error: 'User ID not found in transaction' });
        }

        console.log('Updating user balance...');
        // Update user balance
        const userRef = db.collection('users').doc(userId);
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists) {
            throw new Error('User not found');
          }

          const currentBalance = userDoc.data()?.balance || 0;
          transaction.update(userRef, {
            balance: currentBalance + amountInNaira,
            lastDepositAt: new Date(),
          });
        });

        console.log('Updating transaction status...');
        // Update transaction status
        await transactionDoc.ref.update({
          status: 'success',
          verifiedAt: new Date(),
          paymentDetails: {
            gateway: 'paystack',
            reference,
            amount: amountInNaira,
            customerEmail: customer.email,
            paidAt: new Date(),
            customer: customer,
            verificationData: verificationData
          }
        });

        console.log('Sending notification...');
        // Send notification
        await db.collection('users').doc(userId).collection('notifications').add({
          type: 'payment',
          status: 'success',
          amount: amountInNaira,
          message: `Your deposit of ₦${amountInNaira.toLocaleString()} was successful`,
          read: false,
          createdAt: new Date()
        });

        console.log('Successfully processed payment');
        break;
      }

      case 'charge.failed': {
        console.log('Processing failed charge...');
        const { reference, customer } = event.data;
        
        // Get transaction details by querying for the reference
        const transactionsRef = db.collection('transactions');
        const querySnapshot = await transactionsRef.where('reference', '==', reference).get();

        if (querySnapshot.empty) {
          console.error('Transaction not found:', reference);
          return res.status(404).json({ error: 'Transaction not found' });
        }

        // Get the first matching transaction
        const transactionDoc = querySnapshot.docs[0];
        const transactionData = transactionDoc.data();
        console.log('Current transaction status:', transactionData?.status);
        const userId = transactionData?.userId;

        console.log('Updating transaction status...');
        // Update transaction status
        await transactionDoc.ref.update({
          status: 'failed',
          verifiedAt: new Date(),
          paymentDetails: {
            gateway: 'paystack',
            reference,
            failedAt: new Date(),
            customer: customer,
            failureReason: event.data.gateway_response || 'Payment failed',
            verificationData: verificationData
          }
        });

        // Send notification if we have the user ID
        if (userId) {
          console.log('Sending failure notification...');
          await db.collection('notifications').add({
            userId,
            type: 'payment',
            status: 'failed',
            amount: 0,
            message: 'Your deposit failed. Please try again.',
            read: false,
            createdAt: new Date()
          });
        }

        console.log('Successfully processed failed payment');
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Always return a 200 response to acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to acknowledge receipt, but log the error
    return res.status(200).json({ received: true, error: 'Error processing webhook' });
  }
};

// Export the handler as default
export default handler; 