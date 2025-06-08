import React from 'react';
import HomeLayout from '../components/layouts/HomeLayout';
import Plans from '../components/plans/Plans';

const PlansPage: React.FC = () => {
  return (
    <HomeLayout
      title="Data Plans - CT SPARK"
      description="Choose from our wide range of data plans. From daily to monthly plans, find the perfect package for your internet needs."
    >
      <div className='min-h-screen pt-16 md:pt-0'>
        <Plans />
      </div>
    </HomeLayout>
  );
};

export default PlansPage; 