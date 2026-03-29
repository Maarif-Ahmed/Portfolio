'use client';

import dynamic from 'next/dynamic';
import useDeferredActivation from '@/hooks/useDeferredActivation';

const SiteChromeBundle = dynamic(() => import('@/components/SiteChromeBundle'), {
  ssr: false,
});

export default function DeferredSiteChrome() {
  const shouldRenderChrome = useDeferredActivation({ delayMs: 160, timeoutMs: 1000 });

  if (!shouldRenderChrome) {
    return null;
  }

  return <SiteChromeBundle />;
}
