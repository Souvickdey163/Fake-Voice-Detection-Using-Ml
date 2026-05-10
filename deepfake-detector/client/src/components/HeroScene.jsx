import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMemo } from 'react';

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
  { title: 'Threat Index', value: 'Low Distortion', tone: 'from-blue-400/30 to-cyan-500/10', position: 'left-[10%] bottom-[12%]' },
];

export default function HeroScene() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 110, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 110, damping: 22 });
  const tx = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 120, damping: 24 });
  const ty = useSpring(useTransform(my, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 24 });

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
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry }}
      className="relative isolate mx-auto h-[28rem] w-full max-w-[42rem] overflow-hidden rounded-[36px] border border-white/12 bg-[radial-gradient(circle_at_50%_22%,rgba(56,189,248,0.22),transparent_24%),radial-gradient(circle_at_74%_20%,rgba(168,85,247,0.2),transparent_20%),linear-gradient(145deg,rgba(5,10,24,0.96),rgba(8,14,34,0.88))] p-5 shadow-[0_35px_120px_rgba(15,23,42,0.75)] [transform-style:preserve-3d]"
    >
      <div className="absolute inset-0 rounded-[36px] border border-cyan-300/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_32%)]" />
      <div className="absolute left-6 top-6 h-20 w-20 rounded-full border border-cyan-300/15 bg-cyan-300/10 blur-2xl" />
      <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full border border-violet-300/15 bg-violet-400/10 blur-3xl" />

      {panels.map((panel) => (
        <motion.div
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
        </motion.div>
      ))}

      <div className="absolute inset-x-10 bottom-8 hidden h-24 rounded-[28px] border border-white/10 bg-slate-950/45 px-5 py-4 backdrop-blur-xl lg:block">
        <div className="flex h-full items-end gap-1.5">
          {waveformBars.map((bar) => (
            <motion.span
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
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-cyan-300/70 shadow-[0_0_20px_rgba(34,211,238,0.65)]"
          style={{ left: particle.x, top: particle.y, width: particle.size, height: particle.size }}
          animate={{ y: [0, -16, 0], opacity: [0.4, 1, 0.45], scale: [1, 1.25, 1] }}
          transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
        />
      ))}

      <motion.div style={{ x: tx, y: ty }} className="relative flex h-full items-center justify-center">
        <div className="absolute h-72 w-72 rounded-full border border-cyan-300/20 bg-cyan-300/5 shadow-[0_0_120px_rgba(56,189,248,0.2)]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute h-[18rem] w-[18rem] rounded-full border border-dashed border-cyan-300/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute h-[14rem] w-[14rem] rounded-full border border-violet-300/25"
        />
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.04, 1] }}
          transition={{ rotate: { duration: 26, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
          className="absolute h-44 w-44 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-violet-500/20 shadow-[0_0_80px_rgba(59,130,246,0.22)] backdrop-blur-2xl [transform:rotate(18deg)]"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-52 w-52 items-center justify-center rounded-[2.5rem] border border-white/12 bg-[linear-gradient(160deg,rgba(18,24,49,0.98),rgba(7,12,24,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_80px_rgba(8,47,73,0.5)]"
        >
          <div className="absolute inset-4 rounded-[2rem] border border-cyan-300/10" />
          <div className="absolute inset-x-10 top-8 h-6 rounded-full bg-cyan-300/15 blur-md" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/8">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 shadow-[0_0_30px_rgba(34,211,238,0.85)]" />
          </div>
          <div className="absolute bottom-9 flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-cyan-100/70">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
            Voice Core
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
