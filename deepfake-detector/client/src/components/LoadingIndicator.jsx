export default function LoadingIndicator({ label = 'Loading...', variant = 'inline', className = '' }) {
  if (variant === 'panel') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <div className="relative h-24 w-48 overflow-hidden rounded-[28px] border border-cyan-300/15 bg-white/[0.03] shadow-[0_0_44px_rgba(56,189,248,0.14)]">
          <video
            className="h-full w-full scale-[1.5] object-cover opacity-95 mix-blend-screen brightness-125 contrast-125 saturate-150"
            src="/media/loading-button.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(90deg,transparent,rgba(56,189,248,0.08),rgba(168,85,247,0.08),transparent)]" />
        </div>
        {label && <p className="mt-4 text-sm font-medium text-slate-300">{label}</p>}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <span className="relative h-8 w-12 overflow-hidden rounded-full border border-white/15 bg-white/10">
        <video
          className="h-full w-full scale-[1.7] object-cover mix-blend-screen brightness-125 contrast-125 saturate-150"
          src="/media/loading-button.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}
