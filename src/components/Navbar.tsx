'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAudio } from '@/context/AudioContext';
import { useSudo } from '@/context/SudoContext';
import { getVisibleProjects } from '@/lib/projects';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [workExpanded, setWorkExpanded] = useState(true);
  const pathname = usePathname();
  const { playBlip } = useAudio();
  const { sudoMode } = useSudo();

  const visibleProjects = useMemo(() => getVisibleProjects(sudoMode), [sudoMode]);

  return (
    <nav className="fixed top-0 z-[99990] flex w-full items-center justify-between px-6 py-5 text-white mix-blend-difference md:px-20">
      <Link
        href="/"
        onMouseEnter={playBlip}
        className="cursor-pointer font-bold text-lg uppercase tracking-tighter glitch-link md:text-xl"
        data-text="[ SYS_ROOT ]"
      >
        [ SYS_ROOT ]
      </Link>

      <button
        onClick={() => {
          setIsOpen((current) => !current);
          playBlip();
        }}
        onMouseEnter={playBlip}
        className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[#E0E0E0] transition-colors hover:text-[#00F0FF] md:text-xs"
      >
        [ {isOpen ? 'CLOSE' : 'MENU'} ]
      </button>

      <div
        className={`fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed right-0 top-0 z-[101] flex h-screen w-full max-w-md flex-col border-l border-[#E0E0E0]/25 bg-black/96 shadow-[-20px_0_60px_rgba(224,224,224,0.12)] transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[#E0E0E0]/15 px-5 py-4 md:px-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]">directory_tree</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.28em] text-[#E0E0E0]/45">interactive navigation</p>
          </div>
          {sudoMode && <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF00FF]">sudo unlocked</span>}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-6">
          <div className="font-mono text-xs leading-7 md:text-sm">
            <div className="flex items-center gap-2 text-[#E0E0E0]">
              <span className="text-[#39FF14]">v</span>
              <span>root/</span>
            </div>

            <TreeLink href="/" label="home.tsx" prefix="+--" isActive={pathname === '/'} onClick={() => setIsOpen(false)} onHover={playBlip} />
            <TreeLink href="/about" label="about_me.md" prefix="+--" isActive={pathname === '/about'} onClick={() => setIsOpen(false)} onHover={playBlip} />
            <TreeLink href="/contact" label="contact.sh" prefix="+--" isActive={pathname === '/contact'} onClick={() => setIsOpen(false)} onHover={playBlip} />

            <div className="mt-1 pl-0">
              <button
                onClick={() => {
                  setWorkExpanded((current) => !current);
                  playBlip();
                }}
                onMouseEnter={playBlip}
                className="flex items-center gap-2 text-left text-[#E0E0E0]/72 transition-colors hover:text-[#00F0FF]"
              >
                <span className="text-[#E0E0E0]/45">+--</span>
                <span className="text-[#39FF14]">{workExpanded ? 'v' : '>'}</span>
                <span>work/</span>
              </button>

              {workExpanded && (
                <div className="mt-1 space-y-1 pl-9">
                  {visibleProjects.map((project) => (
                    <TreeLink
                      key={project.id}
                      href={`/work/${project.id}`}
                      label={project.fileName}
                      prefix="+--"
                      isActive={pathname === `/work/${project.id}`}
                      onClick={() => setIsOpen(false)}
                      onHover={playBlip}
                      secret={Boolean(project.isSecret)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </nav>
  );
}

function TreeLink({
  href,
  label,
  prefix,
  isActive,
  onClick,
  onHover,
  secret = false,
}: {
  href: string;
  label: string;
  prefix: string;
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
  secret?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={onHover}
      className={`flex items-center gap-2 pl-5 transition-colors ${isActive ? 'text-[#E0E0E0]' : secret ? 'text-[#FF00FF]/78 hover:text-[#FF00FF]' : 'text-[#E0E0E0]/72 hover:text-[#00F0FF]'}`}
    >
      <span className="text-[#E0E0E0]/45">{prefix}</span>
      <span>{label}</span>
    </Link>
  );
}
