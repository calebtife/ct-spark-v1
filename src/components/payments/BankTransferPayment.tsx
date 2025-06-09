import React, { useState } from 'react';
import { HiClipboardCopy, HiCheck } from 'react-icons/hi';

interface BankTransferPaymentProps {
  amount: number;
  reference: string;
  onConfirmPayment: () => void;
}

const BankTransferPayment: React.FC<BankTransferPaymentProps> = ({
  amount,
  reference,
  onConfirmPayment
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    bankName: 'First Bank of Nigeria',
    accountNumber: '1234567890',
    accountName: 'CT SPARK TECHNOLOGIES',
    sortCode: '011'
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Bank Transfer Details</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <span className="text-sm text-gray-600">Bank Name</span>
            <p className="font-medium">{bankDetails.bankName}</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <span className="text-sm text-gray-600">Account Number</span>
            <p className="font-medium">{bankDetails.accountNumber}</p>
          </div>
          <button
            onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
            className="text-blue-600 hover:text-blue-800"
          >
            {copiedField === 'account' ? (
              <HiCheck className="w-5 h-5" />
            ) : (
              <HiClipboardCopy className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <span className="text-sm text-gray-600">Account Name</span>
            <p className="font-medium">{bankDetails.accountName}</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <span className="text-sm text-gray-600">Amount</span>
            <p className="font-medium text-green-600">₦{amount.toLocaleString()}</p>
          </div>
          <button
            onClick={() => copyToClipboard(amount.toString(), 'amount')}
            className="text-blue-600 hover:text-blue-800"
          >
            {copiedField === 'amount' ? (
              <HiCheck className="w-5 h-5" />
            ) : (
              <HiClipboardCopy className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <span className="text-sm text-gray-600">Reference</span>
            <p className="font-medium font-mono">{reference}</p>
          </div>
          <button
            onClick={() => copyToClipboard(reference, 'reference')}
            className="text-blue-600 hover:text-blue-800"
          >
            {copiedField === 'reference' ? (
              <HiCheck className="w-5 h-5" />
            ) : (
              <HiClipboardCopy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Please use the reference number "{reference}" when making the transfer. 
          This helps us identify your payment quickly.
        </p>
      </div>

      <button
        onClick={onConfirmPayment}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
      >
        I have made the transfer
      </button>
    </div>
  );
};

export default BankTransferPayment;