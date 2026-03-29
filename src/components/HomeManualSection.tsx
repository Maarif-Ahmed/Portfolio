import Link from 'next/link';
import { MANUAL_NAME, MANUAL_SECTIONS, MANUAL_SYNOPSIS } from '@/lib/manualContent';

export default function HomeManualSection() {
  const previewSections = MANUAL_SECTIONS.slice(0, 3);

  return (
    <section id="manual" className="bg-background px-6 py-14 md:px-20 md:py-20">
      <div className="mx-auto max-w-6xl border border-[#E0E0E0]/22 bg-[#0a0d10] shadow-[0_0_35px_rgba(224,224,224,0.06)]">
        <div className="flex flex-col gap-3 border-b border-[#E0E0E0]/18 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]/60 md:text-xs">
            man 1 maarif
          </p>
          <Link
            href="/about"
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/60 transition-colors hover:text-[#00F0FF] md:text-xs"
          >
            open full manual
          </Link>
        </div>
        <div className="grid gap-10 px-5 py-6 md:grid-cols-[0.4fr_0.6fr] md:px-8 md:py-8">
          <div className="space-y-4 font-mono text-[11px] text-[#E0E0E0]/75 md:text-sm">
            <div>
              <p className="mb-1 text-[#E0E0E0]">NAME</p>
              <p className="text-foreground/75">{MANUAL_NAME}</p>
            </div>
            <div>
              <p className="mb-1 text-[#E0E0E0]">SYNOPSIS</p>
              <p className="text-foreground/75">{MANUAL_SYNOPSIS}</p>
            </div>
          </div>
          <div className="space-y-6">
            {previewSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0] md:text-xs">
                  {section.title}
                </p>
                <div className="space-y-2 text-sm leading-7 text-foreground/80 md:text-base">
                  {section.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
