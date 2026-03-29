'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/context/MotionContext';

gsap.registerPlugin(ScrollTrigger);

interface VelocitySkewProps {
  maxSkew?: number;
  selector?: string;
}

export default function VelocitySkew({
  maxSkew = 5,
  selector = '.velocity-skew',
}: VelocitySkewProps) {
  const { motionReduced } = useMotionPreference();

  useEffect(() => {
    const textPlates = gsap.utils.toArray<HTMLElement>(selector);
    if (textPlates.length === 0) return undefined;

    if (motionReduced) {
      gsap.set(textPlates, { skewY: 0, clearProps: 'willChange,transformOrigin' });
      return undefined;
    }

    const clampSkew = gsap.utils.clamp(-maxSkew, maxSkew);
    const skewBuffer = { value: 0 };
    const writeSkew = gsap.quickSetter(textPlates, 'skewY', 'deg');

    gsap.set(textPlates, {
      force3D: true,
      transformOrigin: '50% 50%',
      willChange: 'transform',
    });

    const scrollProbe = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      onUpdate: (scrollScene) => {
        const nextSkew = clampSkew(scrollScene.getVelocity() / -700);
        const directionChanged = Math.sign(nextSkew) !== Math.sign(skewBuffer.value);

        if (Math.abs(nextSkew) > Math.abs(skewBuffer.value) || directionChanged) {
          gsap.killTweensOf(skewBuffer);
          skewBuffer.value = nextSkew;
          writeSkew(skewBuffer.value);

          gsap.to(skewBuffer, {
            value: 0,
            duration: 1.1,
            ease: 'elastic.out(1, 0.3)',
            overwrite: true,
            onUpdate: () => writeSkew(skewBuffer.value),
          });
        }
      },
    });

    return () => {
      gsap.killTweensOf(skewBuffer);
      scrollProbe.kill();
      gsap.set(textPlates, { clearProps: 'transform,willChange,transformOrigin' });
    };
  }, [maxSkew, motionReduced, selector]);

  return null;
}
