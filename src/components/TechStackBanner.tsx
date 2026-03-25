import React from 'react';

const techs = ["NEXT.JS", "TYPESCRIPT", "GSAP", "TAILWIND", "REACT THREE FIBER", "NODE.JS"];
// Duplicate items to ensure smooth infinite marquee looping
const marqueeItems = [...techs, ...techs, ...techs, ...techs];

export default function TechStackBanner() {
  return (
    <div className="w-full bg-black border-y border-accent flex overflow-hidden py-3 relative z-30">
      <div className="flex animate-marquee-fast whitespace-nowrap items-center">
        {marqueeItems.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center">
            <span 
              className="text-accent font-mono uppercase tracking-[0.2em] text-xs md:text-sm"
              style={{ textShadow: '0 0 8px rgba(0, 240, 255, 0.6)' }}
            >
              {item}
            </span>
            <span className="text-accent/40 font-mono mx-6 text-xs">//</span>
          </div>
        ))}
      </div>
    </div>
  );
}
