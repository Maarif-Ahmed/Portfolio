import HomeContactForm from '@/components/HomeContactForm';
import Navbar from '@/components/Navbar';
import ScrambleHover from '@/components/ScrambleHover';
import SystemInitializer from '@/components/SystemInitializer';
import WorkGallery from '@/components/WorkGallery';
import { MANUAL_SECTIONS } from '@/lib/manualContent';

const HOME_INTRO = MANUAL_SECTIONS.find((s) => s.title === 'DESCRIPTION')?.body ?? [];
const HOME_DEPENDENCIES = MANUAL_SECTIONS.find((s) => s.title === 'DEPENDENCIES')?.body ?? [];
const HOME_RUNTIME = MANUAL_SECTIONS.find((s) => s.title === 'RUNTIME')?.body ?? [];
const HOME_NOTES = MANUAL_SECTIONS.find((s) => s.title === 'NOTES')?.body ?? [];
const HOME_STATUS = MANUAL_SECTIONS.find((s) => s.title === 'EXIT STATUS')?.body ?? [];

const ALL_SERVICES = [
  'Frontend Architecture',
  'Motion Systems',
  'Interface Direction',
  'Product Engineering',
  '3D / WebGL',
  'Design Systems',
  'Creative Consulting',
];

export default function Home() {
  return (
    <main className="relative isolate overflow-x-hidden bg-[#d7dde2] text-[#10151c]">
      {/* ── Background gradients ── */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,#edf1f3_0%,#e3e8eb_28%,#d8dee3_100%)]" />
      <div className="pointer-events-none fixed inset-y-0 left-[7.5%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(16,21,28,0.08),transparent)] lg:block" />
      <div className="pointer-events-none fixed inset-y-0 right-[7.5%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(16,21,28,0.08),transparent)] lg:block" />

      <div className="relative z-10">
        <Navbar />
        <SystemInitializer />

        {/* ══════════════════════════════════════════════════
            §1  ABOUT / SERVICES  "Built for pressure…"
        ══════════════════════════════════════════════════ */}
        <section id="who" className="px-5 py-24 md:px-20 md:py-40">
          <div className="mx-auto max-w-[1440px]">
            <div className="border-t border-[#10151c]/10 pt-8 md:pt-10">

              {/* ── Overline ── */}
              <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.38em] text-[#10151c]/38 md:mb-14 md:text-[11px]">
                field notes
              </p>

              {/* ── 2-col grid: heading | body ── */}
              <div className="about-grid">

                {/* Left: big heading */}
                <div className="about-heading-col">
                  <h2
                    className="about-heading"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Built for pressure, cut clean through noise
                    <span className="text-[#00F0FF]">.</span>
                  </h2>
                </div>

                {/* Right: prose + structured data + services */}
                <div className="about-body-col">

                  {/* Prose paragraphs */}
                  <div className="about-prose">
                    {HOME_INTRO.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>

                  {/* Data rows */}
                  <div className="about-data-rows">
                    {/* Observation */}
                    <div className="about-data-row">
                      <p className="about-data-label">Observation</p>
                      <div className="about-data-body">
                        {HOME_NOTES.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>

                    {/* Runtime */}
                    <div className="about-data-row">
                      <p className="about-data-label">Runtime</p>
                      <div className="about-data-body">
                        {HOME_RUNTIME.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>

                    {/* Focus */}
                    <div className="about-data-row">
                      <p className="about-data-label">Focus</p>
                      <div className="about-tags">
                        {HOME_DEPENDENCIES.map((item, i) => (
                          <span key={item} className="flex items-center gap-4">
                            <span>{item}</span>
                            {i < HOME_DEPENDENCIES.length - 1 && (
                              <span className="h-px w-6 bg-[#10151c]/14" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="about-data-row">
                      <p className="about-data-label">Status</p>
                      <div className="about-data-body">
                        {HOME_STATUS.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Services list */}
                  <div className="services-block">
                    <p className="services-overline">Services</p>
                    <ul className="services-list">
                      {ALL_SERVICES.map((svc) => (
                        <li key={svc} className="services-list__item">
                          <span>{svc}</span>
                          <span className="services-list__arrow" aria-hidden="true">↗</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §2  WORK GALLERY  (full component)
        ══════════════════════════════════════════════════ */}
        <WorkGallery />

        {/* ══════════════════════════════════════════════════
            §3  CONTACT / FOOTER  "Let's build…"
        ══════════════════════════════════════════════════ */}
        <footer id="footer" className="px-5 pb-24 pt-16 md:px-20 md:pb-32 md:pt-24">
          <div className="mx-auto max-w-[1440px]">
            <div className="footer-grid border-t border-[#10151c]/10 pt-8 md:pt-10">

              {/* Left: CTA */}
              <div className="footer-cta">
                <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#10151c]/38 md:text-[11px]">
                  contact
                </p>

                <h2
                  className="footer-heading"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Let&apos;s build the next artifact
                  <span className="text-[#00F0FF]">.</span>
                </h2>

                <p className="footer-desc">
                  Interfaces, campaigns, product surfaces, and systems that need
                  cinematic restraint, technical control, and a sharper point of
                  view.
                </p>

                <div className="footer-links">
                  <ScrambleHover
                    href="mailto:marifahmed9@gmail.com"
                    text="mail"
                    className="transition-colors hover:text-[#00F0FF]"
                  />
                  <span className="h-px w-6 bg-[#10151c]/14" />
                  <ScrambleHover
                    href="https://www.linkedin.com/in/marif-ahmed/"
                    target="_blank"
                    rel="noreferrer"
                    text="linkedin"
                    className="transition-colors hover:text-[#00F0FF]"
                  />
                  <span className="h-px w-6 bg-[#10151c]/14" />
                  <ScrambleHover
                    href="https://github.com/Maarif-Ahmed"
                    target="_blank"
                    rel="noreferrer"
                    text="github"
                    className="transition-colors hover:text-[#00F0FF]"
                  />
                </div>
              </div>

              {/* Right: Form */}
              <div className="footer-form-col">
                <HomeContactForm />
              </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="footer-bar">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/28 md:text-[11px]">
                © {new Date().getFullYear()} Maarif Ahmed
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/28 md:text-[11px]">
                Frontend Engineer
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
