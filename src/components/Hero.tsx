import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-6">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          Welcome to <span className="text-[#F7E16C]">CT SPARK</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto animate-fade-in-delay">
          Your trusted partner in digital payments and financial services. Experience seamless transactions with our cutting-edge platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-delay-2">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-[#F7E16C] text-black rounded-lg hover:bg-[#F7E16C]/80 transition-all transform hover:scale-105 text-lg font-semibold shadow-lg"
          >
            Get Started
          </Link>
          <Link 
            to="/about" 
            className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all transform hover:scale-105 text-lg font-semibold"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
    </section>
  );
};

export default Hero; 