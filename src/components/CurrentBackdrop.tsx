interface CurrentBackdropProps {
  variant?: 'home' | 'page';
}

export default function CurrentBackdrop({ variant = 'page' }: CurrentBackdropProps) {
  const isHome = variant === 'home';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className={`absolute inset-0 ${
          isHome
            ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.08),transparent_26%),radial-gradient(circle_at_15%_28%,rgba(224,224,224,0.04),transparent_20%),radial-gradient(circle_at_82%_58%,rgba(0,240,255,0.05),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_18%,rgba(0,240,255,0.02)_62%,rgba(0,0,0,0)_100%)]'
            : 'bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.05),transparent_24%),radial-gradient(circle_at_12%_24%,rgba(224,224,224,0.03),transparent_18%),radial-gradient(circle_at_82%_62%,rgba(0,240,255,0.04),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0)_22%,rgba(0,240,255,0.015)_64%,rgba(0,0,0,0)_100%)]'
        }`}
      />

      <div className={`homepage-current absolute left-1/2 top-0 h-full -translate-x-1/2 ${isHome ? 'w-[min(96vw,1200px)] opacity-90' : 'w-[min(92vw,1120px)] opacity-70'}`}>
        <svg className="h-full w-full" viewBox="0 0 1200 5600" preserveAspectRatio="none">
          <defs>
            <linearGradient id={isHome ? 'riverGlowHome' : 'riverGlowPage'} x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(224,224,224,0.16)" />
              <stop offset="22%" stopColor="rgba(0,240,255,0.18)" />
              <stop offset="55%" stopColor="rgba(224,224,224,0.08)" />
              <stop offset="78%" stopColor="rgba(0,240,255,0.16)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
            <linearGradient id={isHome ? 'riverCoreHome' : 'riverCorePage'} x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#E0E0E0" stopOpacity="0.34" />
              <stop offset="24%" stopColor="#00F0FF" stopOpacity="0.42" />
              <stop offset="56%" stopColor="#E0E0E0" stopOpacity="0.12" />
              <stop offset="82%" stopColor="#00F0FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E0E0E0" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path
            d="M730 -120 C 960 180, 420 520, 640 980 S 990 1680, 770 2220 S 360 3000, 680 3600 S 970 4420, 760 5720"
            fill="none"
            stroke={`url(#${isHome ? 'riverGlowHome' : 'riverGlowPage'})`}
            strokeLinecap="round"
            strokeWidth={isHome ? 140 : 110}
            style={{ filter: `blur(${isHome ? 72 : 58}px)` }}
          />
          <path
            d="M730 -120 C 960 180, 420 520, 640 980 S 990 1680, 770 2220 S 360 3000, 680 3600 S 970 4420, 760 5720"
            fill="none"
            stroke={`url(#${isHome ? 'riverCoreHome' : 'riverCorePage'})`}
            strokeLinecap="round"
            strokeWidth={isHome ? 3 : 2.5}
            opacity={isHome ? 0.55 : 0.42}
          />
          <path
            d="M698 -120 C 900 220, 540 600, 704 1070 S 920 1760, 716 2290 S 520 3040, 724 3630 S 876 4450, 720 5720"
            fill="none"
            stroke="#E0E0E0"
            strokeDasharray="12 18"
            strokeLinecap="round"
            strokeWidth="1.25"
            opacity={isHome ? 0.18 : 0.12}
          />
        </svg>
      </div>

      <div className={`river-pool absolute left-[10%] top-[18%] h-56 w-56 ${isHome ? '' : 'opacity-80'}`} />
      <div className={`river-pool absolute right-[8%] top-[38%] h-72 w-72 ${isHome ? '' : 'opacity-75'}`} />
      <div className={`river-pool absolute left-[14%] top-[58%] h-64 w-64 ${isHome ? '' : 'opacity-70'}`} />
      <div className={`river-pool absolute right-[12%] top-[82%] h-60 w-60 ${isHome ? '' : 'opacity-70'}`} />
    </div>
  );
}
