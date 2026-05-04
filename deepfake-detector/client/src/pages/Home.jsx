import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import heroImage from '../assets/image11.png';
import familyScamImage from '../assets/image2.png';
import businessCallsImage from '../assets/image3.png';
import creatorContentImage from '../assets/image4.png';
import howToUseImage from '../assets/image5.png';

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
    image: familyScamImage,
    description:
      'Verify suspicious “urgent” voice messages that mimic loved ones and reduce the chance of high-pressure fraud.',
    points: ['Screen alarming voice notes quickly', 'Add confidence before sharing', 'Protect vulnerable family members'],
  },
  {
    icon: BriefcaseBusiness,
    title: 'Protect business calls and internal approvals',
    image: businessCallsImage,
    description:
      'Use NeuroVoice before acting on escalations, executive requests, or customer call clips that feel slightly off.',
    points: ['Reduce social-engineering risk', 'Check sensitive call evidence', 'Support incident response teams'],
  },
  {
    icon: AudioWaveform,
    title: 'Verify interviews, podcasts, and creator content',
    image: creatorContentImage,
    description:
      'Build trust in journalism, recruiting, and content workflows by checking whether a recording shows spoofing signals.',
    points: ['Audit sourced audio clips', 'Review submissions faster', 'Protect editorial credibility'],
  },
];

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
  const metrics = useMemo(
    () => [
      { label: 'AI-driven verdicts', value: 'Instant' },
      { label: 'Use cases covered', value: '3+' },
      { label: 'Protected workflows', value: 'Personal to team' },
    ],
    []
  );

  return (
    <div className="space-y-16 pt-4 sm:space-y-20 sm:pt-6 lg:space-y-24 lg:pt-8">
      <section className="section-shell">
        <div className="premium-card overflow-hidden px-5 py-10 sm:px-8 sm:py-12 lg:px-14 lg:py-14">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
                <Sparkles className="h-4 w-4" />
                Premium deepfake audio detection experience
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Detect Fake Voices Instantly
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                NeuroVoice helps individuals and teams analyze suspicious audio, surface spoofing risk, and act with more confidence using AI-powered voice authentication checks.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
                  Try Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/pricing" className="btn-ghost inline-flex items-center justify-center">
                  View Pricing
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                    <div className="text-2xl font-semibold text-white">{metric.value}</div>
                    <div className="mt-1 text-sm text-slate-400">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-2xl" />
              <div className="relative rounded-[32px] border border-white/10 bg-slate-950/80 p-4 shadow-2xl">
                <img
                  src={heroImage}
                  alt="NeuroVoice dashboard preview"
                  className="h-full w-full rounded-[24px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="premium-card overflow-hidden px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="space-y-10">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">How to use</p>
              <h2 className="section-title mt-4">How to Use NeuroVoice</h2>
              <p className="section-copy mt-5">
                It&apos;s simple. Follow these steps to upload audio, run analysis, and review whether a voice sample appears real or fake.
              </p>
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
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

            <div className="relative">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-blue-500/20 via-transparent to-violet-500/20 blur-xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-5">
                <img
                  src={howToUseImage}
                  alt="How to use NeuroVoice"
                  className="h-full w-full rounded-[22px] object-cover"
                />
              </div>
            </div>
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
              <div key={step.title} className="premium-card premium-card-hover p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm text-slate-500">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-slate-300">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-shell space-y-10">
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon;
          const reverse = index % 2 === 1;
          return (
            <div key={useCase.title} className="premium-card overflow-hidden px-5 py-8 sm:px-8 lg:px-10">
              <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div>
                  <div className="inline-flex rounded-2xl bg-violet-500/10 p-3 text-violet-300">
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
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-blue-500/20 via-transparent to-violet-500/20 blur-xl" />
                  <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-5">
                    <img src={useCase.image} alt={useCase.title} className="h-72 w-full rounded-[22px] object-cover opacity-90" />
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                      NeuroVoice is positioned here as a verification layer before a user trusts a suspicious recording.
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <div key={feature.title} className="premium-card premium-card-hover p-6">
                <div className="rounded-2xl bg-white/5 p-3 text-blue-300 w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-slate-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <div className="premium-card mx-auto max-w-4xl p-8 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
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
            <div className="rounded-2xl border border-yellow-300/20 bg-yellow-400/10 px-5 py-4 text-yellow-200">
              ★★★★★
            </div>
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
