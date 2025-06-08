import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import HomeLayout from '../components/layouts/HomeLayout';
import { HiArrowLeft, HiMail } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      let errorMessage = 'An error occurred while sending the reset email.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout
      title="Reset Password - CT SPARK"
      description="Reset your CT SPARK account password securely"
    >
      <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 pt-16 md:pt-0">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form Section */}
          <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#060640] hover:bg-[#0a0a5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-blue-500 transition-colors duration-200"
              >
                <HiArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setEmail('')}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default ForgotPassword; 