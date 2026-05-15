import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Mic,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { API_CONFIG_ERROR, API_URL } from '../services/api';
import { useUser } from '../hooks/useUser';
import LoadingIndicator from '../components/LoadingIndicator';

const authHighlights = [
  'Secure access to prediction history and saved reports',
  'OTP verified account creation for cleaner onboarding',
  'Private detection workspace with plan and credit controls',
];

const authStats = [
  { label: 'Auth layer', value: 'Protected' },
  { label: 'Verification', value: 'OTP + Google' },
  { label: 'Experience', value: 'Premium' },
];

export default function AuthPage() {
  const [view, setView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [registerOtp, setRegisterOtp] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetOtpLoading, setResetOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSession, refreshUser } = useUser();

  const normalizedEmail = formData.email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isLogin = view === 'login';
  const isRegister = view === 'register';
  const isForgot = view === 'forgot';

  const authCopy = useMemo(() => {
    if (isRegister) {
      return {
        eyebrow: 'Create your workspace',
        title: 'Secure your NeuroVoice account',
        subtitle: 'Register with email verification and unlock your protected deepfake detection workspace.',
        submitLabel: 'Create Account',
        submitIcon: UserPlus,
      };
    }

    if (isForgot) {
      return {
        eyebrow: 'Password recovery',
        title: 'Reset access with email OTP',
        subtitle: 'Verify your email with a one-time code and set a new password without leaving the page.',
        submitLabel: 'Reset Password',
        submitIcon: KeyRound,
      };
    }

    return {
      eyebrow: 'Welcome back',
      title: 'Sign in to NeuroVoice',
      subtitle: 'Access your dashboard, credits, prediction history, and AI voice analysis tools.',
      submitLabel: 'Sign In',
      submitIcon: LogIn,
    };
  }, [isForgot, isRegister]);

  const handleGoogleLogin = () => {
    if (API_CONFIG_ERROR) {
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

  const resetTransientState = () => {
    setRegisterOtp('');
    setResetOtp('');
    setRegisterOtpSent(false);
    setResetOtpSent(false);
    setShowPassword(false);
    setShowResetPassword(false);
  };

  const switchView = (nextView) => {
    setView(nextView);
    resetTransientState();
    setFormData((current) => ({
      name: '',
      email: current.email,
      password: '',
      confirmPassword: '',
    }));
  };

  const handleInputChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSendRegisterOtp = async () => {
    if (!isValidEmail) {
      toast.error('Enter a valid email address first.');
      return;
    }

    try {
      setOtpLoading(true);
      await api.post('/api/auth/send-otp', { email: normalizedEmail }, { timeout: 60000 });
      setRegisterOtpSent(true);
      toast.success('Registration OTP sent to your email.');
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          (error.code === 'ECONNABORTED'
            ? 'OTP request timed out. Please try again.'
            : 'Failed to send OTP.')
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    if (!isValidEmail) {
      toast.error('Enter a valid email address first.');
      return;
    }

    try {
      setResetOtpLoading(true);
      await api.post('/api/auth/forgot-password/send-otp', { email: normalizedEmail }, { timeout: 60000 });
      setResetOtpSent(true);
      toast.success('Password reset OTP sent to your email.');
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          (error.code === 'ECONNABORTED'
            ? 'OTP request timed out. Please try again.'
            : 'Failed to send reset OTP.')
      );
    } finally {
      setResetOtpLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (API_CONFIG_ERROR) {
      toast.error(API_CONFIG_ERROR);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const formDataParams = new URLSearchParams();
        formDataParams.append('username', normalizedEmail);
        formDataParams.append('password', formData.password);

        const response = await api.post('/api/auth/login', formDataParams, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        setSession(response.data.access_token, response.data.user || null);
        await refreshUser().catch(() => null);
        toast.success('Login successful!');
        navigate('/');
        return;
      }

      if (isRegister) {
        if (!registerOtpSent) {
          toast.error('Send OTP before creating your account.');
          return;
        }

        if (!registerOtp) {
          toast.error('Enter the OTP sent to your email.');
          return;
        }

        await api.post('/api/auth/register', {
          name: formData.name,
          email: normalizedEmail,
          password: formData.password,
          otp: registerOtp,
        });

        toast.success('Registration successful. Please sign in.');
        switchView('login');
        setFormData({ name: '', email: normalizedEmail, password: '', confirmPassword: '' });
        return;
      }

      if (!resetOtpSent) {
        toast.error('Send reset OTP before changing your password.');
        return;
      }

      if (!resetOtp) {
        toast.error('Enter the OTP sent to your email.');
        return;
      }

      await api.post('/api/auth/forgot-password/reset', {
        email: normalizedEmail,
        otp: resetOtp,
        password: formData.password,
      });

      toast.success('Password reset successful. Please sign in.');
      switchView('login');
      setFormData({ name: '', email: normalizedEmail, password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const SubmitIcon = authCopy.submitIcon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-[8%] h-56 w-56 rounded-full bg-cyan-400/12 blur-[110px]" />
        <div className="absolute right-[8%] top-[10%] h-72 w-72 rounded-full bg-violet-500/14 blur-[130px]" />
        <div className="absolute bottom-[4%] left-[28%] h-80 w-80 rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="premium-card shine-overlay overflow-hidden p-6 sm:p-8 lg:p-10"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-[1.7rem] border border-white/12 bg-gradient-to-br from-blue-500 to-violet-500 p-4 shadow-[0_0_40px_rgba(59,130,246,0.22)]">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">NeuroVoice Access</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Secure <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">entry</span> into your AI detection workspace
              </h1>
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Your account gives you access to prediction reports, usage history, credits, and a private dashboard for analyzing suspicious audio with confidence.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {authStats.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -6, rotateX: 6, rotateY: -4 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5"
              >
                <div className="text-xl font-semibold text-white">{item.value}</div>
                <div className="mt-2 text-sm text-slate-400">{item.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(11,17,32,0.94),rgba(16,24,45,0.72))] p-5 shadow-[0_24px_70px_rgba(2,8,23,0.42)]">
              <div className="rounded-[24px] border border-cyan-300/12 bg-slate-950/80 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Identity Shield</p>
                    <p className="mt-3 text-2xl font-semibold text-white">Protected Session</p>
                  </div>
                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-8 h-2 rounded-full bg-white/8">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                  <span>Verification</span>
                  <span>Active</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Why this matters</p>
              <div className="mt-5 space-y-4">
                {authHighlights.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-7 text-slate-300 sm:text-base">
                    <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="glass-panel overflow-hidden border-white/12 bg-slate-950/70 p-5 sm:p-8 lg:p-9"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">{authCopy.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-4xl">{authCopy.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{authCopy.subtitle}</p>
            </div>
            {isForgot && (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 transition-all hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            )}
          </div>

          <div className="mt-8 flex rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-1.5">
            <button
              type="button"
              onClick={() => switchView('login')}
              className={`flex-1 rounded-[1rem] px-4 py-3 text-sm font-medium transition-all ${
                isLogin ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchView('register')}
              className={`flex-1 rounded-[1rem] px-4 py-3 text-sm font-medium transition-all ${
                isRegister ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.2)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="glass-input rounded-2xl"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              {(isRegister || isForgot) ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      className="glass-input rounded-2xl"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={isRegister ? handleSendRegisterOtp : handleSendResetOtp}
                    disabled={(isRegister ? otpLoading : resetOtpLoading) || !isValidEmail}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-white shadow-[0_0_24px_rgba(34,211,238,0.18)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[150px]"
                  >
                    {(isRegister ? otpLoading : resetOtpLoading) ? (
                      <LoadingIndicator label="Sending..." />
                    ) : isRegister ? (
                      registerOtpSent ? 'Resend OTP' : 'Send OTP'
                    ) : (
                      resetOtpSent ? 'Resend OTP' : 'Send OTP'
                    )}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    className="glass-input rounded-2xl"
                    placeholder="you@example.com"
                  />
                </div>
              )}
            </div>

            {isRegister && registerOtpSent && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Registration OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={registerOtp}
                    onChange={(event) => setRegisterOtp(event.target.value.replace(/\D/g, ''))}
                    className="glass-input rounded-2xl"
                    placeholder="6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-slate-400">OTP expires in 5 minutes.</p>
              </div>
            )}

            {isForgot && resetOtpSent && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Reset OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={resetOtp}
                    onChange={(event) => setResetOtp(event.target.value.replace(/\D/g, ''))}
                    className="glass-input rounded-2xl"
                    placeholder="6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-slate-400">Use the OTP from your email to continue password reset.</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {isForgot ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="glass-input rounded-2xl"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="glass-input rounded-2xl"
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition-colors hover:text-white"
                  >
                    {showResetPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="text-sm text-cyan-200 transition-colors hover:text-white"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 text-base font-medium text-white shadow-[0_0_35px_rgba(59,130,246,0.24)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoadingIndicator label={authCopy.submitLabel} />
              ) : (
                <>
                  <span>{authCopy.submitLabel}</span>
                  <SubmitIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {!isForgot && (
            <>
              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-white/10" />
                <span className="mx-4 text-xs uppercase tracking-[0.25em] text-slate-500">
                  {isLogin ? 'Or continue with' : 'Or sign up with'}
                </span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white px-4 text-sm font-medium text-slate-900 transition-all hover:bg-slate-100"
              >
                {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
              </button>
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
}
