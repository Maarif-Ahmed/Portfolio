'use client';

import { useSudo } from '@/context/SudoContext';
import { useAudio } from '@/context/AudioContext';

export default function FooterBar() {
  const { sudoMode, toggleSudoMode } = useSudo();
  const { isMuted, toggleMute, playBlip } = useAudio();

  return (
    <div className="fixed bottom-0 left-0 z-[99998] flex h-10 w-full items-center justify-between border-t border-[#E0E0E0]/22 bg-black/92 px-6 text-[9px] shadow-[0_0_18px_rgba(224,224,224,0.06)] md:text-xs">
      <div className="flex shrink-0 gap-2 md:gap-6">
        <span className="hidden text-[#39FF14]/72 sm:inline">[ CPU: OK ]</span>
        <span className="hidden text-[#E0E0E0]/42 lg:inline">[ MEM: STABLE ]</span>
        <button
          onClick={() => {
            playBlip();
            toggleSudoMode();
          }}
          onMouseEnter={playBlip}
          className={`cursor-pointer whitespace-nowrap transition-colors ${sudoMode ? 'font-bold text-[#FF00FF]' : 'text-[#E0E0E0]/68 hover:text-[#00F0FF]'}`}
        >
          [ {sudoMode ? 'SUDO_ON' : 'SUDO_OFF'} ]
        </button>
      </div>
      <div className="flex shrink-0 gap-2 text-right md:gap-6">
        <button
          onClick={() => {
            playBlip();
            toggleMute();
          }}
          onMouseEnter={playBlip}
          className="cursor-pointer whitespace-nowrap text-[#E0E0E0]/68 transition-colors hover:text-[#00F0FF]"
        >
          [ {isMuted ? 'MUTE' : 'AUDIO'} ]
        </button>
        <span className="hidden animate-pulse whitespace-nowrap text-[#39FF14] sm:inline">[ HIRED ]</span>
        <span className="hidden text-[#E0E0E0]/42 lg:inline">[ SYS: LIVE ]</span>
      </div>
    </div>
  );
}
