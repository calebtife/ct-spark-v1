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
    <div className="bg-white shadow-lg rounded-lg p-6 w-[350px] transform transition-transform hover:scale-105">
      {/* Star Rating */}
      <div className="flex justify-center mb-4 text-orange-400">
        {[...Array(rating)].map((_, index) => (
          <i key={index} className="bx bxs-star bx-sm"></i>
        ))}
      </div>

      {/* Review Title */}
      <h2 className="text-center font-bold text-lg mb-4">{title}</h2>

      {/* Review Text */}
      <p className="text-center text-gray-600 mb-6">
        {review}
      </p>

      {/* Image */}
      <div className="flex justify-center mb-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        )}
      </div>

      {/* Reviewer Info */}
      <h3 className="text-center font-bold text-md">{name}</h3>
      <p className="text-center text-sm text-gray-500">{role}</p>
    </div>
  );
};

export default ReviewCard; 