import React from 'react';

export interface Plan {
  id: string;
  title: string;
  data: string;
  speed?: string;
  price: number;
  validity: string;
  device: string;
  isPopular?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isSelected?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isSelected }) => {
  return (
    <div 
      className={`relative bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-[#F7E16C]' : ''
      } ${plan.isPopular ? 'border-2 border-[#F7E16C]' : ''}`}
    >
      {plan.isPopular && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#F7E16C] text-black px-3 py-0.5 rounded-full text-xs font-bold">
          Popular
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.title}</h3>
        
        <div className="mb-3">
          <span className="text-2xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
          <span className="text-gray-500 text-sm">/{plan.validity}</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-sm">Data:</span>
            <span className="font-medium">{plan.data}</span>
          </div>
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-sm">Devices:</span>
            <span className="font-medium">{plan.device}</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(plan)}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isSelected 
              ? 'bg-[#F7E16C] text-black' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </button>
      </div>
    </div>
  );
};

export default PlanCard; 