import type { BuildNote } from '@/lib/buildNoteTypes';

const TONE_LABELS = {
  feat: 'feature',
  fix: 'stability',
  refactor: 'refactor',
  perf: 'performance',
  origin: 'origin',
  system: 'system',
} as const;

interface BuildNotesSectionProps {
  buildNotes: BuildNote[];
}

export default function BuildNotesSection({ buildNotes }: BuildNotesSectionProps) {
  const ledgerSource = buildNotes.some((entry) => entry.source === 'git') ? 'live repo ledger' : 'curated ledger';

  return (
    <section
      id="build-notes"
      className="home-panel section-lock-shell relative overflow-hidden bg-transparent px-5 py-20 md:px-20 md:py-40"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(224,224,224,0.32),rgba(224,224,224,0.1),transparent)] opacity-0 section-signal-line" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.04),transparent_18%),radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.03),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.016)_0%,transparent_24%,transparent_100%)] opacity-0 section-signal-field" />
      <div className="pointer-events-none absolute inset-x-[18%] top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(224,224,224,0.035)_40%,rgba(224,224,224,0.07)_58%,rgba(255,255,255,0)_100%)] opacity-0 blur-2xl section-signal-beam" />

      <div className="mx-auto max-w-[1500px]">
        <div className="section-lock-copy grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-white/38 md:text-xs">
              build_notes / repository ledger
            </p>
            <h2
              className="section-lock-heading mt-5 max-w-[9ch] text-[clamp(3rem,10vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-[#ebe6df]"
              style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
            >
              The archive keeps moving<span className="text-white/82">.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/58 md:text-base md:leading-8">
              Recent revisions from the repository ledger. Quiet changes, structural pressure, and the small passes that keep the chamber readable.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 border border-white/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
              <span className="h-1.5 w-1.5 rounded-full bg-white/56" />
              {ledgerSource}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {buildNotes.map((entry) => (
              <article key={entry.id} className="flow-card flex min-h-[13rem] flex-col justify-between px-5 py-5 md:px-6 md:py-6">
                <div className="flex items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">
                  <span>{entry.shortHash}</span>
                  <span>{entry.date}</span>
                </div>

                <div className="mt-8">
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/34">
                    {TONE_LABELS[entry.tone]}
                  </p>
                  <h3 className="mt-4 max-w-[16ch] text-[1.35rem] font-semibold leading-[1.02] tracking-[-0.04em] text-white/88 md:text-[1.55rem]">
                    {entry.headline}
                  </h3>
                  <p className="mt-4 max-w-[30rem] text-sm leading-7 text-white/54">{entry.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
