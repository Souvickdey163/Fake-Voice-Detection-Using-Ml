import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  AudioWaveform,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Quote,
  Shield,
  Sparkles,
  Upload,
  FileSearch,
  Download,
  Mail,
  Search,
  Siren,
  ScanSearch,
  Star,
} from 'lucide-react';
import api from '../services/api';
import HeroScene from '../components/HeroScene';

const MotionDiv = motion.div;

const steps = [
  {
    icon: Upload,
    title: 'Upload',
    description: 'Drop a voice note, interview clip, or call recording into the dashboard in seconds.',
  },
  {
    icon: ScanSearch,
    title: 'Analyze',
    description: 'Our audio pipeline evaluates spectral artifacts and spoofing cues with deep learning.',
  },
  {
    icon: CheckCircle2,
    title: 'Result',
    description: 'Get a clear authenticity verdict plus a confidence score your team can act on.',
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Review outcomes, keep records in history, and use the findings in your workflow.',
  },
];

const useCases = [
  {
    icon: Siren,
    title: 'Stop family scam calls before panic spreads',
    visual: 'family',
    accent: 'cyan',
    description:
      'Verify suspicious “urgent” voice messages that mimic loved ones and reduce the chance of high-pressure fraud.',
    caption:
      'Use NeuroVoice as a quick second check before reacting to an emotional family voice note or emergency request.',
    points: ['Screen alarming voice notes quickly', 'Add confidence before sharing', 'Protect vulnerable family members'],
  },
  {
    icon: BriefcaseBusiness,
    title: 'Protect business calls and internal approvals',
    visual: 'business',
    accent: 'violet',
    description:
      'Use NeuroVoice before acting on escalations, executive requests, or customer call clips that feel slightly off.',
    caption:
      'Help teams validate high-stakes audio before approving actions, escalating incidents, or trusting a sensitive call.',
    points: ['Reduce social-engineering risk', 'Check sensitive call evidence', 'Support incident response teams'],
  },
  {
    icon: AudioWaveform,
    title: 'Verify interviews, podcasts, and creator content',
    visual: 'creator',
    accent: 'blue',
    description:
      'Build trust in journalism, recruiting, and content workflows by checking whether a recording shows spoofing signals.',
    caption:
      'Review sourced clips, creator submissions, and spoken media with more confidence before publishing or sharing.',
    points: ['Audit sourced audio clips', 'Review submissions faster', 'Protect editorial credibility'],
  },
];

const globeStyles = {
  cyan: {
    glow: 'from-cyan-400/35 via-blue-500/15 to-emerald-300/20',
    core: 'from-cyan-200 via-blue-400 to-emerald-300',
    border: 'border-cyan-300/30',
    text: 'text-cyan-100',
    dot: 'bg-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.9)]',
  },
  violet: {
    glow: 'from-violet-400/35 via-fuchsia-500/15 to-cyan-300/20',
    core: 'from-violet-200 via-fuchsia-400 to-cyan-300',
    border: 'border-violet-300/30',
    text: 'text-violet-100',
    dot: 'bg-violet-200 shadow-[0_0_20px_rgba(196,181,253,0.9)]',
  },
  blue: {
    glow: 'from-blue-400/35 via-cyan-500/15 to-violet-300/20',
    core: 'from-blue-200 via-cyan-400 to-violet-300',
    border: 'border-blue-300/30',
    text: 'text-blue-100',
    dot: 'bg-blue-200 shadow-[0_0_20px_rgba(96,165,250,0.9)]',
  },
};

function InteractiveHologram({ children, className = '', center = true }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 110, damping: 22 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 110, damping: 22 });
  const liftX = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 130, damping: 24 });
  const liftY = useSpring(useTransform(my, [-0.5, 0.5], [-8, 8]), { stiffness: 130, damping: 24 });

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <MotionDiv
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX, rotateY }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      className={`scene-3d interactive-hologram ${className}`}
    >
      <MotionDiv
        style={{ x: liftX, y: liftY }}
        className={`relative min-h-[inherit] w-full ${center ? 'flex items-center justify-center' : ''}`}
      >
        {children}
      </MotionDiv>
    </MotionDiv>
  );
}

