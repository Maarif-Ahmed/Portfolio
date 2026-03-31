'use client';

export default function HeroTerrainFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#d7dde2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.92),rgba(223,228,233,0.82)_32%,rgba(194,201,208,0.7)_58%,rgba(169,178,188,0.62)_100%)]" />
      <div className="absolute inset-x-0 bottom-[-10%] h-[72%] rounded-[100%] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.98),rgba(243,246,248,0.94)_22%,rgba(224,229,234,0.9)_48%,rgba(208,215,221,0.7)_100%)] blur-[2px]" />
      <div className="absolute left-1/2 top-[56%] h-[10rem] w-[3.4rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.4rem] bg-[linear-gradient(180deg,#3c4750_0%,#0e1217_100%)] shadow-[0_28px_90px_rgba(14,18,23,0.22)]" />
      <div className="absolute left-1/2 top-[58%] h-[2.1rem] w-[6rem] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle_at_50%_50%,rgba(58,66,74,0.32),rgba(58,66,74,0)_74%)] blur-xl" />
    </div>
  );
}
