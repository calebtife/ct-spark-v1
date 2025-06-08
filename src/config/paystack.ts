export const PAYSTACK_CONFIG = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  currency: 'NGN',
  minAmount: 100, // Minimum amount in Naira
  maxAmount: 1000000, // Maximum amount in Naira
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
  metadata: {
    custom_fields: [
      {
        display_name: 'Payment For',
        variable_name: 'payment_for',
        value: 'CT SPARK Wallet Deposit'
      }
    ]
  }
}; 