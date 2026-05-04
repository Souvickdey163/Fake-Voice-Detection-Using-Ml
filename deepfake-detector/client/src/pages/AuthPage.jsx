import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import toast from 'react-hot-toast';
import api, { API_CONFIG_ERROR, API_URL } from '../services/api';
import { useUser } from '../hooks/useUser';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSession, refreshUser } = useUser();

  const normalizedEmail = formData.email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const handleGoogleLogin = () => {
    if (API_CONFIG_ERROR) {
      console.error(API_CONFIG_ERROR);
      toast.error(API_CONFIG_ERROR);
      return;
    }

    window.location.href = `${API_URL}/api/auth/google`;
  };

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      toast.error(code ? `${error} (${code})` : error);
      navigate('/auth', { replace: true });
      return;
    }

    if (!token) {
      return;
    }

    setSession(token);
    refreshUser()
      .catch(() => null)
      .finally(() => {
        toast.success('Google login successful!');
        navigate('/', { replace: true });
      });
  }, [navigate, refreshUser, searchParams, setSession]);

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
    if (!normalizedEmail) {
      toast.error('Please enter your email first.');
      return;
    }

    if (!isValidEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setOtpLoading(true);

      await api.post(
        '/api/auth/send-otp',
        {
          email: normalizedEmail,
        },
        {
          timeout: 60000,
        }
      );

      toast.success('OTP sent to your email!');
      setOtpSent(true);
    } catch (error) {
      console.error('OTP send error:', error);
      console.error('Backend response:', error.response?.data);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
        error.code === 'ECONNABORTED'
          ? 'OTP request timed out. Please try again in a moment.'
          : 'Failed to send OTP'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // =========================
  // LOGIN / REGISTER
  // =========================
  const handleSubmit = async (e) => {
    console.log('CLICKED');
    console.log('LOGIN FUNCTION RUN');
    console.log('API URL:', API_URL);

    e.preventDefault();

    if (API_CONFIG_ERROR) {
      console.error(API_CONFIG_ERROR);
      toast.error(API_CONFIG_ERROR);
      return;
    }

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

        setSession(response.data.access_token, response.data.user || null);
        await refreshUser().catch(() => null);

        toast.success('Login successful!');
        navigate('/');
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
        navigate('/auth');
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4 py-6 sm:px-6">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-4 inline-block rounded-2xl border border-gray-700 bg-gray-800/80 p-3 shadow-2xl backdrop-blur-md sm:p-4">
            <ShieldCheck className="h-10 w-10 text-blue-500 sm:h-12 sm:w-12" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            NeuroVoice
          </h1>
          <p className="mt-3 text-base text-gray-400 sm:text-lg">
            NeuroVoice platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel p-5 backdrop-blur-xl sm:p-8 md:p-10">
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
            {!isLogin && (
              <div className="space-y-6 overflow-hidden animate-fade-in-up">
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
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>

              {!isLogin ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  <div className="relative min-w-0 flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      title={formData.email}
                      className="glass-input"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !isValidEmail}
                    className="min-h-[48px] rounded-xl bg-blue-600 px-4 font-medium text-white transition-all hover:bg-blue-700 sm:min-w-[130px]"
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
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
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
              onClick={() => console.log('LOGIN BUTTON CLICKED')}
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
            <span className="mx-3 text-center text-xs text-gray-400 sm:mx-4 sm:text-sm">
              {isLogin ? "OR CONTINUE WITH" : "OR SIGN UP WITH"}
            </span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex min-h-10 w-full items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
