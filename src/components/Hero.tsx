import { Link } from 'react-router-dom';
import Phone from '../assets/images/mockup.png'

const Hero = () => {
  return (
    <section className="relative min-h-[calc(100vh-64px)] mt-16 flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 relative z-10">
        <div className="text-center lg:text-left w-full lg:w-1/2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6">
            <span className="inline-block opacity-0 animate-[fadeIn_1.5s_ease-in-out_0.2s_forwards]">Stay Connected</span>{' '}
            <span className="inline-block text-yellow-400 animate-bounce">always</span>{' '}
            <span className="inline-block text-gray-300 opacity-0 animate-[fadeIn_1.5s_ease-in-out_1.8s_forwards]">with our</span>{' '}
            <span className="inline-block text-cyan-400 opacity-0 animate-[slideIn_1.5s_ease-in-out_2.6s_forwards]">High speed</span>{' '}
            <span className="inline-block opacity-0 animate-[zoomIn_1.5s_ease-in-out_3.4s_forwards]">internet plans</span>
            {/* <span className="inline-block animate-fade-in">Welcome to</span>{' '}
            <span className="inline-block text-[#F7E16C] animate-slide-in-right">CT SPARK</span> */}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 max-w-3xl mx-auto lg:mx-0 animate-fade-in-up">
            High speed internet plans for your home and business
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#F7E16C] text-black rounded-lg hover:bg-[#F7E16C]/80 transition-all transform hover:scale-105 text-base sm:text-lg font-semibold shadow-lg animate-fade-in-up-delay-1"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all transform hover:scale-105 text-base sm:text-lg font-semibold animate-fade-in-up-delay-2"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Phone Image */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] animate-float">
          <img
            src={Phone}
            alt="CT SPARK Dashboard Preview"
            className="w-full h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
    </section>
  );
};

export default Hero; 