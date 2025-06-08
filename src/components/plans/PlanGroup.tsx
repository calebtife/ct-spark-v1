import React, { useState } from 'react';
import type { Plan } from './PlanCard';
import PlanCard from './PlanCard';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface PlanGroupProps {
  title: string;
  description: string;
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  selectedPlanId?: string;
}

const PlanGroup: React.FC<PlanGroupProps> = ({
  title,
  description,
  plans,
  onSelectPlan,
  selectedPlanId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {isExpanded ? (
              <HiChevronUp className="w-6 h-6 text-gray-600" />
            ) : (
              <HiChevronDown className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div 
        className={`grid gap-6 p-6 transition-all duration-300 ${
          isExpanded 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 opacity-100' 
            : 'h-0 p-0 opacity-0'
        }`}
      >
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={onSelectPlan}
            isSelected={plan.id === selectedPlanId}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanGroup; 