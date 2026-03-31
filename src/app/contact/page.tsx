import Navbar from '@/components/Navbar';

const CONTACT_CHANNELS = [
  {
    label: 'email',
    value: 'marifahmed9@gmail.com',
    href: 'mailto:marifahmed9@gmail.com',
    note: 'Best for project scope, timelines, and first contact.',
  },
  {
    label: 'github',
    value: 'github.com/Maarif-Ahmed',
    href: 'https://github.com/Maarif-Ahmed',
    note: 'Code, experiments, and the systems behind the interface.',
  },
  {
    label: 'linkedin',
    value: 'linkedin.com/in/marif-ahmed',
    href: 'https://www.linkedin.com/in/marif-ahmed/',
    note: 'Background, context, and a more standard way to connect.',
  },
] as const;

export default function ContactPage() {
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-[#d7dde2] text-[#10151c]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_24%),linear-gradient(180deg,rgba(248,251,252,0.88)_0%,rgba(235,240,244,0)_18%,rgba(208,216,223,0.42)_100%)]" />
      <div className="pointer-events-none fixed inset-y-0 left-[8%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(16,21,28,0.08),transparent)] lg:block" />
      <div className="pointer-events-none fixed inset-y-0 right-[8%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(16,21,28,0.08),transparent)] lg:block" />

      <div className="relative z-10">
        <Navbar />

        <section className="px-5 pb-20 pt-28 md:px-20 md:pb-28 md:pt-32">
          <div className="mx-auto max-w-[1500px]">
            <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
              <aside className="lg:pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#10151c]/38 md:text-[11px]">contact</p>
                <p className="mt-6 max-w-[13rem] text-sm leading-7 text-[#10151c]/52 md:text-base md:leading-8">
                  If the work feels like the right kind of tension, send the brief and we&apos;ll shape the next artifact.
                </p>
              </aside>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#10151c]/42 md:text-[11px]">open channel / direct line</p>
                <h1
                  className="mt-5 max-w-[10ch] text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-[#10151c]"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Let&apos;s build something with a sharper point of view<span className="text-[#00F0FF]">.</span>
                </h1>
                <p className="mt-6 max-w-3xl text-[15px] leading-8 text-[#10151c]/66 md:text-[1.05rem] md:leading-9">
                  I like projects that need clarity, atmosphere, and real engineering discipline at the same time. Product launches, portfolio builds, campaign surfaces, AI interfaces, and motion-led systems all fit naturally here.
                </p>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  {CONTACT_CHANNELS.map((channel) => (
                    <a
                      key={channel.label}
                      href={channel.href}
                      target={channel.href.startsWith('http') ? '_blank' : undefined}
                      rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="group rounded-[22px] border border-[#10151c]/10 bg-white/50 p-5 shadow-[0_18px_56px_rgba(16,21,28,0.05)] transition-colors hover:border-[#00F0FF]/38"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#10151c]/34">{channel.label}</p>
                      <p className="mt-4 text-[1.15rem] font-semibold tracking-[-0.04em] text-[#10151c] transition-colors group-hover:text-[#00F0FF]" style={{ fontFamily: 'var(--font-display), sans-serif' }}>
                        {channel.value}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#10151c]/58">{channel.note}</p>
                    </a>
                  ))}
                </div>

                <div className="mt-12 grid gap-4 border-t border-[#10151c]/10 pt-6 md:grid-cols-[minmax(0,1fr)_20rem]">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#10151c]/34 md:text-[11px]">what I can help with</p>
                    <div className="mt-5 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#10151c]/54 md:text-[11px]">
                      <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">frontend systems</span>
                      <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">AI product surfaces</span>
                      <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">motion direction</span>
                      <span className="border border-[#10151c]/10 bg-white/38 px-3 py-3">portfolio reconstruction</span>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[#10151c]/10 bg-white/50 p-5 shadow-[0_18px_56px_rgba(16,21,28,0.05)]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#10151c]/34">reply mode</p>
                    <p className="mt-4 text-sm leading-7 text-[#10151c]/62 md:text-base md:leading-8">
                      Email is the best first step. If you already know the scope, timeline, or constraints, include them and I can respond with something sharper and faster.
                    </p>
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