function NeuralGlobe({ label = 'Neural Scan', accent = 'cyan', compact = false }) {
  const style = globeStyles[accent] || globeStyles.cyan;
  const beams = compact ? 7 : 10;

  return (
    <InteractiveHologram className={`relative flex min-h-[21rem] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_28px_90px_rgba(2,8,23,0.55)] ${compact ? 'min-h-[20rem]' : 'sm:min-h-[25rem]'}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300 backdrop-blur-xl">
        live signal
      </div>
      <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300 backdrop-blur-xl">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        active
      </div>

      <div className="globe-shell relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
        <div className={`absolute inset-0 rounded-full border ${style.border} bg-gradient-to-br ${style.glow} shadow-[inset_0_1px_26px_rgba(255,255,255,0.12),0_0_80px_rgba(56,189,248,0.18)]`} />
        <div className="absolute inset-6 rounded-full border border-white/10" />
        <div className="absolute inset-12 rounded-full border border-white/10" />
        <div className={`globe-ring absolute h-[17rem] w-[17rem] rounded-full border ${style.border}`} />
        <div className={`globe-ring globe-ring-reverse absolute h-[13.5rem] w-[13.5rem] rounded-full border ${style.border}`} />
        <div className="absolute h-px w-[88%] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className="absolute h-px w-[78%] rotate-[32deg] bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
        <div className="absolute h-px w-[78%] -rotate-[32deg] bg-gradient-to-r from-transparent via-violet-200/35 to-transparent" />
        <div className="absolute h-[84%] w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        <span className={`orbit-dot absolute left-1/2 top-1/2 h-3 w-3 rounded-full ${style.dot}`} />
        <span className={`orbit-dot absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full ${style.dot} [animation-delay:-3s] [animation-duration:12s]`} />
        <span className={`orbit-dot absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${style.dot} [animation-delay:-6s] [animation-duration:15s]`} />
        <div className={`relative h-24 w-24 rounded-full bg-gradient-to-br ${style.core} shadow-[0_0_55px_rgba(125,211,252,0.75)]`} />
      </div>

      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className={`text-sm font-medium ${style.text}`}>{label}</p>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">3D scan</p>
        </div>
        <div className="flex h-12 items-end gap-1.5">
          {Array.from({ length: beams }, (_, index) => (
            <span
              key={index}
              className={`pulse-beam block flex-1 rounded-full bg-gradient-to-t ${style.core} opacity-80`}
              style={{
                height: `${24 + ((index * 13) % 24)}px`,
                animationDelay: `${index * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>
    </InteractiveHologram>
  );
}

function HologramVisual({ type = 'globe', label, accent = 'cyan' }) {
  const style = globeStyles[accent] || globeStyles.cyan;

  if (type === 'pipeline') {
    return (
      <InteractiveHologram center={false} className="relative min-h-[23rem] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_28px_90px_rgba(2,8,23,0.55)] sm:min-h-[25rem]">
        <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="card-drift relative mx-auto mt-8 flex h-56 max-w-lg items-center justify-between rounded-[30px] border border-white/10 bg-black/25 px-7 backdrop-blur-xl">
          {['Upload', 'Analyze', 'Result'].map((item, index) => (
            <div key={item} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${style.border} bg-white/[0.06] shadow-[0_18px_55px_rgba(56,189,248,0.14)]`}>
                <div className={`h-9 w-9 rounded-2xl bg-gradient-to-br ${style.core} shadow-[0_0_28px_rgba(125,211,252,0.75)]`} />
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-slate-300">{item}</span>
              {index < 2 && <div className="absolute left-[4.8rem] top-10 hidden h-px w-24 bg-gradient-to-r from-cyan-200/70 to-violet-200/30 sm:block" />}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
          <p className={`mb-3 text-sm font-medium ${style.text}`}>{label}</p>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 16 }, (_, index) => (
              <span key={index} className={`h-2 rounded-full bg-gradient-to-r ${style.core} opacity-70`} />
            ))}
          </div>
        </div>
      </InteractiveHologram>
    );
  }

  if (type === 'shield') {
    return (
      <InteractiveHologram className="relative flex min-h-[20rem] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_28px_90px_rgba(2,8,23,0.55)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="card-drift relative flex h-60 w-60 items-center justify-center rounded-[3rem] border border-white/10 bg-black/25 shadow-[inset_0_1px_24px_rgba(255,255,255,0.08)] backdrop-blur-xl">
          <div className={`absolute h-52 w-52 rounded-full border ${style.border}`} />
          <Shield className={`relative h-28 w-28 ${style.text} drop-shadow-[0_0_28px_rgba(125,211,252,0.65)]`} />
          <span className={`orbit-dot absolute left-1/2 top-1/2 h-3 w-3 rounded-full ${style.dot}`} />
          <span className={`orbit-dot absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full ${style.dot} [animation-delay:-4s] [animation-duration:13s]`} />
        </div>
        <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-300 backdrop-blur-xl">
          <span className={style.text}>{label}</span>
          <div className="mt-3 flex gap-2">
            {[70, 38, 86, 52, 94, 42, 76].map((height, index) => (
              <span key={index} className={`wave-rise block w-full rounded-full bg-gradient-to-t ${style.core}`} style={{ height, animationDelay: `${index * 0.12}s` }} />
            ))}
          </div>
        </div>
      </InteractiveHologram>
    );
  }

  if (type === 'waveform') {
    return (
      <InteractiveHologram className="relative flex min-h-[20rem] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_28px_90px_rgba(2,8,23,0.55)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
        <div className="card-drift relative w-full max-w-md rounded-[32px] border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
          <div className="flex h-40 items-center justify-center gap-2">
            {Array.from({ length: 24 }, (_, index) => (
              <span
                key={index}
                className={`wave-rise block w-2.5 rounded-full bg-gradient-to-t ${style.core}`}
                style={{
                  height: `${36 + ((index * 17) % 92)}px`,
                  animationDelay: `${index * 0.06}s`,
                }}
              />
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <span className={`text-sm font-medium ${style.text}`}>{label}</span>
            <AudioWaveform className={`h-5 w-5 ${style.text}`} />
          </div>
        </div>
      </InteractiveHologram>
    );
  }

  if (type === 'call') {
    return (
      <InteractiveHologram className="relative flex min-h-[20rem] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_28px_90px_rgba(2,8,23,0.55)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="card-drift relative w-72 rounded-[2.2rem] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${style.core} shadow-[0_0_42px_rgba(34,211,238,0.45)]`}>
              <Siren className="h-8 w-8 text-slate-950" />
            </div>
            <div>
              <p className={`text-sm font-medium ${style.text}`}>{label}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">risk scan</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[88, 62, 94, 54].map((width, index) => (
              <div key={index} className="h-3 overflow-hidden rounded-full bg-white/10">
                <span className={`pulse-beam block h-full rounded-full bg-gradient-to-r ${style.core}`} style={{ width: `${width}%`, animationDelay: `${index * 0.16}s` }} />
              </div>
            ))}
          </div>
        </div>
      </InteractiveHologram>
    );
  }

  return <NeuralGlobe label={label} accent={accent} compact />;
}

const howToUseSteps = [
  {
    icon: Upload,
    title: 'Step 1: Upload your file',
    description:
      'Choose the voice clip you want to verify. NeuroVoice supports quick uploads so you can start checking suspicious audio without friction.',
  },
  {
    icon: BrainCircuit,
    title: 'Step 2: Let AI do the work',
    description:
      'Our detection pipeline analyzes patterns in the recording and checks for spoofing artifacts using deep learning.',
  },
  {
    icon: CheckCircle2,
    title: 'Step 3: View the results',
    description:
      'Get a clear authenticity verdict and confidence score so you can decide what to trust next.',
  },
  {
    icon: Download,
    title: 'Step 4: Download or share',
    description:
      'Keep a record, revisit outcomes in history, or use the result to support personal and team verification workflows.',
  },
];

const features = [
  {
    icon: Sparkles,
    title: 'Fast',
    description: 'Built for quick checks so users can move from upload to verdict without friction.',
  },
  {
    icon: BrainCircuit,
    title: 'Accurate',
    description: 'Model-driven classification designed to surface confidence, not vague guesswork.',
  },
  {
    icon: Shield,
    title: 'Privacy-first',
    description: 'A focused workflow with secure auth and private user history already built into the app.',
  },
  {
    icon: FileSearch,
    title: 'Free to start',
    description: 'Try the core detection flow immediately through the existing dashboard experience.',
  },
];

const faqs = [
  {
    question: 'What kinds of audio can I analyze?',
    answer: 'You can upload common audio recordings such as call clips, voice notes, interviews, and spoken content samples.',
  },
  {
    question: 'Where do the Try Now buttons take me?',
    answer: 'Every CTA routes directly to the dashboard so users can start analyzing audio immediately.',
  },
  {
    question: 'Can I review previous analyses later?',
    answer: 'Yes. Logged-in users can use the existing history page to revisit earlier predictions and confidence scores.',
  },
  {
    question: 'Does this change any backend behavior?',
    answer: 'No. This website layer only improves navigation, layout, and presentation while keeping current API flows intact.',
  },
  {
    question: 'Is NeuroVoice meant only for enterprises?',
    answer: 'No. The product story supports personal safety, business verification, and creator or editorial review workflows.',
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="premium-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-medium text-white sm:text-lg">{item.question}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-white/10 px-6 py-5 text-slate-300">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [stats, setStats] = useState({ total_users: 0, average_rating: 0, total_ratings: 0 });
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchStats = async () => {
      try {
        const response = await api.get('/api/users/stats');
        if (!ignore) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Unable to load site stats:', error);
      }
    };

    fetchStats();
    const intervalId = window.setInterval(fetchStats, 30000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const metrics = useMemo(
    () => [
      { label: 'Registered users', value: stats.total_users ? `${stats.total_users}+` : 'Live' },
      { label: 'Average rating', value: stats.total_ratings ? `${stats.average_rating}/5` : 'New' },
      { label: 'AI-driven verdicts', value: 'Instant' },
    ],
    [stats]
  );

  const submitRating = async (event) => {
    event.preventDefault();

    if (!localStorage.getItem('token')) {
      toast.error('Please sign in to rate NeuroVoice.');
      return;
    }

    try {
      setRatingLoading(true);
      await api.post('/api/users/ratings', {
        score: ratingScore,
        comment: ratingComment,
      });
      toast.success('Thanks for your rating!');
      setRatingComment('');
      const response = await api.get('/api/users/stats');
      setStats(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not save rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="space-y-14 pt-3 sm:space-y-16 sm:pt-5 lg:space-y-20 lg:pt-8">
      <section className="section-shell">
        <div className="premium-card shine-overlay relative overflow-hidden px-5 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-12 xl:px-12">
          <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-blue-500/8 to-transparent lg:block" />
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-violet-500/10 to-transparent lg:block" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(34,211,238,0.08),transparent_18%),radial-gradient(circle_at_80%_24%,rgba(168,85,247,0.08),transparent_18%)]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-9 xl:gap-11">
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl lg:py-6"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                <Sparkles className="h-4 w-4" />
                Futuristic deepfake audio intelligence
              </div>
              <h1 className="max-w-[11ch] text-4xl font-semibold leading-[0.9] tracking-tight text-white sm:text-5xl lg:text-[4.8rem]">
                Detect <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">Fake Voices</span> Instantly
              </h1>
              <p className="mt-6 max-w-[36rem] text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                NeuroVoice helps individuals and teams analyze suspicious audio, surface spoofing risk, and act with more confidence using AI-powered voice authentication checks.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_0_35px_rgba(59,130,246,0.24)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] lg:min-w-[11rem]">
                  Try Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/pricing" className="btn-ghost inline-flex items-center justify-center rounded-2xl border-cyan-300/15 bg-white/[0.03] lg:min-w-[11rem]">
                  View Pricing
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <MotionDiv
                    key={metric.label}
                    whileHover={{ y: -6, rotateX: 6, rotateY: -6 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-5 backdrop-blur-sm"
                  >
                    <div className="text-2xl font-semibold text-white lg:text-[2rem]">{metric.value}</div>
                    <div className="mt-1 max-w-[14ch] text-sm leading-6 text-slate-400">{metric.label}</div>
                  </MotionDiv>
                ))}
              </div>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="relative"
            >
              <HeroScene />
            </MotionDiv>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="premium-card overflow-hidden px-4 py-8 sm:px-7 sm:py-10 lg:px-8">
          <div className="space-y-10">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">How to use</p>
              <h2 className="section-title mt-4">How to Use NeuroVoice</h2>
              <p className="section-copy mt-5">
                It&apos;s simple. Follow these steps to upload audio, run analysis, and review whether a voice sample appears real or fake.
              </p>
            </div>

            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
              <div className="mt-10 space-y-8">
                {howToUseSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title}>
                      <div className="flex items-start gap-3 sm:items-center">
                        <Icon className="h-6 w-6 text-blue-300" />
                        <h3 className="text-xl font-semibold text-white sm:text-2xl">{step.title}</h3>
                      </div>
                      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <HologramVisual type="pipeline" label="Upload to verdict flow" accent="blue" />
          </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">How it works</p>
          <h2 className="section-title mt-4">A clear flow from upload to confidence</h2>
          <p className="section-copy mt-5">
            The existing dashboard already does the heavy lifting. This new product layer simply makes the journey easier to understand and trust.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <MotionDiv
                key={step.title}
                whileHover={{ y: -8, rotateX: 6, rotateY: index % 2 === 0 ? -5 : 5 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="premium-card premium-card-hover p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm text-slate-500">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-slate-300">{step.description}</p>
              </MotionDiv>
            );
          })}
        </div>
      </section>

      <section className="section-shell space-y-10">
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon;
          const reverse = index % 2 === 1;
          return (
            <MotionDiv
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="premium-card overflow-hidden px-4 py-8 sm:px-7 lg:px-8"
            >
              <div className={`grid items-center gap-8 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div>
                  <div className="inline-flex rounded-2xl border border-violet-300/12 bg-violet-500/10 p-3 text-violet-300 shadow-[0_0_24px_rgba(168,85,247,0.12)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">{useCase.title}</h3>
                  <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{useCase.description}</p>
                  <div className="mt-6 space-y-3">
                    {useCase.points.map((point) => (
                      <div key={point} className="flex items-center gap-3 text-slate-200">
                        <CheckCircle2 className="h-5 w-5 text-blue-300" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <HologramVisual
                    type={useCase.visual === 'family' ? 'call' : useCase.visual === 'business' ? 'shield' : 'waveform'}
                    label={useCase.visual === 'family' ? 'Fraud voiceprint check' : useCase.visual === 'business' ? 'Approval signal shield' : 'Creator audio scan'}
                    accent={useCase.accent}
                  />
                  <div className="relative -mt-5 mx-4 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-slate-300 backdrop-blur-xl">
                    {useCase.caption}
                  </div>
                </div>
              </div>
            </MotionDiv>
          );
        })}
      </section>

      <section className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Why choose us</p>
          <h2 className="section-title mt-4">Made to feel trustworthy, fast, and product-ready</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <MotionDiv
                key={feature.title}
                whileHover={{ y: -8, rotateX: 7, rotateY: 5 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="premium-card premium-card-hover p-6"
              >
                <div className="rounded-2xl bg-white/5 p-3 text-blue-300 w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-slate-300">{feature.description}</p>
              </MotionDiv>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <div className="premium-card mx-auto max-w-5xl p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                <Quote className="h-6 w-6" />
              </div>
              <p className="mt-6 text-2xl leading-10 text-white">
                “NeuroVoice turns a technical detection workflow into something our team can trust quickly. The verdicts are clear, and the interface finally feels like a real product.”
              </p>
              <div className="mt-6 text-slate-300">
                <div className="font-medium text-white">Aarav Mehta</div>
                <div>Security Operations Lead</div>
              </div>
            </div>
            <form onSubmit={submitRating} className="rounded-[24px] border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-blue-300">Rate us</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">How was NeuroVoice?</h3>
                </div>
                <div className="text-right text-sm text-slate-400">
                  <div className="text-xl font-semibold text-white">{stats.average_rating || 0}/5</div>
                  <div>{stats.total_ratings} ratings</div>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setRatingScore(score)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${score <= ratingScore ? 'border-yellow-300/40 bg-yellow-300/15 text-yellow-200' : 'border-white/10 bg-white/[0.04] text-slate-500 hover:text-slate-200'}`}
                    aria-label={`Rate ${score} stars`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
              <textarea
                value={ratingComment}
                onChange={(event) => setRatingComment(event.target.value)}
                maxLength={500}
                placeholder="Share quick feedback..."
                className="mt-5 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
              />
              <button
                type="submit"
                disabled={ratingLoading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3 font-medium text-white transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ratingLoading ? 'Saving...' : 'Submit Rating'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">FAQ</p>
          <h2 className="section-title mt-4">Common questions before you start</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-4">
          {faqs.map((item, index) => (
            <FAQItem
              key={item.question}
              item={item}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
            />
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="premium-card overflow-hidden px-6 py-12 text-center sm:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Ready to verify</p>
            <h2 className="section-title mt-4">Try NeuroVoice Now</h2>
            <p className="section-copy mt-5">
              Move straight into the tools and analyze your first sample using the workflows already built into NeuroVoice.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-4 text-base font-medium text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              Try Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950/40">
        <div className="section-shell py-10 sm:py-12">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr] xl:gap-14">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 text-white">
                <Search className="h-4 w-4 text-blue-300" />
                <h3 className="text-xl font-medium">NeuroVoice</h3>
              </div>
              <p className="mt-4 text-base leading-7 text-slate-300">
                NeuroVoice is a free AI-powered tool that helps you identify manipulated audio files to protect against misinformation and fraud.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">NeuroVoice Tools</h3>
              <div className="mt-4 space-y-3 text-base text-slate-300">
                <p className="leading-7">Deepfake Voice Detection</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">About</h3>
              <div className="mt-4 space-y-3 text-base text-slate-300">
                <Link to="/about" className="block leading-7 transition-colors hover:text-white">About Us</Link>
                <Link to="/pricing" className="block leading-7 transition-colors hover:text-white">Pricing</Link>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">Contact</h3>
              <div className="mt-4 space-y-4 text-base text-slate-300">
                <p className="break-all leading-7 sm:break-normal">support@neurovoice.com</p>
                <a
                  href="mailto:support@neurovoice.com?subject=NeuroVoice%20Support&body=Hello%20NeuroVoice%20Team%2C%0A%0AI%20need%20help%20with%20..."
                  aria-label="Email NeuroVoice support"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
            © 2026 NeuroVoice. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
}
