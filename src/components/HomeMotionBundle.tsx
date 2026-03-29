'use client';

import HeroDustOverlay from '@/components/HeroDustOverlay';
import HeroShockwaveOverlay from '@/components/HeroShockwaveOverlay';
import HomeSectionTransitions from '@/components/HomeSectionTransitions';
import VelocitySkew from '@/components/VelocitySkew';

export default function HomeMotionBundle() {
  return (
    <>
      <VelocitySkew />
      <HomeSectionTransitions />
      <HeroDustOverlay />
      <HeroShockwaveOverlay />
    </>
  );
}
