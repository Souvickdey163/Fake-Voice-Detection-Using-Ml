import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mic,
  LayoutDashboard,
  History,
  LogOut,
  Sparkles,
  Info,
  BadgeDollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const navLinkClass = (path) =>
    location.pathname === path
      ? 'text-white bg-white/10 border-white/15'
      : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent';

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-gray-950/70 backdrop-blur-md">
      <div className="section-shell py-4">
        <div className="glass-panel flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 p-2.5 shadow-lg shadow-blue-500/20">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-wide text-white">
              Neuro<span className="text-blue-400">Voice</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${navLinkClass('/')}`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${navLinkClass('/dashboard')}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Tools</span>
            </Link>
            <Link
              to="/about"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${navLinkClass('/about')}`}
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <Link
              to="/pricing"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${navLinkClass('/pricing')}`}
            >
              <BadgeDollarSign className="h-4 w-4" />
              <span>Pricing</span>
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/history"
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${navLinkClass('/history')}`}
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition-all hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
