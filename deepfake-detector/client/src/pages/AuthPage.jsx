import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setFormData({ name: '', email: '', password: '' });
    setOtp('');
    setOtpSent(false);
    setShowPassword(false);
  };

  // =========================
  // SEND OTP
  // =========================
  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter your email first.');
      return;
    }

    try {
      setOtpLoading(true);

      await api.post('/api/auth/send-otp', {
        email: formData.email,
      });

      toast.success('OTP sent to your email!');
      setOtpSent(true);
    } catch (error) {
      console.error('OTP send error:', error);
      console.error('Backend response:', error.response?.data);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to send OTP'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // =========================
  // LOGIN / REGISTER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const formDataParams = new URLSearchParams();
        formDataParams.append('username', formData.email);
        formDataParams.append('password', formData.password);

        const response = await api.post('/api/auth/login', formDataParams, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        localStorage.setItem('token', response.data.access_token);

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        // REGISTER WITH OTP
        if (!otpSent) {
          toast.error('Please send OTP first.');
          return;
        }

        if (!otp) {
          toast.error('Please enter the OTP sent to your email.');
          return;
        }

        await api.post('/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: otp,
        });

        toast.success('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({ name: '', email: formData.email, password: '' });
        setOtp('');
        setOtpSent(false);
        setShowPassword(false);
      }
    } catch (error) {
      console.error('Auth error:', error);
      console.error('Backend response:', error.response?.data);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================
const handleGoogleSuccess = useCallback(async (credentialResponse) => {
  if (!credentialResponse?.credential) {
    toast.error('Google credential not received');
    return;
  }

  setGoogleLoading(true);

  try {
    const response = await api.post('/api/auth/google', {
      token: credentialResponse.credential,
    });

    localStorage.setItem(
      'token',
      response.data.access_token || response.data.token
    );

    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    toast.success('Google login successful!');
    navigate('/dashboard');
  } catch (error) {
    console.error('Google auth error:', error);
    console.error('Backend response:', error.response?.data);

    toast.error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        'Google authentication failed'
    );
  } finally {
    setGoogleLoading(false);
  }
}, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950 px-4">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="bg-gray-800/80 p-4 rounded-2xl inline-block shadow-2xl border border-gray-700 backdrop-blur-md mb-4">
            <ShieldCheck className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            AudioGuard
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Deepfake detection platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel p-8 md:p-10 backdrop-blur-xl">
          {/* Toggle */}
          <div className="flex bg-gray-900/50 p-1 rounded-xl mb-8 border border-gray-700/50">
            <button
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isLogin
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                !isLogin
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 overflow-hidden"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="name"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="glass-input"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>

              {!isLogin ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="glass-input"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all min-w-[110px]"
                  >
                    {otpLoading
                      ? 'Sending...'
                      : otpSent
                      ? 'Resend OTP'
                      : 'Send OTP'}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="glass-input"
                    placeholder="you@example.com"
                  />
                </div>
              )}
            </div>

            {/* OTP - only in Register mode */}
            {!isLogin && otpSent && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Enter OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="glass-input"
                    placeholder="6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  OTP expires in 5 minutes.
                </p>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="glass-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <span>Sign In</span>
                  <LogIn className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="mx-4 text-sm text-gray-400">
              {isLogin ? "OR CONTINUE WITH" : "OR SIGN UP WITH"}
            </span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          {/* Google Login */}
          {/* Google Login */}
          <div className="flex justify-center">
            {googleLoading ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text={isLogin ? "signin_with" : "signup_with"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}