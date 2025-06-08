import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '+234 902 874 1416', 
  message = 'Hello! I need assistance with CT SPARK.'
}) => {
  // Format phone number by removing spaces and + symbol
  const formattedPhoneNumber = phoneNumber.replace(/[\s+]/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Need help? Chat with us!
      </span>
    </a>
  );
};

export default WhatsAppButton; 