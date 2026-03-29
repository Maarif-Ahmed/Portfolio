import BuildNotesSection from '@/components/BuildNotesSection';
import HomeDeferredEffects from '@/components/HomeDeferredEffects';
import HomeDeferredSections from '@/components/HomeDeferredSections';
import HomeRiverBackdrop from '@/components/HomeRiverBackdrop';
import Navbar from '@/components/Navbar';
import ScrambleHover from '@/components/ScrambleHover';
import SystemInitializer from '@/components/SystemInitializer';
import { getBuildNotes } from '@/lib/buildNotes';

export default async function Home() {
  const buildNotes = await getBuildNotes(4);

  return (
    <main className="relative isolate overflow-x-hidden bg-black text-white">
      <HomeRiverBackdrop />

      <div className="relative z-10">
        <HomeDeferredEffects />
        <Navbar />
        <SystemInitializer />

        <section id="story" className="home-panel section-lock-shell relative z-0 overflow-hidden bg-transparent px-5 pb-24 pt-8 md:px-20 md:pb-44 md:pt-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(224,224,224,0.36),rgba(224,224,224,0.12),transparent)] opacity-0 section-signal-line" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(224,224,224,0.05),transparent_18%),radial-gradient(circle_at_72%_42%,rgba(255,255,255,0.04),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.018)_0%,transparent_26%,rgba(255,255,255,0.02)_100%)] opacity-0 section-signal-field" />
          <div className="pointer-events-none absolute inset-x-[18%] top-6 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(224,224,224,0.035)_35%,rgba(224,224,224,0.08)_55%,rgba(255,255,255,0.0)_100%)] opacity-0 blur-2xl section-signal-beam" />
          <div className="pointer-events-none absolute left-[8%] top-24 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-[10%] h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />

          <div className="mx-auto max-w-[1500px]">
            <div className="section-lock-copy grid gap-10 lg:grid-cols-[1fr_0.26fr] lg:items-end lg:gap-16">
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/38 md:text-xs">
                  afterglow / language returns
                </p>
                <h2
                  className="section-lock-heading mt-5 max-w-[11ch] text-[clamp(3rem,12vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-[#ebe6df] md:text-[clamp(3.5rem,8vw,8.9rem)]"
                  style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
                >
                  Systems that hold tension and stay clear<span className="text-white/82">.</span>
                </h2>
              </div>

              <div className="lg:pb-2">
                <div className="border-l border-white/10 pl-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/36">archive note_01</p>
                  <p className="mt-4 max-w-[16rem] font-mono text-[10px] uppercase leading-6 tracking-[0.24em] text-white/46">
                    The shell enters quietly. The archive answers later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeDeferredSections buildNotes={buildNotes} />
        <BuildNotesSection buildNotes={buildNotes} />

        <footer id="footer" className="home-panel section-lock-shell relative z-20 overflow-hidden border-t border-white/10 bg-transparent px-5 py-[4.5rem] text-[#E0E0E0] md:px-20 md:py-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(224,224,224,0.36),rgba(224,224,224,0.12),transparent)] opacity-0 section-signal-line" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.04),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_20%,transparent_100%)] opacity-0 section-signal-field" />
          <div className="pointer-events-none absolute inset-x-[16%] top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(224,224,224,0.04)_35%,rgba(224,224,224,0.08)_55%,rgba(255,255,255,0.0)_100%)] opacity-0 blur-2xl section-signal-beam" />
          <div className="pointer-events-none absolute right-[8%] top-[22%] h-56 w-56 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="pointer-events-none absolute left-[12%] bottom-[10%] h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />

          <div className="section-lock-copy mx-auto grid max-w-[1500px] grid-cols-1 gap-10 lg:grid-cols-[0.95fr_0.58fr_0.42fr]">
            <div className="lg:max-w-[48rem]">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.45em] text-white/38 md:text-xs">
                closing frame / next transmission
              </p>
              <h2 className="section-lock-heading max-w-[10ch] font-sans text-[clamp(2.8rem,12vw,5.6rem)] font-black uppercase leading-[0.84] tracking-[-0.08em] text-white md:text-[clamp(3.3rem,8vw,8.4rem)]">
                START THE
                <br />
                NEXT SYSTEM<span className="text-white/82">.</span>
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-white/64 md:mt-8 md:text-base md:leading-8">
                If the work feels like the right kind of pressure, let&apos;s make something sharp, fast, and difficult to forget.
              </p>
            </div>

            <div className="lg:self-end">
              <p className="max-w-md text-sm leading-7 text-white/56 md:text-base md:leading-8">
                The flow ends here, but the work doesn&apos;t. Reach out if you want to build an interface, product, or system that feels alive without losing control.
              </p>
              <div className="mt-8">
                <ScrambleHover
                  href="/contact"
                  text="> INIT_CONNECTION();"
                  className="inline-block border border-white/16 px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.32em] text-white/72 transition-colors hover:border-[#00F0FF]/42 hover:bg-[#00F0FF] hover:text-black md:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end gap-4 border-t border-white/10 pt-6 font-mono text-xs font-bold uppercase tracking-[0.3em] lg:pt-0">
              <ScrambleHover
                href="https://github.com/Maarif-Ahmed"
                text="[ GITHUB ]"
                target="_blank"
                rel="noreferrer"
                className="w-fit border-b border-transparent px-2 py-1 text-[#E0E0E0]/72 transition-colors hover:text-[#00F0FF]"
              />
              <ScrambleHover
                href="https://github.com/Maarif-Ahmed"
                text="[ SOURCE_CODE ]"
                target="_blank"
                rel="noreferrer"
                className="w-fit border-b border-transparent px-2 py-1 text-[#E0E0E0]/72 transition-colors hover:text-[#00F0FF]"
              />
              <ScrambleHover
                href="https://www.linkedin.com/in/marif-ahmed/"
                text="[ LINKEDIN ]"
                target="_blank"
                rel="noreferrer"
                className="w-fit border-b border-transparent px-2 py-1 text-[#E0E0E0]/72 transition-colors hover:text-[#00F0FF]"
              />
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
