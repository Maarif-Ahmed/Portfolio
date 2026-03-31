import Navbar from '@/components/Navbar';
import DepthScanSurface from '@/components/DepthScanSurface';
import { MANUAL_NAME, MANUAL_SECTIONS } from '@/lib/manualContent';
import { PROJECTS } from '@/lib/projects';

const visibleProjects = PROJECTS.filter((project) => !project.isSecret);
const descriptionLines = MANUAL_SECTIONS.find((section) => section.title === 'DESCRIPTION')?.body ?? [];
const runtimeLine = MANUAL_SECTIONS.find((section) => section.title === 'RUNTIME')?.body?.[0] ?? '';
const noteLines = MANUAL_SECTIONS.find((section) => section.title === 'NOTES')?.body ?? [];

export default function AboutPage() {
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-[#d7dde2] text-[#10151c]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_24%),linear-gradient(180deg,rgba(248,251,252,0.88)_0%,rgba(235,240,244,0)_16%,rgba(208,216,223,0.42)_100%)]" />
      <div className="pointer-events-none fixed inset-y-0 left-[8%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(16,21,28,0.08),transparent)] lg:block" />
      <div className="pointer-events-none fixed inset-y-0 right-[8%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(16,21,28,0.08),transparent)] lg:block" />

      <div className="relative z-10">
        <Navbar />

        <section className="px-5 pb-20 pt-28 md:px-20 md:pb-28 md:pt-32">
          <div className="mx-auto max-w-[1500px]">
            <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
              <aside className="lg:pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#10151c]/38 md:text-[11px]">about</p>
                <p className="mt-6 max-w-[13rem] text-sm leading-7 text-[#10151c]/52 md:text-base md:leading-8">
                  The quieter register behind the homepage. Same systems, less pressure, clearer language.
                </p>
              </aside>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#10151c]/42 md:text-[11px]">who / method / runtime</p>
                <h1
                  className="mt-5 max-w-[9ch] text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-[#10151c]"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Building interfaces that stay calm under pressure<span className="text-[#00F0FF]">.</span>
                </h1>

                <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
                  <div className="space-y-6 text-[15px] leading-8 text-[#10151c]/72 md:text-[1.05rem] md:leading-9">
                    {descriptionLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <p>{runtimeLine}</p>
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-[#10151c]/12 bg-white/54 shadow-[0_28px_90px_rgba(16,21,28,0.08)] backdrop-blur-xl">
                    <div className="relative aspect-[4/5]">
                      <DepthScanSurface imageUrl={visibleProjects[0]?.img ?? '/casefiles/terminal-vibe.svg'} className="absolute inset-0" accentColor="#00F0FF" intensity={0.88} />
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/42">
                        <span>{MANUAL_NAME}</span>
                        <span>who</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/38">working note</p>
                        <p className="mt-3 text-sm leading-7 text-[#10151c]/62 md:text-base md:leading-8">
                          I care about tension, pace, clarity, and the feeling that a product has been authored rather than assembled.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 grid gap-4 border-t border-[#10151c]/10 pt-6 md:grid-cols-3">
                  <div className="rounded-[22px] border border-[#10151c]/10 bg-white/42 p-5 shadow-[0_18px_56px_rgba(16,21,28,0.05)]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/34">focus</p>
                    <p className="mt-4 text-sm leading-7 text-[#10151c]/72 md:text-base md:leading-8">
                      Product surfaces, motion systems, editorial interfaces, and technical storytelling.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-[#10151c]/10 bg-white/42 p-5 shadow-[0_18px_56px_rgba(16,21,28,0.05)]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/34">process</p>
                    <div className="mt-4 space-y-2 text-sm leading-7 text-[#10151c]/72 md:text-base md:leading-8">
                      {noteLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-[#10151c]/10 bg-white/42 p-5 shadow-[0_18px_56px_rgba(16,21,28,0.05)]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/34">selected systems</p>
                    <div className="mt-4 space-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#10151c]/58 md:text-[11px]">
                      {visibleProjects.map((project) => (
                        <p key={project.id}>{project.title} / {project.category}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 border-t border-[#10151c]/10 pt-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#10151c]/34 md:text-[11px]">selected stack</p>
                  <div className="mt-5 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#10151c]/54 md:text-[11px]">
                    <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">Next.js</span>
                    <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">TypeScript</span>
                    <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">GSAP</span>
                    <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">React Three Fiber</span>
                    <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">Tailwind CSS</span>
                    <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">OpenAI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
