'use client';

export default function LiquidBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(0,240,255,0.08),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.04),transparent_16%),radial-gradient(circle_at_20%_72%,rgba(0,240,255,0.04),transparent_22%)]" />
      <div className="absolute inset-0 opacity-70 mix-blend-screen animate-[ambient-drift_18s_ease-in-out_infinite] bg-[linear-gradient(140deg,transparent_0%,rgba(0,240,255,0.03)_30%,transparent_55%,rgba(224,224,224,0.02)_100%)]" />
    </div>
  );
}
