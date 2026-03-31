'use client';

interface HeroTerrainOverlayProps {
  hasInteracted: boolean;
}

const KEY_ROWS = [
  ['W', 'A', 'S', 'D'],
  ['\u2191', '\u2190', '\u2193', '\u2192'],
];

export default function HeroTerrainOverlay({ hasInteracted }: HeroTerrainOverlayProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col justify-between px-5 pb-6 pt-24 text-[#10151c] md:px-20 md:pb-8 md:pt-28">
      <div className="max-w-[36rem]">
        <p
          data-hero-reveal
          className="font-mono text-[10px] uppercase tracking-[0.36em] text-[#10151c]/56 md:text-[11px]"
        >
          interactive terrain study / portfolio gate
        </p>
        <h1
          data-hero-reveal
          className="mt-5 max-w-[8ch] text-[clamp(4rem,13vw,8.8rem)] font-black uppercase leading-[0.82] tracking-[-0.1em] text-[#0f151b]"
          style={{ fontFamily: 'var(--font-display), sans-serif' }}
        >
          MAARIF
          <br />
          AHMED.
        </h1>
        <p
          data-hero-reveal
          className="mt-5 max-w-[26rem] font-mono text-[11px] uppercase tracking-[0.24em] text-[#10151c]/48 md:text-[12px]"
        >
          Walk the surface. The opening remembers every step before the work begins.
        </p>
        <div
          data-hero-reveal
          className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/42 md:text-[11px]"
        >
          <span>live terrain deformation</span>
          <span>continuous chunk field</span>
          <span>third-person traversal</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div data-hero-reveal className="grid max-w-[34rem] gap-5 md:grid-cols-[minmax(0,1fr)_10rem]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#10151c]/42 md:text-[11px]">
              first chapter
            </p>
            <p className="mt-3 max-w-[24rem] text-sm leading-7 text-[#10151c]/60 md:text-[15px] md:leading-8">
              A third-person terrain study inspired by sculpted snow, slow camera drift, and the kind of atmosphere that asks you to move before you read.
            </p>
          </div>

          <div className="border-t border-[#10151c]/10 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/34 md:text-[11px]">
              runtime
            </p>
            <div className="mt-3 space-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#10151c]/52 md:text-[11px]">
              <p>09 chunks</p>
              <p>foot-bone trace</p>
              <p>snow memory</p>
            </div>
          </div>
        </div>

        <div
          data-hero-reveal
          className={`self-start transition-opacity duration-500 md:self-auto ${hasInteracted ? 'opacity-0 md:opacity-0' : 'opacity-100'}`}
        >
          <p className="mb-3 text-left font-mono text-[10px] uppercase tracking-[0.3em] text-[#10151c]/42 md:text-right md:text-[11px]">
            use wasd / arrows or drag on touch
          </p>
          <div className="flex gap-3 md:gap-6">
            {KEY_ROWS.map((row) => (
              <div key={row.join('-')} className="grid grid-cols-4 gap-2">
                {row.map((keyLabel) => (
                  <span
                    key={keyLabel}
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#10151c]/14 bg-white/48 font-mono text-sm font-semibold text-[#10151c]/78 shadow-[0_12px_32px_rgba(16,21,28,0.08)] backdrop-blur-md md:h-11 md:w-11"
                  >
                    {keyLabel}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
