import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { LoginFormData, RegisterFormData } from '../types/auth';
import type { Location } from '../types';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

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

    fetchLocations();
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
        navigate('/dashboard');
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

  return (
    <div className="min-h-screen bg-[url('/assets/spacejpeg.jpg')] bg-cover bg-center bg-no-repeat">
      {message && (
        <div className={`fixed top-4 right-10 z-50 p-4 rounded-md shadow-lg flex items-center gap-2 ${
          message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          <i className={`bx ${message.type === 'error' ? 'bx-x-circle' : 'bx-check-circle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      <header className="mt-8">
        <nav className="flex items-center justify-center bg-transparent w-full">
          <a href="/" className="flex items-center font-bold text-6xl text-[#F7E16C]">
            <img src="/assets/CT-logo.png" alt="CT-logo" className="w-[150px] filter sepia saturate-[1000%] hue-rotate-[60deg]" />
            CT SPARK
          </a>
        </nav>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className={`bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md transition-all duration-500 ${
          isLogin ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-white/30 focus:ring-[#F7E16C]"
                  checked={loginData.rememberMe}
                  onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-[#F7E16C] hover:text-[#F7E16C]/80">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-[#F7E16C] text-black py-2 rounded-lg hover:bg-[#F7E16C]/80 transition-colors font-bold"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="mt-4 text-center text-white">
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

        <div className={`bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md transition-all duration-500 ${
          isLogin ? 'translate-x-full' : 'translate-x-0'
        }`}>
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
                placeholder="Choose a username"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="register-email">
                Email
              </label>
              <input
                type="email"
                id="register-email"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="register-password">
                Password
              </label>
              <input
                type="password"
                id="register-password"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white placeholder-white/50"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                placeholder="Choose a password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="location">
                Location
              </label>
              <select
                id="location"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7E16C] text-white"
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
            </div>
            <div className="mb-6">
              <label className="flex items-center text-white">
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
              className="w-full bg-[#F7E16C] text-black py-2 rounded-lg hover:bg-[#F7E16C]/80 transition-colors font-bold"
              disabled={loading || !registerData.agreeTerms}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            <p className="mt-4 text-center text-white">
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
  );
};

export default Login; 