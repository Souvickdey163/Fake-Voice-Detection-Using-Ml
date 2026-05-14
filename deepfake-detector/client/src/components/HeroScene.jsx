import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMemo } from 'react';

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const particles = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  size: 4 + (index % 4) * 3,
  x: `${8 + ((index * 13) % 82)}%`,
  y: `${10 + ((index * 9) % 72)}%`,
  duration: 7 + (index % 5),
  delay: index * 0.18,
}));

const panels = [
  { title: 'Signal Integrity', value: '99.2%', tone: 'from-cyan-400/30 to-blue-500/10', position: 'left-[4%] top-[10%]' },
  { title: 'Live Scan', value: 'Voiceprint Stable', tone: 'from-violet-400/30 to-fuchsia-500/10', position: 'right-[4%] top-[18%]' },
  { title: 'Threat Index', value: 'Low Distortion', tone: 'from-blue-400/30 to-cyan-500/10', position: 'left-[7%] bottom-[13%]' },
];

export default function HeroScene() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 110, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 110, damping: 22 });
  const tx = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 120, damping: 24 });
  const ty = useSpring(useTransform(my, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 24 });
  const bgX = useSpring(useTransform(mx, [-0.5, 0.5], [22, -22]), { stiffness: 90, damping: 20 });
  const bgY = useSpring(useTransform(my, [-0.5, 0.5], [18, -18]), { stiffness: 90, damping: 20 });

  const waveformBars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        id: index,
        height: 16 + ((index * 11) % 58),
        delay: index * 0.06,
      })),
    []
  );

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    mx.set(px);
    my.set(py);
  };

  return (
    <MotionDiv
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry }}
      className="relative isolate mx-auto h-[28rem] w-full max-w-[42rem] overflow-hidden rounded-[36px] border border-white/12 bg-[radial-gradient(circle_at_50%_22%,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_74%_20%,rgba(168,85,247,0.18),transparent_20%),linear-gradient(145deg,rgba(0,0,0,0.98),rgba(8,14,34,0.9))] p-5 shadow-[0_35px_120px_rgba(15,23,42,0.75)] [transform-style:preserve-3d]"
    >
      <div className="absolute inset-0 rounded-[36px] border border-cyan-300/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_32%)]" />
      <div className="absolute left-6 top-6 h-20 w-20 rounded-full border border-cyan-300/15 bg-cyan-300/10 blur-2xl" />
      <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full border border-violet-300/15 bg-violet-400/10 blur-3xl" />

      {panels.map((panel) => (
        <MotionDiv
          key={panel.title}
          style={{ x: tx, y: ty }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={`absolute ${panel.position} hidden min-w-[10rem] rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 backdrop-blur-xl md:block`}
        >
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${panel.tone}`} />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{panel.title}</p>
            <p className="mt-2 text-sm font-medium text-white">{panel.value}</p>
          </div>
        </MotionDiv>
      ))}

      <div className="absolute inset-x-10 bottom-8 hidden h-24 rounded-[28px] border border-white/10 bg-slate-950/45 px-5 py-4 backdrop-blur-xl lg:block">
        <div className="flex h-full items-end gap-1.5">
          {waveformBars.map((bar) => (
            <MotionSpan
              key={bar.id}
              className="block flex-1 rounded-full bg-gradient-to-t from-cyan-400 via-blue-500 to-violet-400 opacity-80"
              initial={{ height: 18 }}
              animate={{ height: [18, bar.height, Math.max(22, bar.height - 12), bar.height] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', delay: bar.delay }}
            />
          ))}
        </div>
      </div>

      {particles.map((particle) => (
        <MotionSpan
          key={particle.id}
          className="absolute rounded-full bg-cyan-300/70 shadow-[0_0_20px_rgba(34,211,238,0.65)]"
          style={{ left: particle.x, top: particle.y, width: particle.size, height: particle.size }}
          animate={{ y: [0, -16, 0], opacity: [0.4, 1, 0.45], scale: [1, 1.25, 1] }}
          transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
        />
      ))}

      <MotionDiv style={{ x: tx, y: ty }} className="relative flex h-full items-center justify-center">
        <MotionDiv
          style={{ x: bgX, y: bgY }}
          className="absolute h-[21rem] w-[21rem] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_62%)] blur-2xl"
        />
        <div className="absolute h-[20rem] w-[20rem] rounded-full border border-cyan-300/20 bg-cyan-300/5 shadow-[0_0_120px_rgba(56,189,248,0.2)]" />
        <MotionDiv
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute h-[21rem] w-[21rem] rounded-full border border-dashed border-cyan-300/25"
        />
        <MotionDiv
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute h-[16rem] w-[16rem] rounded-full border border-violet-300/25"
        />
        <MotionDiv
          animate={{ y: [0, -10, 0], scale: [1, 1.025, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-[17rem] w-[17rem] items-center justify-center rounded-full"
        >
          <div className="absolute h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle_at_34%_24%,rgba(255,255,255,0.35),transparent_18%),radial-gradient(circle_at_65%_28%,rgba(168,85,247,0.55),transparent_22%),radial-gradient(circle_at_44%_66%,rgba(34,211,238,0.46),transparent_28%),linear-gradient(145deg,rgba(20,30,66,0.88),rgba(3,7,18,0.2))] opacity-90 blur-sm shadow-[0_0_70px_rgba(56,189,248,0.28)]" />
          <div className="absolute h-[13.8rem] w-[13.8rem] rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.2),rgba(2,6,23,0.06)_58%,transparent_72%)]" />
          <MotionDiv
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute h-[13.4rem] w-[13.4rem] rounded-full border border-cyan-300/20"
          />
          <MotionDiv
            animate={{ rotate: -360 }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            className="absolute h-[10.8rem] w-[10.8rem] rounded-full border border-dashed border-violet-300/25"
          />
          <MotionDiv
            animate={{ rotate: [0, 18, -10, 0], scale: [1, 1.05, 0.98, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-28 w-44 rounded-[60%_40%_55%_45%/52%_46%_54%_48%] bg-gradient-to-br from-cyan-200/90 via-blue-500/70 to-violet-500/80 shadow-[inset_18px_-14px_32px_rgba(15,23,42,0.42),0_0_42px_rgba(34,211,238,0.45)]"
          />
          <MotionDiv
            animate={{ rotate: [28, 44, 18, 28], scale: [1, 0.96, 1.06, 1] }}
            transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-32 w-24 rounded-[42%_58%_50%_50%/42%_38%_62%_58%] bg-gradient-to-br from-fuchsia-300/75 via-violet-500/75 to-cyan-300/65 shadow-[inset_-14px_18px_30px_rgba(15,23,42,0.5),0_0_34px_rgba(168,85,247,0.38)]"
          />
          <MotionDiv
            animate={{ rotate: [-32, -18, -38, -32], y: [0, -5, 3, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-24 w-36 rounded-[58%_42%_46%_54%/45%_55%_45%_55%] bg-gradient-to-br from-white/55 via-cyan-300/75 to-blue-700/70 shadow-[inset_10px_12px_26px_rgba(15,23,42,0.46),0_0_28px_rgba(125,211,252,0.42)]"
          />
          <div className="absolute h-9 w-9 rounded-full bg-gradient-to-br from-cyan-200 to-violet-400 shadow-[0_0_28px_rgba(34,211,238,0.85)]" />
          <div className="absolute inset-x-10 top-8 h-7 rounded-full bg-white/18 blur-xl" />
          <span className="absolute bottom-7 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
        </MotionDiv>
      </MotionDiv>
    </MotionDiv>
  );
}
