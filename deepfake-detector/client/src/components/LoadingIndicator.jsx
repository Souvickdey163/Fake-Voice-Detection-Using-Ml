export default function LoadingIndicator({ label = 'Loading...', variant = 'inline', className = '' }) {
  if (variant === 'panel') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <div className="relative h-24 w-48 overflow-visible">
          <video
            className="h-full w-full scale-[1.5] object-cover opacity-95 mix-blend-screen brightness-150 contrast-125 saturate-150"
            src="/media/loading-button.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.16),transparent_42%)] mix-blend-screen" />
        </div>
        {label && <p className="mt-4 text-sm font-medium text-slate-300">{label}</p>}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <span className="relative h-8 w-12 overflow-visible">
        <video
          className="h-full w-full scale-[1.7] object-cover mix-blend-screen brightness-150 contrast-125 saturate-150"
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
