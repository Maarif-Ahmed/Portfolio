import Link from 'next/link';
import CurrentBackdrop from '@/components/CurrentBackdrop';

const CONTACT_CHANNELS = [
  {
    label: 'email',
    value: 'marifahmed9@gmail.com',
    href: 'mailto:marifahmed9@gmail.com',
    note: 'best for project briefs, timelines, and async conversations',
  },
  {
    label: 'github',
    value: 'github.com/Maarif-Ahmed',
    href: 'https://github.com/Maarif-Ahmed',
    note: 'code, experiments, and the systems sitting behind the portfolio',
  },
  {
    label: 'linkedin',
    value: 'linkedin.com/in/marif-ahmed',
    href: 'https://www.linkedin.com/in/marif-ahmed/',
    note: 'professional context, background, and easier first contact',
  },
] as const;

const BUILD_TYPES = [
  'frontend systems',
  'AI product surfaces',
  'interactive portfolio builds',
  'motion-driven interfaces',
] as const;

export default function ContactPage() {
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-black text-[#E0E0E0]">
      <CurrentBackdrop variant="page" />

      <div className="relative z-10 px-5 pb-20 pt-24 md:px-20 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1500px]">
          <header className="grid gap-10 xl:grid-cols-[0.22fr_0.92fr_0.42fr] xl:gap-16">
            <aside className="hidden xl:block xl:pt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/34">chapter_03</p>
              <div className="mt-6 h-32 w-px bg-[linear-gradient(180deg,rgba(224,224,224,0.32),rgba(224,224,224,0.0))]" />
              <p className="mt-6 max-w-[10rem] font-mono text-[10px] uppercase leading-6 tracking-[0.24em] text-white/34">
                the site stops performing here and asks what we should build next.
              </p>
            </aside>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/42 md:text-xs">
                contact / quiet channel / direct line
              </p>
              <h1
                className="mt-5 max-w-[10ch] text-[clamp(2.8rem,12vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[#ebe6df] md:text-[clamp(3.2rem,7vw,7.8rem)]"
                style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
              >
                Bring the next system into the room<span className="text-white/82">.</span>
              </h1>
              <p className="mt-6 max-w-3xl text-[15px] leading-7 text-white/66 md:mt-7 md:text-[1.08rem] md:leading-9">
                If the work here feels like the right kind of pressure, send the brief. I like building interfaces that feel alive, products that hold tension, and systems that stay readable under load.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-white/52 md:mt-10">
                <span className="flow-chip">contact.sh</span>
                <span className="flow-chip">async preferred</span>
                <span className="flow-chip">build windows open</span>
              </div>
            </div>

            <div className="lg:pt-8">
              <div className="flow-card p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/54">route map</p>
                <div className="mt-6 space-y-4 font-mono text-[10px] uppercase tracking-[0.26em] text-white/44">
                  <div className="flow-divider pb-4">
                    <p>origin</p>
                    <p className="mt-2 text-white/72">hero chamber / shell window / casefile river</p>
                  </div>
                  <div className="flow-divider pb-4">
                    <p>current page</p>
                    <p className="mt-2 text-white/72">contact mode / direct channels / build types</p>
                  </div>
                  <div>
                    <p>downstream</p>
                    <p className="mt-2 text-white/72">reply / scope / design pressure / ship</p>
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
                <Link href="/about" className="border border-white/12 px-4 py-3 text-white/64 transition-colors hover:border-white/28 hover:text-white">
                  manual
                </Link>
              </div>
            </div>
          </header>

          <div className="mt-12 grid gap-10 xl:mt-16 xl:grid-cols-[0.24fr_1fr] xl:gap-12">
            <aside className="hidden xl:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">index</p>
              <div className="mt-6 space-y-3 font-mono text-[10px] uppercase tracking-[0.26em] text-white/40">
                <p>[ channels ]</p>
                <p>[ build types ]</p>
                <p>[ reply mode ]</p>
              </div>
            </aside>

            <div className="space-y-5 md:space-y-6">
              <section className="flow-card p-5 md:p-7">
                <div className="grid gap-5 md:grid-cols-[0.2fr_0.8fr] md:gap-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/54 md:text-xs">
                    CHANNELS
                  </p>
                  <div className="grid gap-4">
                    {CONTACT_CHANNELS.map((channel) => (
                      <a
                        key={channel.label}
                        href={channel.href}
                        target={channel.href.startsWith('http') ? '_blank' : undefined}
                        rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
                        className="group border border-white/10 bg-black/28 px-4 py-4 transition-colors hover:border-[#00F0FF]/28 focus-visible:border-[#00F0FF]/28"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/42">
                          {channel.label}
                        </p>
                        <p className="mt-3 text-base leading-7 text-white/84 transition-colors group-hover:text-[#00F0FF] group-focus-visible:text-[#00F0FF] md:text-lg">
                          {channel.value}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/56">{channel.note}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </section>

              <section className="flow-card p-5 md:p-7">
                <div className="grid gap-5 md:grid-cols-[0.2fr_0.8fr] md:gap-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/54 md:text-xs">
                    BUILD TYPES
                  </p>
                  <div className="space-y-5">
                    <p className="max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                      The best work usually sits somewhere between product clarity and controlled tension. These are the projects I&apos;m most interested in shaping next.
                    </p>
                    <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/68">
                      {BUILD_TYPES.map((buildType) => (
                        <span key={buildType} className="flow-chip">
                          {buildType}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="flow-card p-5 md:p-7">
                <div className="grid gap-5 md:grid-cols-[0.2fr_0.8fr] md:gap-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/54 md:text-xs">
                    REPLY MODE
                  </p>
                  <div className="space-y-3 text-sm leading-7 text-white/68 md:text-base">
                    <p>I&apos;m easiest to reach by email first, especially if you already know the product, scope, or pressure points.</p>
                    <p>If the project lives somewhere between interface craft, motion, and AI product thinking, that&apos;s usually a very good sign.</p>
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



