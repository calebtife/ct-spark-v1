import React, { useState } from 'react';
import { HiPhone, HiClipboardCopy, HiCheck } from 'react-icons/hi';

interface USSDPaymentProps {
  amount: number;
  reference: string;
}

const USSDPayment: React.FC<USSDPaymentProps> = ({ amount, reference }) => {
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  const ussdCodes = {
    gtb: '*737*1*Amount*ACCT#',
    access: '*901*Amount*ACCT#',
    zenith: '*966*Amount*ACCT#',
    uba: '*919*Amount*ACCT#',
    firstbank: '*894*Amount*ACCT#',
    fidelity: '*770*Amount*ACCT#'
  };

  const bankNames = {
    gtb: 'GTBank',
    access: 'Access Bank',
    zenith: 'Zenith Bank',
    uba: 'UBA',
    firstbank: 'First Bank',
    fidelity: 'Fidelity Bank'
  };

  const generateUSSDCode = (bankCode: string) => {
    const code = ussdCodes[bankCode as keyof typeof ussdCodes];
    return code.replace('Amount', amount.toString()).replace('ACCT', '1234567890');
  };

  const copyUSSDCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <HiPhone className="w-5 h-5" />
        USSD Payment
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select your bank
        </label>
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose your bank</option>
          {Object.entries(bankNames).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {selectedBank && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">USSD Code</h4>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="font-mono text-lg">{generateUSSDCode(selectedBank)}</code>
              <button
                onClick={() => copyUSSDCode(generateUSSDCode(selectedBank))}
                className="text-blue-600 hover:text-blue-800"
              >
                {copiedCode ? (
                  <HiCheck className="w-5 h-5" />
                ) : (
                  <HiClipboardCopy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Dial the USSD code above from your registered phone number</li>
              <li>2. Follow the prompts on your phone</li>
              <li>3. Enter your bank PIN when requested</li>
              <li>4. Confirm the transaction</li>
              <li>5. You'll receive a confirmation SMS</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> USSD charges may apply based on your network provider. 
              The transaction will be processed immediately upon confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default USSDPayment;