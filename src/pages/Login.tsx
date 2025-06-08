import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { LoginFormData, RegisterFormData } from '../types/auth';
import type { Location } from '../types';
import ctLogo from '../assets/images/CT-logo.png'

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    locationId: '',
    agreeTerms: false
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fetchLocations = async () => {
          try {
            const locationsSnapshot = await getDocs(collection(db, 'locations'));
            const locationsData = locationsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Location[];
            setLocations(locationsData);
          } catch (error) {
            console.error('Error fetching locations:', error);
            showMessage('Error loading locations', 'error');
          }
        };

        await fetchLocations();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        showMessage('Error initializing application', 'error');
      }
    };

    initializeApp();
  }, []);

  const showMessage = (text: string, type: 'error' | 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().isAdmin) {
        navigate('/admin');
      } else {
        // Check if user came from plans page
        const from = location.state?.from;
        if (from === '/plans') {
          navigate('/plans');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      let errorMessage = "An error occurred during sign in.";
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password. Please try again.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password.";
          break;
        default:
          errorMessage = error.message;
      }
      
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!registerData.locationId) {
        throw new Error('Please select a location');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: registerData.username,
        email: registerData.email,
        locationId: registerData.locationId,
        balance: 0,
        createdAt: new Date().toISOString()
      });

      showMessage('Registration successful! Please proceed to login.', 'success');
      setIsLogin(true);
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060640] via-[#0a0a5a] to-[#1a1a8f] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#F7E16C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060640] via-[#0a0a5a] to-[#1a1a8f]">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 md:right-10 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 max-w-[90vw] md:max-w-md transform transition-all duration-300 ${
          message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          <i className={`bx ${message.type === 'error' ? 'bx-x-circle' : 'bx-check-circle'} text-xl`}></i>
          <span className="text-sm md:text-base">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="pt-6 md:pt-8 px-4">
        <nav className="flex items-center justify-center">
          <a href="/" className="flex items-center gap-2 md:gap-4">
            <img 
              src={ctLogo} 
              alt="CT-logo" 
              className="w-16 md:w-24 filter sepia saturate-[1000%] hue-rotate-[60deg] animate-pulse"
            />
            <span className="text-3xl md:text-5xl font-bold text-[#F7E16C] animate-pulse">CT SPARK</span>
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
        <div className="w-full max-w-md relative">
          {/* Login Form */}
          <div className={`bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl transition-all duration-500 transform ${
            isLogin ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-full opacity-0 scale-95 absolute'
          }`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <i className="bx bx-envelope absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
                  <input
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <i className="bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    id="password"
                    className="w-full pl-10 pr-12 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <i className={`bx ${showLoginPassword ? 'bx-show' : 'bx-hide'} text-xl`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-white/30 focus:ring-[#F7E16C]"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  />
                  Remember me
                </label>
                <a href="/forgot-password" className="text-[#F7E16C] hover:text-[#F7E16C]/80 text-sm">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-[#F7E16C] text-black py-3 rounded-lg hover:bg-[#F7E16C]/80 transition-colors font-bold flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-white text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-[#F7E16C] hover:text-[#F7E16C]/80 font-bold"
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </p>
            </form>
          </div>

          {/* Register Form */}
          <div className={`bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl transition-all duration-500 transform ${
            isLogin ? 'translate-x-full opacity-0 scale-95 absolute' : 'translate-x-0 opacity-100 scale-100'
          }`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">Create Account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <i className="bx bx-user absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
                  <input
                    type="text"
                    id="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium" htmlFor="register-email">
                  Email
                </label>
                <div className="relative">
                  <i className="bx bx-envelope absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
                  <input
                    type="email"
                    id="register-email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium" htmlFor="register-password">
                  Password
                </label>
                <div className="relative">
                  <i className="bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    id="register-password"
                    className="w-full pl-10 pr-12 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    placeholder="Choose a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <i className={`bx ${showRegisterPassword ? 'bx-show' : 'bx-hide'} text-xl`}></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium" htmlFor="location">
                  Location
                </label>
                <div className="relative">
                  <i className="bx bx-map absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
                  <select
                    id="location"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white appearance-none"
                    value={registerData.locationId}
                    onChange={(e) => setRegisterData({ ...registerData, locationId: e.target.value })}
                    required
                  >
                    <option value="" className="bg-gray-800">Select Location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id} className="bg-gray-800">
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <i className="bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"></i>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-white/30 focus:ring-[#F7E16C]"
                    checked={registerData.agreeTerms}
                    onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                    required
                  />
                  I agree to the terms and conditions
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#F7E16C] text-black py-3 rounded-lg hover:bg-[#F7E16C]/80 transition-colors font-bold flex items-center justify-center gap-2"
                disabled={loading || !registerData.agreeTerms}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  'Register'
                )}
              </button>

              <p className="text-center text-white text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-[#F7E16C] hover:text-[#F7E16C]/80 font-bold"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 