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

    // Pass both identifier and type to signIn
    const result = await signIn(identifier, password, loginType);

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

// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Phone } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';

// const LoginPage: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState(''); // ADD THIS
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email'); // ADD THIS
//   const { signIn, parentSignIn } = useAuth(); // ADD parentSignIn
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     // Validate based on login method
//     if (loginMethod === 'email' && !email) {
//       setError('Please enter your email');
//       setLoading(false);
//       return;
//     }
//     if (loginMethod === 'phone' && !phone) {
//       setError('Please enter your phone number');
//       setLoading(false);
//       return;
//     }
//     if (!password) {
//       setError('Please enter your password');
//       setLoading(false);
//       return;
//     }

//     console.log("Sending login request...");

//     let result;
//     if (loginMethod === 'email') {
//       result = await signIn(email, password);
//     } else {
//       result = await parentSignIn(phone, password);
//     }

//     console.log("Login result:", result);

//     if (result.error) {
//       setError(result.error.message);
//       setLoading(false);
//     } else {
//       // Get user from localStorage (saved by AuthContext)
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
//       console.log('User role:', user.role);

//       // Redirect based on role
//       if (user.role === 'super_admin') {
//         navigate('/super-admin');
//       } else if (user.role === 'admin' || user.role === 'school_admin') {
//         navigate('/admin');
//       } else if (user.role === 'teacher') {
//         navigate('/teacher');
//       } else if (user.role === 'parent') {
//         navigate('/parent-dashboard'); // or '/dashboard'
//       } else {
//         navigate('/dashboard');
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
//       <button
//         onClick={() => navigate('/')}
//         className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
//       >
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//         </svg>
//         Back to Search
//       </button>
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-70 h-70 bg-white rounded-2xl mb-6 shadow-sm">
//             <img
//               src="/eduspace-logo.png"
//               alt="Eduspace Logo"
//               className="w-40 h-40 object-contain"
//             />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-gray-500 mt-2">Sign in to access your eduspace portal</p>
//         </div>

//         {/* Login Form */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

//           {/* ADD THIS: Login Method Toggle */}
//           <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
//             <button
//               type="button"
//               onClick={() => setLoginMethod('email')}
//               className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginMethod === 'email'
//                   ? 'bg-white text-blue-600 shadow-sm'
//                   : 'text-gray-600 hover:text-gray-900'
//                 }`}
//             >
//               Email Login
//             </button>
//             <button
//               type="button"
//               onClick={() => setLoginMethod('phone')}
//               className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginMethod === 'phone'
//                   ? 'bg-white text-blue-600 shadow-sm'
//                   : 'text-gray-600 hover:text-gray-900'
//                 }`}
//             >
//               Phone Login
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {error && (
//               <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
//                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
//                 <p className="text-sm">{error}</p>
//               </div>
//             )}

//             {/* Email Field - shown when email login selected */}
//             {loginMethod === 'email' && (
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     id="email"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     disabled={loading}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Phone Field - shown when phone login selected */}
//             {loginMethod === 'phone' && (
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     id="phone"
//                     type="tel"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     placeholder="0999123456"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     disabled={loading}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Forgot Password Link */}
//             <div className="flex justify-end">
//               <Link
//                 to="/forgot-password"
//                 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="relative my-8">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-200" />
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-4 bg-white text-gray-500"></span>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <p className="text-center text-sm text-gray-500 mt-8">
//           By signing in, you agree to our{' '}
//           <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
//           {' '}and{' '}
//           <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';

// const LoginPage: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { signIn } = useAuth();
//   const navigate = useNavigate();


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     if (!email || !password) {
//       setError('Please fill in all fields');
//       setLoading(false);
//       return;
//     }

//     console.log("Sending login request...");
//     const result = await signIn(email, password);
//     console.log("Login result:", result);

//     if (result.error) {
//       setError(result.error.message);
//       setLoading(false);
//     } else {
//       // Get user from localStorage (saved by AuthContext)
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
//       console.log('User role:', user.role);

//       // Redirect based on role - UPDATED VERSION
//       if (user.role === 'super_admin') {
//         navigate('/super-admin');
//       } else if (user.role === 'admin' || user.role === 'school_admin') {
//         navigate('/admin'); // School admins go to regular admin panel
//       } else if (user.role === 'teacher') {
//         navigate('/teacher'); // Teachers go to teacher panel
//       } else if (user.role === 'parent') {  // ADD THIS
//         navigate('/parent-dashboard');     // or '/dashboard'

//       } else {
//         navigate('/dashboard'); // Regular users/parents
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
//       <button
//         onClick={() => navigate('/')}  // Changed from navigate(-1) to navigate('/')
//         className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
//       >
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//         </svg>
//         Back to Search
//       </button>
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         {/* <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
//             <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-gray-500 mt-2">Sign in to access your eduspace portal</p>
//         </div> */}

//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-70 h-70 bg-white rounded-2xl mb-6 shadow-sm">
//             <img
//               src="/eduspace-logo.png"
//               alt="Eduspace Logo"
//               className="w-40 h-40 object-contain"
//             />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-gray-500 mt-2">Sign in to access your eduspace portal</p>
//         </div>

//         {/* Login Form */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {error && (
//               <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
//                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
//                 <p className="text-sm">{error}</p>
//               </div>
//             )}

//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                   className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Forgot Password Link */}
//             <div className="flex justify-end">
//               <Link
//                 to="/forgot-password"
//                 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="relative my-8">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-200" />
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-4 bg-white text-gray-500"></span>
//             </div>
//           </div>

//           {/* Sign Up Link */}
//           {/* <Link
//             to="/signup"
//             className="block w-full py-3 text-center border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
//           >
//             Create an Account
//           </Link> */}
//         </div>

//         {/* Footer */}
//         <p className="text-center text-sm text-gray-500 mt-8">
//           By signing in, you agree to our{' '}
//           <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
//           {' '}and{' '}
//           <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
