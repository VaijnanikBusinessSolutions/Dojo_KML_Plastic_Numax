// src/components/pages/LoginPage/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { login } from '../../hooks/useAuth';
import NLlogo from '../../../assets/Images/nl_technologies_logo.png';
import Welcomeimage from '../../../assets/Images/jpeg.jpg';

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email: boolean;
  password: boolean;
}

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({
    email: false,
    password: false,
  });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password } = formData;
    const newErrors: LoginFormErrors = {
      email: !email.trim(),
      password: !password.trim(),
    };

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      const resultAction = await dispatch(login(formData) as any);

      if (login.fulfilled.match(resultAction)) {
        setFormData({ email: '', password: '' });
        // Navigate handled by useEffect
      } else if (login.rejected.match(resultAction)) {
        setError((resultAction.payload as string) || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-800 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            // src="/jpeg.jpg"
            src={Welcomeimage}
            alt="DOJO Training Room"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-slate-800/40"></div>
        </div>

        {/* <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white"> */}
        <div className="relative z-10 flex flex-row justify-between h-full p-12 text-white">
            <div className='px-11'></div>

          <div className='py-28'>
            <div className="text-center max-w-lg mx-auto">
              <h1 className="text-6xl font-bold mb-12 text-white drop-shadow-2xl">
                DOJO 2.0
              </h1>
              <div className="space-y-8 text-2xl">
                <p className="font-bold text-white tracking-wide drop-shadow-2xl">
                  Digital Operations Excellence
                </p>
                <p className="font-semibold text-white tracking-wide drop-shadow-2xl">
                  Skill Development Platform
                </p>
                <p className="text-white leading-relaxed font-medium max-w-md mx-auto drop-shadow-2xl text-xl">
                  Empowering Industrial Excellence Through Digital Transformation
                </p>
              </div>
            </div>
            {/* <div className="text-center">
              <p className="text-sm text-white font-medium drop-shadow-lg">
                NL Technologies Pvt.Ltd Pvt Ltd
              </p>
              <p className="text-xs text-white/90 mt-1 drop-shadow-lg">
                Industrial Training Solutions
              </p>
            </div> */}
          </div>


          <div className="px-11"></div>
        </div>

 


        <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-teal-500/10 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="mb-6">
                <img
                  // src="/nl_technologies_logo.png"
                  src={NLlogo}
                  alt="NL Technologies Pvt.Ltd"
                  className="h-16 w-auto mx-auto mb-4"
                />
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome
              </h2>
              <p className="text-gray-600">Sign in to access DOJO 2.0</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isAuthenticated && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Welcome {user?.first_name} {user?.last_name} 🎉
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:border-transparent ${
                      errors.email
                        ? 'border border-red-500 focus:ring-red-500'
                        : 'border border-gray-300 focus:ring-emerald-500'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">Email is required.</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg transition-all duration-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:border-transparent ${
                      errors.password
                        ? 'border border-red-500 focus:ring-red-500'
                        : 'border border-gray-300 focus:ring-emerald-500'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-emerald-600 transition-colors duration-200 disabled:opacity-50"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    Password is required.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/resetpassword"
                className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} NL Technologies Pvt.Ltd Pvt Ltd. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;







// // src/components/pages/LoginPage/LoginPage.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { Card } from '../../molecules/Card/Card';
// import { FormField } from '../../molecules/FormField/FormField';
// import { PasswordField } from '../../molecules/PasswordField/PasswordField';
// import { Typography } from '../../atoms/Typography/Typography';
// import { ErrorMessage } from '../../molecules/ErrorMessage/ErrorMessage';
// import type { RootState } from '../../../store/store';
// import { login } from '../../hooks/useAuth';
// import { Button } from '../../atoms/Buttons/Button';

// interface LoginFormState {
//   email: string;
//   password: string;
// }

// interface LoginFormErrors {
//   email: boolean;
//   password: boolean;
// }

// export const LoginPage: React.FC = () => {
//   const [formData, setFormData] = useState<LoginFormState>({
//     email: '',
//     password: ''
//   });

//   const [errors, setErrors] = useState<LoginFormErrors>({
//     email: false,
//     password: false
//   });

//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // Get auth state from Redux
//   const { loading, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
//   console.log(user)
//   // Redirect when authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/home');
//     }
//   }, [isAuthenticated, navigate]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     setErrors(prev => ({
//       ...prev,
//       [name]: false
//     }));

//     if (error) {
//       setError(null);
//     }
//   };

//   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const { email, password } = formData;
//     const newErrors: LoginFormErrors = {
//       email: !email.trim(),
//       password: !password.trim(),
//     };

//     if (newErrors.email || newErrors.password) {
//       setErrors(newErrors);
//       return;
//     }

//     try {
//       // Dispatch the login action
//       const resultAction = await dispatch(login(formData) as any);

//       if (login.fulfilled.match(resultAction)) {
//         // Login successful - navigation is handled by useEffect
//         setFormData({
//           email: '',
//           password: ''
//         });
//       } else if (login.rejected.match(resultAction)) {
//         // Login failed
//         setError(resultAction.payload as string || 'Login failed');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Login failed');
//       console.error('Login failed:', err);
//     }
//   };

//   return (
//     <div className='flex justify-center items-center min-h-screen w-full bg-gray-50'>
//       <Card className="w-full max-w-md p-8">
//         <div className="flex flex-col items-center mb-6">
//           <Typography variant="h3" className="text-2xl">
//             Login here
//           </Typography>
//         </div>

//         <form onSubmit={handleLogin}>
//           <FormField
//             label="Email"
//             name="email"
//             placeholder="Enter email"
//             value={formData.email}
//             hasError={errors.email}
//             disabled={loading}
//             onChange={handleInputChange}
//           />

//           <PasswordField
//             label="Password"
//             name="password"
//             placeholder="Enter Password"
//             value={formData.password}
//             hasError={errors.password}
//             disabled={loading}
//             onChange={handleInputChange}
//           />

//           {error && <ErrorMessage message={error} />}

//           {/* Welcome message for authenticated users */}
//           {isAuthenticated && (
//             <div className="text-green-600 mt-3 text-center">
//               Welcome {user?.first_name} {user?.last_name} 🎉
//             </div>
//           )}

//           <div className="flex flex-col items-center">
//             <Button
//               type="submit"
//               variant="primary"
//               disabled={loading}
//               loading={loading}
//               className="w-full"
//             >
//               Login
//             </Button>

//             <Typography
//               href="/resetpassword"
//               className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out"
//             >
//               Forgot Password?
//             </Typography>
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// };