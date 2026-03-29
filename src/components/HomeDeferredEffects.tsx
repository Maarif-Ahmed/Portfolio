'use client';

import dynamic from 'next/dynamic';
import useDeferredActivation from '@/hooks/useDeferredActivation';

const HomeMotionBundle = dynamic(() => import('@/components/HomeMotionBundle'), {
  ssr: false,
});

export default function HomeDeferredEffects() {
  const shouldRenderEffects = useDeferredActivation({ delayMs: 80, timeoutMs: 700 });

  if (!shouldRenderEffects) {
    return null;
  }

  return <HomeMotionBundle />;
}
