import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '../common/Header';
import Footer from '../common/Footer';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Single field for email OR phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(); // Use one signIn method that handles both
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);

  // Simple validation to check if input looks like email or phone
  const isEmail = (input: string) => {
    return input.includes('@') && input.includes('.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!identifier) {
      setError('Please enter your email or phone number');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    console.log("Sending login request with:", identifier);

// Determine if it's email or phone
const loginType = isEmail(identifier) ? 'email' : 'phone';

// Get schoolId from localStorage (set by useSchoolBranding)
const schoolId = localStorage.getItem('currentSchoolId');

// Pass both identifier and type to signIn
const result = await signIn(identifier, password, loginType, schoolId);

    console.log("Login result:", result);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User role:', user.role);

      if (user.role === 'super_admin') {
        navigate('/super-admin');
      } else if (user.role === 'admin' || user.role === 'school_admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher');
      } else if (user.role === 'parent') {
        navigate('/parent-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Detect input type to show appropriate icon
  const getInputIcon = () => {
    if (!identifier) return <Mail className="w-5 h-5 text-gray-400" />;
    return isEmail(identifier)
      ? <Mail className="w-5 h-5 text-gray-400" />
      : <Phone className="w-5 h-5 text-gray-400" />;
  };

  // Get placeholder text
  const getPlaceholder = () => {
    return "Email or Phone number";
  };

  return (
    <>  <Header 
  onShowAdmin={() => setShowAdmin(true)}
  hasSuccessfulSearch={false}
  currentView="search"
  onNavigate={() => {}}
/>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">

        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </button>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-70 h-70 bg-white rounded-2xl mb-6 shadow-sm">
            <img
              src="/eduspace-logo.png"
              alt="Eduspace Logo"
              className="w-40 h-40 object-contain"
            />
          </div> */}
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to access your portal</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Single Identifier Field (Email or Phone) */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {getInputIcon()}
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your email address or phone number
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;