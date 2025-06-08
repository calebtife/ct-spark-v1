import React from 'react';
import type { ReviewCardProps } from '../types/review';

const ReviewCard: React.FC<ReviewCardProps> = ({
  name,
  title,
  review,
  role,
  rating = 5,
  imageUrl
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-[350px] mx-auto transform transition-all duration-300 hover:scale-[1.02] hover:bg-white/15">
      {/* Star Rating */}
      <div className="flex justify-center mb-6 text-[#F19645]">
        {[...Array(rating)].map((_, index) => (
          <i key={index} className="bx bxs-star text-xl"></i>
        ))}
      </div>

      {/* Review Text */}
      <p className="text-center text-white/90 mb-8 text-lg leading-relaxed">
        "{review}"
      </p>

      {/* Image and Reviewer Info */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-[#F19645]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F19645] to-[#FF6B6B] flex items-center justify-center text-white text-2xl font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>

        <h3 className="text-center font-bold text-xl text-white mb-1">{name}</h3>
        <p className="text-center text-sm text-white/70">{role}</p>
      </div>
    </div>
  );
};

export default ReviewCard; 