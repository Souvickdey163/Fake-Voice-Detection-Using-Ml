import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  FileText,
  Globe,
  HeartHandshake,
  Mail,
  Quote,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
  GraduationCap,
} from 'lucide-react';
import heroImage from '../assets/image10.png';
import familyImage from '../assets/image6.png';
import businessImage from '../assets/image7.png';
import interviewsImage from '../assets/image8.png';
import detectionImage from '../assets/image9.png';

const gallery = [
  {
    caption: 'People-first protection against voice scams and manipulation',
    image: familyImage,
  },
  {
    caption: 'Decision support for teams handling sensitive audio evidence',
    image: businessImage,
  },
  {
    caption: 'AI-assisted analysis for media, research, and investigations',
    image: interviewsImage,
  },
  {
    caption: 'Clear detection workflows designed for trust and action',
    image: detectionImage,
  },
];

const differentiators = [
  {
    icon: Zap,
    title: 'Lightning Fast Analysis',
    description: 'Upload a sample and move from uncertainty to a readable verdict in moments.',
  },
  {
    icon: BrainCircuit,
    title: 'Advanced AI Models',
    description: 'Built around deep learning workflows that inspect subtle spoofing signals in audio.',
  },
  {
    icon: FileText,
    title: 'Detailed Reports',
    description: 'Results are presented clearly so users can understand the outcome, not just receive it.',
  },
  {
    icon: Users,
    title: 'For Everyone',
    description: 'Useful for families, journalists, creators, analysts, and teams facing trust challenges.',
  },
];

const missionPillars = [
  {
    icon: Shield,
    title: 'Protect',
    description: 'Reduce harm from scams, impersonation, and manipulated media.',
  },
  {
    icon: GraduationCap,
    title: 'Educate',
    description: 'Help people understand how deepfakes work and why verification matters.',
  },
  {
    icon: HeartHandshake,
    title: 'Empower',
    description: 'Give more people access to tools that support confident digital decisions.',
  },
];

export default function About() {
  return (
    <div className="section-shell space-y-20 pt-10">
      <section className="premium-card overflow-hidden px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              <Globe className="h-4 w-4" />
              About Us
            </div>
            <h1 className="section-title mt-6">About Us</h1>
            <p className="section-copy mt-4">Meet the team behind NeuroVoice</p>

            <div className="mt-8 flex items-start gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  Hi! We&apos;re a team of AI researchers and cybersecurity experts
                </h2>
                <p className="mt-3 text-slate-300">
                  building tools for people who need clarity in a world filled with synthetic media.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-blue-400/15 bg-blue-500/10 px-6 py-5">
              <div className="flex items-start gap-3">
                <Quote className="mt-0.5 h-5 w-5 text-blue-300" />
                <p className="text-lg italic leading-8 text-blue-100">
                  &quot;How can we help people identify fake content in a world of AI-generated media?&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="premium-card overflow-hidden p-4">
            <img
              src={heroImage}
              alt="Team behind NeuroVoice"
              className="h-full w-full rounded-[24px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Our Story</h2>
        </div>

        <div className="premium-card p-8 sm:p-10">
          <div className="space-y-6 text-lg leading-8 text-slate-300">
            <p>
              We started this project because the line between authentic and manipulated media is getting harder to see. As voice cloning and generative AI become more accessible, deepfakes are no longer rare experiments, they are becoming a real-world trust problem.
            </p>
            <p>
              Families can be targeted by panic-driven scam calls, journalists can receive misleading clips, and teams can be asked to act on audio that sounds convincing but is not real. We believed people needed a way to verify suspicious content without requiring technical expertise or expensive software.
            </p>
            <p>
              That&apos;s why we built <span className="text-blue-300">a fast, free, and accessible detection tool</span> designed to help users check what they hear with more confidence. NeuroVoice turns a complex AI problem into a cleaner product experience that is <span className="text-violet-300">practical, trustworthy, and easy to use</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Image Grid</h2>
          <p className="mt-4 text-slate-300">
            A visual snapshot of the people, systems, and decisions this product is designed to support.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {gallery.map((item) => (
            <div key={item.caption} className="premium-card overflow-hidden p-4">
              <img
                src={item.image}
                alt={item.caption}
                className="h-72 w-full rounded-[24px] object-cover"
              />
              <div className="px-2 pb-2 pt-4 text-slate-300">{item.caption}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">What Makes Us Different</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {differentiators.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="premium-card premium-card-hover p-6">
                <div className="w-fit rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-slate-300">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Our Mission</h2>
        </div>

        <div className="premium-card p-8 sm:p-10">
          <p className="text-lg leading-8 text-slate-300">
            <span className="font-medium text-blue-300">We focus on truth, fighting misinformation, and empowering users</span> with tools that make verification feel accessible instead of overwhelming. Our goal is to help more people respond to suspicious media with clarity, context, and confidence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {missionPillars.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto w-fit rounded-2xl bg-blue-500/10 p-4 text-blue-300">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-slate-300">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Privacy First</h2>
        </div>

        <div className="premium-card p-8 sm:p-10">
          <p className="text-lg leading-8 text-slate-300">
            We designed NeuroVoice with privacy in mind from the start. That means <span className="text-blue-300">no unnecessary data storage</span>, secure processing, and deletion-friendly workflows that respect the sensitivity of what users upload.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">
              No data storage
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">
              Secure processing
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">
              Immediate deletion
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
            <BadgeCheck className="h-4 w-4" />
            <span>Zero data retention policy</span>
          </div>
        </div>
      </section>

      <section className="premium-card px-6 py-12 text-center sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to detect your first deepfake?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Step into the dashboard and try the same fast verification workflow the rest of the product is built around.
          </p>
          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-4 text-base font-medium text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            Try NeuroVoice Now
            <ArrowRight className="h-4 w-4" />
          </Link>
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
