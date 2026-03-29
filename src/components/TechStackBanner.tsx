'use client';

export default function TechStackBanner() {
  const stack = [
    "NEXT.JS", "TYPESCRIPT", "GSAP", "TAILWIND", "REACT THREE FIBER", "NODE.JS", "WEBGL", "POSTGRESQL"
  ];

  return (
    <div className="relative flex items-center overflow-hidden border-y border-[#E0E0E0]/28 bg-black py-2.5 shadow-[0_0_15px_rgba(224,224,224,0.05)]">
      {/* We render two identical tracks side-by-side to create the infinite loop.
        Using standard CSS animation for performance.
      */}
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center">
            {stack.map((tech, index) => (
              <span
                key={`${i}-${index}`}
                className="mx-6 font-mono text-xs font-bold tracking-[0.2em] text-[#E0E0E0] md:text-sm"
                style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.94)' }}
              >
                {tech} <span className="ml-6 text-[#E0E0E0]/30">{'//'}</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
