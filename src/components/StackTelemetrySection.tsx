'use client';

const PROCESS_CURRENTS = [
  {
    index: '01',
    label: 'frame',
    title: 'Lock the composition before the visuals get loud',
    body:
      'Hierarchy, pacing, spacing, and the interaction model get decided first. The shape of the page has to hold before the atmosphere earns its place.',
    traces: ['layout logic', 'responsive housing', 'reading flow'],
    bars: [18, 28, 42, 34, 50],
  },
  {
    index: '02',
    label: 'behavior',
    title: 'Let motion and tooling confirm what the surface means',
    body:
      'GSAP, AI behavior, command paths, and live affordances arrive as consequences. Motion should explain state, not decorate it.',
    traces: ['gsap timing', 'tool orchestration', 'command paths'],
    bars: [24, 38, 58, 46, 64],
  },
  {
    index: '03',
    label: 'proof',
    title: 'Leave evidence behind once the pressure drops',
    body:
      'Casefiles, readouts, metrics, and decision trails are what remain once the cinematic energy clears. The work still needs to stand up in daylight.',
    traces: ['casefile writing', 'artifact capture', 'delivery polish'],
    bars: [22, 34, 54, 40, 60],
  },
] as const;

const PROCESS_READOUTS = [
  {
    key: 'build bias',
    value: 'editorial layouts, controlled motion, and useful AI behavior',
  },
  {
    key: 'runtime',
    value: 'design, code, interaction, and shipping treated as one current',
  },
  {
    key: 'handoff',
    value: 'the shell cools down here, then the archive opens with evidence',
  },
] as const;

export default function StackTelemetrySection() {
  return (
    <section id="stack" className="home-panel section-lock-shell relative overflow-hidden bg-transparent px-5 py-20 md:px-20 md:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.52),rgba(224,224,224,0.14),transparent)] opacity-0 section-signal-line" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(224,224,224,0.05),transparent_18%),radial-gradient(circle_at_74%_28%,rgba(0,240,255,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_22%,transparent_100%)] opacity-0 section-signal-field" />
      <div className="pointer-events-none absolute inset-x-[16%] top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(224,224,224,0.04)_35%,rgba(0,240,255,0.16)_55%,rgba(255,255,255,0.0)_100%)] opacity-0 blur-2xl section-signal-beam" />
      <div className="pointer-events-none absolute left-[8%] top-[16%] h-56 w-56 rounded-full bg-[#00F0FF]/8 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[36%] h-40 w-40 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="mx-auto max-w-[1550px]">
        <div className="section-lock-copy grid gap-10 xl:grid-cols-[0.72fr_1.28fr] xl:gap-24">
          <div className="xl:pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[#00F0FF]/78 md:text-xs">
              process ledger / same current, calmer frequency
            </p>
            <h2
              className="section-lock-heading mt-6 max-w-[9ch] text-[clamp(3rem,7vw,7.2rem)] font-black uppercase leading-[0.8] tracking-[-0.09em] text-white"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              IMPACT HAS
              <br />
              TO TURN
              <br />
              INTO METHOD<span className="text-[#00F0FF]">.</span>
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/66 md:text-base md:leading-8">
              Between the shell and the archive, the page relaxes enough to show how the work actually gets built. This is where pressure turns into sequence and sequence turns into proof.
            </p>

            <div className="mt-10 space-y-4 border-t border-white/10 pt-5">
              {PROCESS_READOUTS.map((readoutPatch, readoutIndex) => (
                <div
                  key={readoutPatch.key}
                  className={readoutIndex < PROCESS_READOUTS.length - 1 ? 'flow-divider pb-4' : ''}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00F0FF]/74">
                    {readoutPatch.key}
                  </p>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-white/62">{readoutPatch.value}</p>
                </div>
              ))}
            </div>
          </div>

          <article className="flow-card relative overflow-hidden p-5 md:p-7 lg:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.68),transparent)] signal-sweep opacity-70" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_20%,rgba(0,240,255,0.03)_100%)] opacity-80" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/42">
                <span className="text-[#00F0FF]/76">sequence</span>
                <span>frame -&gt; behavior -&gt; proof</span>
              </div>

              <div className="mt-6 space-y-6">
                {PROCESS_CURRENTS.map((chapter, chapterIndex) => (
                  <div
                    key={chapter.index}
                    className={`grid gap-5 pt-6 md:grid-cols-[auto_1fr_auto] md:items-start ${chapterIndex > 0 ? 'border-t border-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00F0FF]/26 bg-black/36 text-[#00F0FF]">
                        {chapter.index}
                      </span>
                      <span>{chapter.label}</span>
                    </div>

                    <div>
                      <h3 className="max-w-[18ch] text-[clamp(1.45rem,2.9vw,2.55rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white">
                        {chapter.title}
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">{chapter.body}</p>

                      <div className="mt-5 flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/44">
                        {chapter.traces.map((traceLine) => (
                          <span key={traceLine} className="flow-chip px-2 py-1">
                            {traceLine}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-end gap-1.5 border-l border-white/10 pl-4 md:min-w-[5rem]">
                      {chapter.bars.map((barHeight, barIndex) => (
                        <span
                          key={`${chapter.index}-${barHeight}-${barIndex}`}
                          className="data-bar w-1.5 bg-[linear-gradient(180deg,rgba(224,224,224,0.34),rgba(0,240,255,0.9))]"
                          style={{
                            height: `${barHeight}px`,
                            animationDelay: `${barIndex * 0.08}s`,
                            animationDuration: `${1.6 + barIndex * 0.08}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        <div className="section-lock-copy mt-12 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <article className="flow-card relative overflow-hidden p-5 md:p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.66),transparent)] signal-sweep opacity-70" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#00F0FF]/76">hero alignment</p>
            <h3 className="mt-4 max-w-[11ch] text-[clamp(1.8rem,3.8vw,3rem)] font-black uppercase leading-[0.88] tracking-[-0.05em] text-white">
              SAME FORCE.
              <br />
              CALMER READOUT.
            </h3>
            <p className="mt-5 text-sm leading-7 text-white/64">
              The hero detonates. The shell gives that pressure a place to interact. This section turns it into process so the archive can open without feeling like a reset.
            </p>
          </article>

          <article className="flow-card relative overflow-hidden p-5 md:p-6">
            <div className="pointer-events-none absolute inset-y-0 left-[-14%] w-[34%] bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.14),transparent)] signal-sweep blur-xl" />
            <p className="relative z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-[#00F0FF]/76">handoff</p>
            <p className="relative z-10 mt-5 max-w-4xl text-[clamp(1.2rem,2vw,1.75rem)] font-black uppercase leading-[1.05] tracking-[-0.03em] text-white">
              hero pressure -&gt; shell window -&gt; process ledger -&gt; casefile river
            </p>
            <div className="relative z-10 mt-5 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-white/48">
              <span className="flow-chip">continuity over panel swaps</span>
              <span className="flow-chip">editorial rhythm over dashboard noise</span>
              <span className="flow-chip">evidence arrives already in motion</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
