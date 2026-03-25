'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import WorkGallery from '@/components/WorkGallery';
import AsciiLogo from '@/components/AsciiLogo';
import Navbar from '@/components/Navbar';
import DecipherText from '@/components/DecipherText';
import { useSudo } from '@/context/SudoContext';

gsap.registerPlugin(ScrollTrigger);

const splitText = (text: string) => {
  return text.split('').map((char, i) => (
    <span key={i} className="char inline-block will-change-transform">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));
};

// Terminal command marquee
const MARQUEE_COMMANDS = [
  'npm run build',
  'git push origin main',
  'docker compose up -d',
  'npx tsc --noEmit',
  'ssh root@server',
  'curl -X POST /api',
  'vim ~/.bashrc',
  'chmod 777 deploy.sh',
  'grep -r "TODO"',
  'pm2 restart all',
  'tail -f access.log',
  'make && make install',
];

export default function Home() {
  const { sudoMode } = useSudo();
  const heroRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const title3Ref = useRef<HTMLHeadingElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Hero warp animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray('.char') as HTMLElement[];
      const titles = [title1Ref.current, title2Ref.current, title3Ref.current];

      gsap.set(titles, { perspective: 1000, transformStyle: "preserve-3d" });
      gsap.set(".title-wrapper", { overflow: "visible" });

      gsap.to(chars, {
        z: 800,
        scale: 8,
        opacity: 0,
        textShadow: "0px 0px 40px #E0E0E0, 0px 0px 80px #E0E0E0",
        rotationZ: () => gsap.utils.random(-15, 15),
        rotationX: () => gsap.utils.random(-15, 15),
        x: () => gsap.utils.random(-400, 400),
        y: () => gsap.utils.random(-400, 400),
        stagger: { each: 0.002, from: "center" },
        ease: "power4.in",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=800",
          scrub: 1, 
          pin: true,
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Marquee center-blur effect
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const update = () => {
      const children = marquee.querySelectorAll('.marquee-cmd');
      const viewCenter = window.innerWidth / 2;

      children.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.left + rect.width / 2;
        const dist = Math.abs(elCenter - viewCenter);
        const maxDist = window.innerWidth / 2;
        const ratio = Math.min(dist / maxDist, 1);
        // Items at center are sharp, edges are blurred
        const blur = ratio * 3;
        const opacity = 1 - ratio * 0.6;
        (el as HTMLElement).style.filter = `blur(${blur}px)`;
        (el as HTMLElement).style.opacity = String(opacity);
      });
    };

    const interval = setInterval(update, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero */}
      <section id="hero" ref={heroRef} className="h-screen flex flex-col justify-center px-6 md:px-20 relative pt-16 overflow-hidden">
        {sudoMode && (
          <div className="absolute top-24 left-20 text-[10px] text-red-500 font-mono opacity-60">
            {'// Note: This animation took 4 hours to perfect. The transform-origin is critical here.'}
          </div>
        )}
        <div className="title-wrapper overflow-visible">
          <h1 ref={title1Ref} className="text-[clamp(3rem,11vw,8rem)] font-black uppercase leading-[0.8] tracking-tighter text-white mix-blend-difference relative z-30 whitespace-nowrap">
            {splitText('FULLSTACK_')}
          </h1>
        </div>
        <div className="title-wrapper overflow-visible mt-[2vh]">
          <h1 ref={title2Ref} className="text-[clamp(3rem,11vw,8rem)] font-black uppercase leading-[0.8] tracking-tighter text-accent relative z-20 whitespace-nowrap">
            {splitText('WEB_DEV')}
          </h1>
        </div>
        <div className="title-wrapper overflow-visible flex flex-col md:flex-row md:items-end gap-2 md:gap-8 mt-[2vh]">
          <h1 ref={title3Ref} className="text-[clamp(3rem,11vw,8rem)] font-black uppercase leading-[0.8] tracking-tighter text-white mix-blend-difference relative z-10 whitespace-nowrap">
            {splitText('& WIZARDRY')}<span className="inline-block animate-pulse w-[clamp(1rem,3vw,3rem)] h-[clamp(2.5rem,8vw,6rem)] bg-accent ml-2 relative -top-1 md:-top-2"></span>
          </h1>
        </div>
        <div className="absolute bottom-10 md:bottom-16 right-6 md:right-20 max-w-xs md:max-w-sm">
           <p className="text-[9px] md:text-xs uppercase tracking-widest leading-relaxed border-l border-accent pl-4 text-white/70">
             <DecipherText text="SYSTEM_OVERRIDE_ENABLED." delay={0.5} /> <br />
             <DecipherText text="CODING_COOL_THINGS." delay={1.5} /> <br />
             <DecipherText text="PRESS_CMD+K_FOR_NAV." delay={2.5} />
           </p>
        </div>
      </section>

      {/* Terminal Command Marquee — blurred at edges, sharp at center */}
      <div id="marquee" className="w-full border-y border-accent/20 py-3 overflow-hidden">
        {sudoMode && (
          <div className="absolute left-1/2 -translate-x-1/2 -mt-4 text-[9px] text-red-500 font-mono z-20">
            {"// TODO: Refactor this marquee if I get the job. It's a bit of an interval hog."}
          </div>
        )}
        <div ref={marqueeRef} className="marquee-track text-[10px] md:text-xs uppercase tracking-widest text-accent/60 font-mono">
          {[0, 1].map((rep) => (
            <span key={rep} className="flex">
              {MARQUEE_COMMANDS.map((cmd, ci) => (
                <span key={`${rep}-${ci}`} className="marquee-cmd whitespace-nowrap mx-6 transition-all duration-100">
                  <span className="text-accent/30">$</span> {cmd}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ASCII Logo */}
      <AsciiLogo />

      {/* Horizontal Work Gallery */}
      <div id="work">
        <WorkGallery />
      </div>

      {/* Footer */}
      <footer id="footer" className="bg-accent text-background px-6 md:px-20 py-12 md:py-16 relative z-20">
        {sudoMode && (
          <div className="absolute top-4 right-20 text-[10px] text-red-900 font-mono opacity-40">
            {'// <urgent> fix the lead generation form </urgent>'}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <p className="text-[10px] md:text-xs uppercase tracking-widest mb-3 opacity-60">{'>'} ./build_something.sh</p>
            <h2 className="text-3xl md:text-[5vw] font-black uppercase leading-[0.85] mb-6">
              {"Let's Build"}<br />Something Weird.
            </h2>
            <a href="mailto:contact@maarif.digital" className="text-base md:text-xl underline hover:bg-background hover:text-accent transition-colors p-1.5 inline-block">
               {'>'} INIT_CONNECTION();
            </a>
          </div>
          <div className="md:col-span-4 flex flex-col gap-2 text-xs uppercase tracking-widest justify-end font-bold">
            <a href="#" className="hover:bg-background hover:text-accent w-fit px-2 transition-colors">[ GITHUB ]</a>
            <a href="#" className="hover:bg-background hover:text-accent w-fit px-2 transition-colors">[ SOURCE_CODE ]</a>
            <a href="#" className="hover:bg-background hover:text-accent w-fit px-2 transition-colors">[ LINKEDIN ]</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-end border-t border-background/20 pt-4 uppercase text-[9px] md:text-[10px] tracking-widest font-bold mt-8 gap-3 mb-2">
          <span>© {new Date().getFullYear()} Maarif</span>
          <span>FUELED_MOSTLY_BY_CAFFEINE</span>
        </div>
      </footer>
    </main>
  );
}
