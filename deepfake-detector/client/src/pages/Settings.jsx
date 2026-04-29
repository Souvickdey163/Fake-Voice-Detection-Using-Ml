import { useState } from 'react';
import { CalendarDays, CreditCard, Mail, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useUser } from '../hooks/useUser';

const planDescriptions = {
  free: 'A lightweight plan for quick checks and evaluation runs.',
  pro: 'More room for repeated analysis and deeper day-to-day use.',
  team: 'High-volume access designed for collaborative workflows.',
};

function formatJoinedDate(createdAt) {
  if (!createdAt) {
    return 'Unknown';
  }

  return new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Settings() {
  const { user } = useUser();
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState(null);

  if (!user) {
    return null;
  }

  const planDescription = planDescriptions[user.plan] || planDescriptions.free;
  const canShowAvatar = Boolean(user.picture) && brokenAvatarUrl !== user.picture;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Account</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Settings</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Your plan, identity, and credit usage all in one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="premium-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/10 text-2xl font-semibold text-white">
              {canShowAvatar ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  onError={() => setBrokenAvatarUrl(user.picture)}
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
              <p className="mt-1 text-slate-300">{user.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{user.plan}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-slate-300">
                <User className="h-4 w-4 text-blue-300" />
                <span className="text-sm">Profile name</span>
              </div>
              <p className="mt-3 text-lg font-medium text-white">{user.name}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="h-4 w-4 text-blue-300" />
                <span className="text-sm">Email</span>
              </div>
              <p className="mt-3 text-lg font-medium text-white">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-slate-300">
                <CalendarDays className="h-4 w-4 text-blue-300" />
                <span className="text-sm">Joined</span>
              </div>
              <p className="mt-3 text-lg font-medium text-white">{formatJoinedDate(user.created_at)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Sparkles className="h-4 w-4 text-blue-300" />
                <span className="text-sm">Plan</span>
              </div>
              <p className="mt-3 text-lg font-medium capitalize text-white">{user.plan}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="premium-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Credit usage</h2>
                <p className="text-sm text-slate-300">{planDescription}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Credits left</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{user.credits.left}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Usage</p>
                  <p className="mt-1 text-sm text-white">
                    {user.credits.used} / {user.credits.total}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-500"
                  style={{ width: `${Math.min(user.credits.percent_used, 100)}%` }}
                />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
