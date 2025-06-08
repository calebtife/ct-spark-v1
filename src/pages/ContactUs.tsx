import { useState } from 'react';
import HomeLayout from '../components/layouts/HomeLayout';
import { FaPhone, FaEnvelope, FaInstagram } from 'react-icons/fa'; // Added Instagram icon

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  inquiryType: string;
  subject: string;
  message: string;
}

const ContactUs = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    inquiryType: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { firstName, lastName, email, mobileNumber, inquiryType, subject, message } = formData;

    const mailtoLink = `mailto:info@ct-spark.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      `Name: ${firstName} ${lastName}\nEmail: ${email}\nMobile: ${mobileNumber}\nInquiry Type: ${inquiryType}\n\nMessage:\n${message}`
    )}`;

    try {
      window.location.href = mailtoLink;
      setSuccess('Your message has been prepared in your email client.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        inquiryType: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setError('Failed to open email client. Please ensure you have one configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout 
      title="Contact Us - CT SPARK"
      description="Get in touch with CT SPARK. We're here to help with your inquiries about our services, technical support, or business partnerships."
    >
      <div className=" min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-20 md:pt-0">
          {/* Left Section: Hello and General Inquiries */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-4">Hello</h1>
              <p className="text-gray-700 text-lg">
                We appreciate your interest in CT Spark, and we would love to answer your questions.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">For General Inquiries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg shadow-sm">
                  <FaPhone className="text-blue-600 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-600">MOBILE</p>
                    <p className="text-lg font-semibold text-gray-900">0902 287 41416</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg shadow-sm">
                  <FaEnvelope className="text-blue-600 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-600">EMAIL</p>
                    <p className="text-lg font-semibold text-gray-900">info@ct-spark.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Social media</h3>
              <a 
                href="https://instagram.com/ctspark" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <FaInstagram className="text-2xl" />
                <span>ctspark</span>
              </a>
            </div>
          </div>

          {/* Right Section: Get in Touch with Us Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch with Us</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    id="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700">
                  Inquiry
                </label>
                <select
                  name="inquiryType"
                  id="inquiryType"
                  required
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Inquiry Type</option>
                  <option value="general">General Inquiry</option>
                  <option value="broadband">Business Patnership</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Subject"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Message"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default ContactUs; 