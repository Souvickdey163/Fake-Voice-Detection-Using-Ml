import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { useUser } from '../hooks/useUser';
import { startPlanCheckout } from '../services/payments';

const plans = [
  {
    id: 'free',
    name: 'Starter',
    price: 'Free',
    description: 'Ideal for students, personal safety checks, and first-time users.',
    features: ['Dashboard access', 'Single-user workflow', 'Prediction history', 'Core detection tools'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Rs 1/mo',
    badge: 'Most Popular',
    description: 'For freelancers, creators, and analysts who need a more polished workflow.',
    features: ['Everything in Starter', 'Priority experience', 'Faster review workflow', 'Extended usage capacity'],
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 'Rs 3,999/mo',
    description: 'Great for ops, newsroom, and trust teams validating sensitive voice evidence.',
    features: ['Everything in Pro', 'Shared verification process', 'Operational visibility', 'Advanced support readiness'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For high-volume teams that need procurement-friendly packaging and rollout support.',
    features: ['Custom onboarding', 'Workflow consultation', 'Volume planning', 'Dedicated success support'],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, isLoggedIn, refreshUser } = useUser();
  const [loadingPlan, setLoadingPlan] = useState('');

  const handlePlanAction = async (plan) => {
    if (plan.id === 'free') {
      navigate('/dashboard');
      return;
    }

    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:souvickd720@gmail.com?subject=NeuroVoice%20Enterprise%20Plan';
      return;
    }

    if (!isLoggedIn) {
      toast.error('Login first to continue with plan payment.');
      navigate('/auth');
      return;
    }

    try {
      setLoadingPlan(plan.id);
      await startPlanCheckout({
        plan: plan.id,
        onSuccess: async (data) => {
          await refreshUser();
          toast.success(data.message || 'Payment successful! Credits added to your account.');
          navigate('/dashboard');
        },
      });
    } catch (error) {
      const message =
        error.response?.data?.detail || error.message || 'Unable to complete payment right now.';
      toast.error(message);
    } finally {
      setLoadingPlan('');
    }
  };

  const getButtonLabel = (plan) => {
    if (plan.id === 'free') {
      return 'Try Now';
    }

    if (plan.id === 'enterprise') {
      return 'Contact Sales';
    }

    if (!isLoggedIn) {
      return 'Login To Pay';
    }

    if (user?.plan === plan.id) {
      return 'Current Plan';
    }

    if (loadingPlan === plan.id) {
      return 'Opening Checkout...';
    }

    return `Pay ${plan.price}`;
  };

  return (
    <div className="section-shell pb-20 pt-10">
      <section className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
          <Sparkles className="h-4 w-4" />
          Flexible pricing story for a modern SaaS product
        </div>
        <h1 className="section-title mt-6">Pricing that scales from first check to full team adoption</h1>
        <p className="section-copy mt-5">
          Pick a plan, complete Razorpay checkout, and your detection credits unlock on the same account automatically.
        </p>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`premium-card relative flex h-full flex-col p-7 ${
              plan.highlighted
                ? 'border-blue-400/40 bg-gradient-to-b from-blue-500/10 to-violet-500/10 shadow-[0_28px_100px_rgba(59,130,246,0.18)]'
                : 'premium-card-hover'
            }`}
          >
            {plan.badge && (
              <div className="absolute right-5 top-5 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
                {plan.badge}
              </div>
            )}
            <div className="text-sm uppercase tracking-[0.25em] text-slate-400">{plan.name}</div>
            <div className="mt-4 text-4xl font-semibold text-white">{plan.price}</div>
            <p className="mt-4 min-h-[72px] text-slate-300">{plan.description}</p>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handlePlanAction(plan)}
              disabled={loadingPlan === plan.id || (user?.plan === plan.id && plan.id !== 'free')}
              className={`mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02]'
                  : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
              } ${loadingPlan === plan.id || (user?.plan === plan.id && plan.id !== 'free') ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {getButtonLabel(plan)}
              {(plan.id === 'free' || plan.id === 'enterprise' || user?.plan !== plan.id) && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </section>

      {isLoggedIn && (
        <div className="mt-10 text-center text-sm text-slate-400">
          Active plan: <span className="font-medium capitalize text-white">{user?.plan || 'free'}</span>
        </div>
      )}
    </div>
  );
}
