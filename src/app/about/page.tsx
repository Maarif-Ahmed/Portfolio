import Link from 'next/link';
import CurrentBackdrop from '@/components/CurrentBackdrop';
import DecipherText from '@/components/DecipherText';
import { MANUAL_NAME, MANUAL_SECTIONS, MANUAL_SYNOPSIS } from '@/lib/manualContent';

export default function AboutPage() {
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-background text-foreground">
      <CurrentBackdrop variant="page" />

      <div className="relative z-10 px-5 pb-20 pt-24 md:px-20 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1500px]">
          <header className="grid gap-8 xl:grid-cols-[0.18fr_0.98fr_0.42fr] xl:gap-16">
            <aside className="hidden xl:block xl:pt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/34">chapter_02</p>
              <div className="mt-6 h-32 w-px bg-[linear-gradient(180deg,rgba(224,224,224,0.32),rgba(224,224,224,0.0))]" />
              <p className="mt-6 max-w-[10rem] font-mono text-[10px] uppercase leading-6 tracking-[0.24em] text-white/34">
                the manual strips the theater down until the method is all that remains.
              </p>
            </aside>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/42 md:text-xs">
                manual / current register / readable mode
              </p>
              <h1
                className="mt-5 max-w-[10ch] text-[clamp(2.8rem,12vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[#ebe6df] md:text-[clamp(3.2rem,7vw,7.8rem)]"
                style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
              >
                Who this system is for<span className="text-white/82">.</span>
              </h1>
              <p className="mt-6 max-w-3xl text-[15px] leading-7 text-white/66 md:mt-7 md:text-[1.08rem] md:leading-9">
                The homepage opens with pressure. This page is the quieter register underneath it: the same world, fewer theatrics, and a clearer explanation of what I build and why the interaction model matters.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-white/52 md:mt-10">
                <span className="flow-chip">man 1 maarif</span>
                <span className="flow-chip">{MANUAL_SYNOPSIS}</span>
                <span className="flow-chip">{MANUAL_NAME}</span>
              </div>
            </div>

            <div className="lg:pt-8">
              <div className="flow-card p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/54">route map</p>
                <div className="mt-6 space-y-4 font-mono text-[10px] uppercase tracking-[0.26em] text-white/44">
                  <div className="flow-divider pb-4">
                    <p>origin</p>
                    <p className="mt-2 text-white/72">hero pressure / shell window / process ledger</p>
                  </div>
                  <div className="flow-divider pb-4">
                    <p>current page</p>
                    <p className="mt-2 text-white/72">manual mode / identity / runtime / notes</p>
                  </div>
                  <div>
                    <p>downstream</p>
                    <p className="mt-2 text-white/72">casefile river / contact / return to root</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.28em] md:mt-5">
                <Link href="/" className="border border-white/14 px-4 py-3 text-white/72 transition-colors hover:border-[#00F0FF]/28 hover:text-[#00F0FF] focus-visible:border-[#00F0FF]/28 focus-visible:text-[#00F0FF]">
                  return /root
                </Link>
                <Link href="/#work" className="border border-white/12 px-4 py-3 text-white/64 transition-colors hover:border-white/28 hover:text-white">
                  casefiles
                </Link>
                <Link href="/contact" className="border border-white/12 px-4 py-3 text-white/64 transition-colors hover:border-white/28 hover:text-white">
                  contact
                </Link>
              </div>
            </div>
          </header>

          <div className="mt-12 grid gap-10 xl:mt-16 xl:grid-cols-[0.24fr_1fr] xl:gap-12">
            <aside className="hidden xl:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">index</p>
              <div className="mt-6 space-y-3 font-mono text-[10px] uppercase tracking-[0.26em] text-white/40">
                <p>[ name ]</p>
                <p>[ synopsis ]</p>
                {MANUAL_SECTIONS.map((section) => (
                  <p key={section.title}>[ {section.title.toLowerCase()} ]</p>
                ))}
                <p>[ see also ]</p>
              </div>
            </aside>

            <div className="space-y-5 md:space-y-6">
              <section className="flow-card p-5 md:p-7">
                <div className="grid gap-5 md:grid-cols-[0.22fr_0.78fr] md:gap-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/54 md:text-xs">
                    NAME
                  </p>
                  <p className="text-base leading-8 text-white/76 md:text-lg">{MANUAL_NAME}</p>
                </div>
              </section>

              <section className="flow-card p-5 md:p-7">
                <div className="grid gap-5 md:grid-cols-[0.22fr_0.78fr] md:gap-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/54 md:text-xs">
                    SYNOPSIS
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-white/72 md:text-base">
                    {MANUAL_SYNOPSIS}
                  </pre>
                </div>
              </section>

              {MANUAL_SECTIONS.map((section) => (
                <section key={section.title} className="flow-card p-5 md:p-7">
                  <div className="grid gap-5 md:grid-cols-[0.22fr_0.78fr] md:gap-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/54 md:text-xs">
                      {section.title}
                    </p>
                    <div className="space-y-3 text-sm leading-7 text-white/72 md:text-base">
                      {section.title === 'DESCRIPTION'
                        ? section.body.map((line, index) => (
                            <p key={`${section.title}-${index}`}>
                              <DecipherText text={line} delay={index * 0.2} />
                            </p>
                          ))
                        : section.body.map((line) => <p key={line}>{line}</p>)}
                    </div>
                  </div>
                </section>
              ))}

              <section className="flow-card p-5 md:p-7">
                <div className="grid gap-5 md:grid-cols-[0.22fr_0.78fr] md:gap-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/54 md:text-xs">
                    SEE ALSO
                  </p>
                  <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-foreground/65 md:text-xs">
                    <Link href="/#work" className="flow-chip transition-colors hover:text-[#00F0FF] focus-visible:text-[#00F0FF]">
                      work gallery
                    </Link>
                    <Link href="/#shell" className="flow-chip transition-colors hover:text-[#00F0FF] focus-visible:text-[#00F0FF]">
                      shell window
                    </Link>
                    <Link href="/contact" className="flow-chip transition-colors hover:text-[#00F0FF] focus-visible:text-[#00F0FF]">
                      contact
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
