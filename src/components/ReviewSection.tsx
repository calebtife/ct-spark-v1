import React, { useState, useEffect } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  return (
    <section id="reviews" className="pt-[100px] pb-[100px] bg-[#000000] overflow-hidden">
      <div className="container mx-auto px-4">
        <ReviewHeader 
          subtitle="TESTIMONIALS"
          title="What Our Clients Say About Us"
        />
        
        <div className="relative max-w-7xl mx-auto">
          {/* Carousel Container */}
          <div className="relative h-[500px] md:h-[400px]">
            <div 
              className="absolute w-full transition-all duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              <div className="flex gap-6 px-4">
                {reviews.map((review, index) => (
                  <div 
                    key={review.id}
                    className="w-full flex-shrink-0"
                    style={{ width: '100%' }}
                  >
                    <ReviewCard
                      name={review.name}
                      title={review.title}
                      review={review.review}
                      role={review.role}
                      rating={review.rating}
                      imageUrl={review.imageUrl}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Previous review"
            >
              <i className="bx bx-chevron-left text-2xl text-white"></i>
            </button>
            
            {/* Dots Indicator */}
            <div className="flex gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentIndex === index ? 'bg-[#F19645] w-4' : 'bg-white/30'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Next review"
            >
              <i className="bx bx-chevron-right text-2xl text-white"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection; 