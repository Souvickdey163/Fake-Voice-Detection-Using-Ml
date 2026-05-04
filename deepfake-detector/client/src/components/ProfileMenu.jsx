import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Gauge,
  History,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../hooks/useUser';

const planLabelMap = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ProfileMenu() {
  const { user, clearUser } = useUser();
  const [open, setOpen] = useState(false);
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const displayUser = user || {
    name: 'Account',
    email: 'Signed in',
    plan: 'free',
    picture: '',
    credits: {
      left: 0,
      total: 0,
      used: 0,
      percent_used: 0,
    },
  };

  const planLabel = planLabelMap[displayUser.plan] || 'Free';
  const creditPercent = Math.min(user?.credits?.percent_used || 0, 100);
  const creditsLeft = user?.credits?.left ?? 0;
  const totalCredits = user?.credits?.total ?? 0;
  const lowCredits = creditsLeft <= 2;
  const canShowAvatar = Boolean(displayUser.picture) && brokenAvatarUrl !== displayUser.picture;

  const menuItems = useMemo(
    () => [
      { label: 'Dashboard', to: '/dashboard', icon: Gauge },
      { label: 'My History', to: '/history', icon: History },
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Upgrade Plan', to: '/pricing', icon: Sparkles, highlight: true },
    ],
    []
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    clearUser();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.03] hover:border-blue-400/40 hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        title={user?.credits ? (lowCredits ? `Only ${creditsLeft} credits left` : `${creditsLeft} credits left`) : 'Account'}
      >
        {canShowAvatar ? (
          <img
            src={displayUser.picture}
            alt={displayUser.name}
            className="h-full w-full object-cover"
            onError={() => setBrokenAvatarUrl(displayUser.picture)}
          />
        ) : (
          <span className="bg-gradient-to-br from-blue-400 to-violet-500 bg-clip-text text-transparent">
            {getInitials(displayUser.name) || 'NV'}
          </span>
        )}
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
      </button>

      {open && (
        <div
          className="fixed left-4 right-4 top-24 z-50 max-h-[calc(100vh-7rem)] animate-fade-in-down overflow-y-auto rounded-[24px] border border-white/12 bg-slate-950/85 shadow-[0_30px_80px_rgba(15,23,42,0.65)] backdrop-blur-2xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.85rem)] sm:max-h-none sm:w-[min(22rem,calc(100vw-2rem))] sm:overflow-visible"
        >
            <div className="border-b border-white/10 bg-gradient-to-br from-blue-500/18 via-slate-900/40 to-violet-500/18 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-lg font-semibold text-white">
                  {canShowAvatar ? (
                    <img
                      src={displayUser.picture}
                      alt={displayUser.name}
                      className="h-full w-full object-cover"
                      onError={() => setBrokenAvatarUrl(displayUser.picture)}
                    />
                  ) : (
                    getInitials(displayUser.name) || 'NV'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-semibold text-white">{displayUser.name}</p>
                    <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-blue-200">
                      {planLabel}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-300">{displayUser.email}</p>
                  {user?.credits ? (
                    <p className="mt-3 text-xs text-slate-400">
                      {creditsLeft} credits left on your {planLabel.toLowerCase()} plan
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">
                      Profile details will appear after reconnecting to the backend.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {user?.credits && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Credits</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {creditsLeft} left
                      </p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                        lowCredits
                          ? 'border-amber-400/25 bg-amber-400/10 text-amber-200'
                          : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                      }`}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>{user.credits.used} / {totalCredits} used</span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full ${
                        lowCredits
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-blue-400 to-violet-500'
                      }`}
                      style={{ width: `${creditPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all ${
                        item.highlight
                          ? 'border-blue-400/25 bg-gradient-to-r from-blue-500/18 to-violet-500/18 text-white shadow-lg shadow-blue-500/10 hover:border-blue-300/40 hover:shadow-blue-500/20'
                          : 'border-transparent bg-white/0 text-slate-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.highlight && <Sparkles className="h-4 w-4 text-blue-200" />}
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl border border-red-400/15 bg-red-500/8 px-4 py-3 text-sm text-red-100 transition-all hover:border-red-400/30 hover:bg-red-500/12"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
        </div>
      )}
    </div>
  );
}
