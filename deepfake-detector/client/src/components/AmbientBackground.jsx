const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  size: 10 + (index % 4) * 6,
  left: `${(index * 11) % 100}%`,
  top: `${(index * 17) % 100}%`,
  delay: `${(index % 6) * 1.3}s`,
  duration: `${14 + (index % 5) * 3}s`,
}));

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(37,99,235,0.18),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.16),transparent_20%),radial-gradient(circle_at_50%_82%,rgba(6,182,212,0.14),transparent_24%),linear-gradient(180deg,#040816_0%,#070d1d_48%,#02050d_100%)]" />
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(59,130,246,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.07)_1px,transparent_1px)] [background-size:90px_90px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.22)_52%,rgba(2,6,23,0.8)_100%)]" />
      <div className="absolute left-[8%] top-[12%] h-64 w-64 rounded-full bg-blue-500/14 blur-[110px] animate-ambient-float" />
      <div className="absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-violet-500/14 blur-[120px] animate-ambient-float-delayed" />
      <div className="absolute bottom-[6%] left-[28%] h-80 w-80 rounded-full bg-cyan-400/10 blur-[135px] animate-ambient-float-slow" />
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='none'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.8'/></svg>\")",
        }}
      />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full border border-cyan-300/20 bg-white/10 shadow-[0_0_18px_rgba(34,211,238,0.14)] animate-particle-drift"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}
