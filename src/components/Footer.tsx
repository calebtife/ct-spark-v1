import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 backdrop-blur-md py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h4 className="text-[#F7E16C] font-bold mb-4">CT SPARK</h4>
            <p className="text-white/80">
              Your trusted partner in digital payments and financial services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-white/80 hover:text-[#F7E16C] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-white/80 hover:text-[#F7E16C] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-[#F7E16C] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-white/80">
              <li>Email: support@ctspark.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Spark Street, Digital City</li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-white/80 hover:text-[#F7E16C] transition-colors"
                aria-label="Facebook"
              >
                <i className="bx bxl-facebook text-2xl"></i>
              </a>
              <a 
                href="#" 
                className="text-white/80 hover:text-[#F7E16C] transition-colors"
                aria-label="Twitter"
              >
                <i className="bx bxl-twitter text-2xl"></i>
              </a>
              <a 
                href="#" 
                className="text-white/80 hover:text-[#F7E16C] transition-colors"
                aria-label="Instagram"
              >
                <i className="bx bxl-instagram text-2xl"></i>
              </a>
              <a 
                href="#" 
                className="text-white/80 hover:text-[#F7E16C] transition-colors"
                aria-label="LinkedIn"
              >
                <i className="bx bxl-linkedin text-2xl"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60">
          <p>&copy; {currentYear} CT SPARK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 