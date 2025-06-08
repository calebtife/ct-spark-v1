import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PlanGroup from './PlanGroup';
import type { Plan } from './PlanCard';
import { toast } from 'react-hot-toast';

// Daily Plans
const dailyPlans: Plan[] = [
  { 
    id: 'novice',
    title: "Novice",
    data: "1GB",
    price: 400,
    validity: "1 Day",
    device: "1"
  },
  { 
    id: 'amateur',
    title: "Amateur",
    data: "3GB",
    price: 1250,
    validity: "3 Days",
    device: "1"
  },
  { 
    id: 'day-king',
    title: "Day King",
    data: "unlimited",
    price: 2150,
    validity: "1 Day",
    device: "1",
    isPopular: true
  }
];

// Weekly Plans
const weeklyPlans: Plan[] = [
  
  { 
    id: 'active',
    title: "ACTIVE",
    data: "5GB",
    price: 2100,
    validity: "7 Days",
    device: "1",
    
  },
  { 
    id: 'beginner',
    title: "Beginner",
    data: "20GB",
    price: 3750,
    validity: "14 Days",
    device: "2",
    isPopular: true
  }
];

// Monthly Plans
const monthlyPlans: Plan[] = [
  { 
    id: 'intermediate',
    title: "Intermediate",
    data: "40GB",
    price: 6500,
    validity: "30 Days",
    device: "2"
  },
  { 
    id: 'proficient',
    title: "Proficient",
    data: "90GB",
    price: 12500,
    validity: "30 Days",
    device: "2",
    isPopular: true
  },
  { 
    id: 'skilled',
    title: "Skilled",
    data: "150GB",
    price: 18800,
    validity: "30 Days",
    device: "2"
  },
  { 
    id: 'advanced',
    title: "Advanced",
    data: "250GB",
    price: 25000,
    validity: "30 Days",
    device: "3"
  },
  { 
    id: 'expert',
    title: "Expert",
    data: "Unlimited",
    price: 31500,
    validity: "30 Days",
    device: "3"
  }
];

// Long Validity Plans
const longValidityPlans: Plan[] = [
  {
    id: 'long-term-1',
    title: "Long Term Basic",
    data: "100GB",
    price: 35000,
    validity: "90 Days",
    device: "2"
  },
  {
    id: 'long-term-2',
    title: "Long Term Plus",
    data: "250GB",
    price: 75000,
    validity: "90 Days",
    device: "3",
    isPopular: true
  },
  {
    id: 'long-term-3',
    title: "Long Term Premium",
    data: "500GB",
    price: 120000,
    validity: "90 Days",
    device: "3"
  }
];

const Plans: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    
    if (!currentUser) {
      toast.error('Please login to purchase a plan');
      navigate('/login', { state: { from: '/plans' } });
      return;
    }

    // Navigate to payment page with selected plan
    navigate('/payment', { state: { plan } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060640] via-[#0a0a5a] to-[#1a1a8f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Select a Data Plan
          </h1>
          {!currentUser && (
            <p className="text-yellow-300 text-sm">
              Please login to purchase a plan
            </p>
          )}
        </div>

        <div className="space-y-8">
          <PlanGroup
            title="Daily Plans"
            description="Perfect for short-term internet needs"
            plans={dailyPlans}
            onSelectPlan={handleSelectPlan}
            selectedPlanId={selectedPlanId}
          />

          <PlanGroup
            title="Weekly Plans"
            description="Ideal for weekly internet usage"
            plans={weeklyPlans}
            onSelectPlan={handleSelectPlan}
            selectedPlanId={selectedPlanId}
          />

          <PlanGroup
            title="Monthly Plans"
            description="Best value for regular internet users"
            plans={monthlyPlans}
            onSelectPlan={handleSelectPlan}
            selectedPlanId={selectedPlanId}
          />

          <PlanGroup
            title="Long Validity Plans"
            description="Extended validity for long-term users"
            plans={longValidityPlans}
            onSelectPlan={handleSelectPlan}
            selectedPlanId={selectedPlanId}
          />
        </div>
      </div>
    </div>
  );
};

export default Plans; 