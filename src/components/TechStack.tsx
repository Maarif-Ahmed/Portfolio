import React from 'react';

const techs = ["NEXT.JS", "TYPESCRIPT", "GSAP", "TAILWIND", "WEBGL", "THREE.JS"];
// Duplicate to create seamless infinite loop twice just to be safe for wide screens
const marqueeItems = [...techs, ...techs, ...techs, ...techs];

export default function TechStack() {
  return (
    <div className="w-full bg-black border-y border-accent flex overflow-hidden py-3 relative z-30">
      <div className="flex animate-marquee-fast whitespace-nowrap items-center">
        {marqueeItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <span 
              className="text-accent font-mono font-bold uppercase tracking-[0.2em] text-sm md:text-base"
              style={{ textShadow: '0 0 8px rgba(0, 240, 255, 0.6)' }}
            >
              {item}
            </span>
            <span className="text-accent/40 font-mono mx-6 text-xs md:text-sm">//</span>
          </div>
        ))}
      </div>
    </div>
  );
}
