import React from 'react';
import type { ReviewHeaderProps } from '../types/review';

const ReviewHeader: React.FC<ReviewHeaderProps> = ({ subtitle, title }) => {
  return (
    <div className="flex flex-col items-center text-center mb-12">
      <p className="text-[#F19645] text-[14px] md:text-[24px] leading-[20px] font-semibold">
        {subtitle}
      </p>
      <h1 className="text-[34px] md:text-[54px] font-extrabold font-[montserrat] mb-6 text-white leading-[54px] md:leading-[64px]">
        {title}
      </h1>
    </div>
  );
};

export default ReviewHeader; 