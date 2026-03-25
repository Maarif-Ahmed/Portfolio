'use client';

import { useSudo } from "@/context/SudoContext";
import { useAudio } from "@/context/AudioContext";

export default function FooterBar() {
  const { sudoMode, toggleSudoMode } = useSudo();
  const { isMuted, toggleMute } = useAudio();
  
  return (
    <div className="fixed bottom-0 left-0 w-full h-10 border-t border-accent bg-background z-[99998] flex items-center justify-between px-6 text-[9px] md:text-xs shadow-[0_0_15px_rgba(224,224,224,0.1)]">
        <div className="flex gap-2 md:gap-6 shrink-0">
          <span className="hidden sm:inline opacity-40">[ CPU: OK ]</span>
          <span className="hidden lg:inline opacity-40">[ MEM: OPTIMAL ]</span>
          <button 
            onClick={toggleSudoMode}
            className={`cursor-pointer transition-colors whitespace-nowrap ${sudoMode ? 'text-red-500 font-bold' : 'text-accent/60'}`}
          >
            [ {sudoMode ? 'SUDO_ON' : 'SUDO_OFF'} ]
          </button>
        </div>
        <div className="flex gap-2 md:gap-6 shrink-0 text-right">
          <button 
            onClick={toggleMute}
            className="cursor-pointer text-accent/60 hover:text-accent transition-colors whitespace-nowrap"
          >
            [ {isMuted ? 'MUTE' : 'AUDIO'} ]
          </button>
          <span className="animate-pulse whitespace-nowrap hidden sm:inline">[ HIRED ]</span>
          <span className="hidden lg:inline">[ SYS: OK ]</span>
        </div>
    </div>
  );
}
