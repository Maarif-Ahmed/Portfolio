'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import useDeferredActivation from '@/hooks/useDeferredActivation';
import type { BuildNote } from '@/lib/buildNoteTypes';

const HomeBelowFoldBundle = dynamic(() => import('@/components/HomeBelowFoldBundle'), {
  ssr: false,
  loading: () => (
    <div className="bg-black">
      <section className="mx-auto max-w-[1500px] px-5 pb-10 pt-2 md:px-20">
        <div className="mx-auto h-[13rem] max-w-4xl border border-white/10 bg-[#05080a]" />
      </section>
      <section className="px-5 py-20 md:px-20 md:py-28">
        <div className="mx-auto h-[28rem] max-w-[1500px] border border-white/10 bg-[#040708]" />
      </section>
      <section className="px-5 pb-24 md:px-20 md:pb-32">
        <div className="mx-auto h-[34rem] max-w-[1500px] border border-white/10 bg-[#030506]" />
      </section>
    </div>
  ),
});

interface HomeDeferredSectionsProps {
  buildNotes: BuildNote[];
}

export default function HomeDeferredSections({ buildNotes }: HomeDeferredSectionsProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const idleReady = useDeferredActivation({ timeoutMs: 1500 });
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
        }
      },
      { rootMargin: '45% 0px' }
    );

    observer.observe(shell);

    return () => observer.disconnect();
  }, []);

  const shouldRenderSections = idleReady && nearViewport;

  if (!shouldRenderSections) {
    return (
      <div ref={shellRef} className="bg-black">
        <section className="mx-auto max-w-[1500px] px-5 pb-10 pt-2 md:px-20">
          <div className="mx-auto h-[13rem] max-w-4xl border border-white/10 bg-[#05080a]" />
        </section>
        <section className="px-5 py-20 md:px-20 md:py-28">
          <div className="mx-auto h-[28rem] max-w-[1500px] border border-white/10 bg-[#040708]" />
        </section>
        <section className="px-5 pb-24 md:px-20 md:pb-32">
          <div className="mx-auto h-[34rem] max-w-[1500px] border border-white/10 bg-[#030506]" />
        </section>
      </div>
    );
  }

  return <HomeBelowFoldBundle buildNotes={buildNotes} />;
}
