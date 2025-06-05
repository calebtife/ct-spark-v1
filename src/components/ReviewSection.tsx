import React from 'react';
import ReviewCard from './ReviewCard';
import ReviewHeader from './ReviewHeader';
import type { Review } from '../types/review';

const reviews: Review[] = [
  {
    id: 1,
    name: "David Ojo",
    title: "David's Review",
    review: "CT Spark's reliable high-speed internet was a game-changer for my studies. It made online classes, research, and group projects seamless. Thanks to CT Spark, staying on top of my schoolwork has never been easier!",
    role: "Final-Year Thesis Research",
    rating: 5
  },
  {
    id: 2,
    name: "Caleb Tife",
    title: "Caleb's Review",
    review: "CT Spark's high-speed internet has been a lifesaver for my remote IT work. It's fast, reliable, and ensures I stay connected for video calls, large file transfers, and troubleshooting tasks. Working from home has never been this smooth!",
    role: "Remote IT Support",
    rating: 5
  },
  {
    id: 3,
    name: "Covenant Samuel",
    title: "Covenant's Review",
    review: "CT Spark's high-speed internet has been a game-changer for my online business. It's fast, reliable, and ensures I stay connected for video calls, large file transfers, and troubleshooting tasks. Working from home has never been this smooth!",
    role: "Streamer & Content Creator",
    rating: 5
  }
];

const ReviewSection: React.FC = () => {
  return (
    <section id="reviews" className="pt-[100px] pb-[100px] bg-[#000000]">
      <div className="container mx-auto px-4">
        <ReviewHeader 
          subtitle="TESTIMONIALS"
          title="What Our Clients Say About Us"
        />
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              title={review.title}
              review={review.review}
              role={review.role}
              rating={review.rating}
              imageUrl={review.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection; 