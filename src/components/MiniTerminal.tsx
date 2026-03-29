'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { getMiniTerminalCommand, MINI_TERMINAL_COMMANDS } from '@/lib/terminalCommands';
import { useAudio } from '@/context/AudioContext';
import { useChamber, type ChamberMode } from '@/context/ChamberContext';
import type { BuildNote } from '@/lib/buildNoteTypes';

type HistoryEntryType = 'input' | 'output' | 'error' | 'system';

interface HistoryEntry {
  id: number;
  type: HistoryEntryType;
  text: string;
}

type TerminalView = 'shell' | 'logs';

type ActivityTone = 'system' | 'command' | 'route' | 'error' | 'ledger';
type ActivityFilter = 'all' | ActivityTone;

interface ScrollTelemetry {
  hasOverflow: boolean;
  progress: number;
  thumbHeight: number;
  thumbTop: number;
}

interface ActivityEntry {
  id: number;
  stamp: string;
  tone: ActivityTone;
  message: string;
}

const ACTIVITY_FILTERS: Array<{ value: ActivityFilter; label: string }> = [
  { value: 'all', label: 'all' },
  { value: 'system', label: 'system' },
  { value: 'ledger', label: 'ledger' },
  { value: 'command', label: 'commands' },
  { value: 'route', label: 'routes' },
  { value: 'error', label: 'errors' },
];

const PROMPT = 'root@maarif:~$';

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function stampNow() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

interface MiniTerminalProps {
  variant?: 'section' | 'floating';
  className?: string;
  buildNotes?: BuildNote[];
}

function buildLedgerActivity(buildNotes: BuildNote[]) {
  return buildNotes.map((ledgerEntry, ledgerIndex) => ({
    id: ledgerIndex + 2,
    stamp: ledgerEntry.date,
    tone: 'ledger' as const,
    message: `BUILD_LEDGER // ${ledgerEntry.shortHash} // ${ledgerEntry.headline}`,
  }));
}

export default function MiniTerminal({ variant = 'section', className = '', buildNotes = [] }: MiniTerminalProps) {
  const isFloating = variant === 'floating';
  const router = useRouter();
  const { chamberMode, setChamberMode, toggleAlternateChamber } = useChamber();
  const initialLedgerLog = useMemo(() => buildLedgerActivity(buildNotes), [buildNotes]);
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 0, type: 'system', text: 'Interactive shell ready.' },
    { id: 1, type: 'system', text: 'Type `help` to inspect available commands.' },
  ]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([
    { id: 0, stamp: '00:00:00', tone: 'system', message: 'SHELL_READY // interactive session mounted' },
    { id: 1, stamp: '00:00:00', tone: 'system', message: 'LOG_STREAM // activity recorder online' },
    ...initialLedgerLog,
  ]);
  const [activeView, setActiveView] = useState<TerminalView>('shell');
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [input, setInput] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isViewportHovered, setIsViewportHovered] = useState(false);
  const [scrollTelemetry, setScrollTelemetry] = useState<ScrollTelemetry>({
    hasOverflow: false,
    progress: 0,
    thumbHeight: 0,
    thumbTop: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLElement>(null);
  const nextIdRef = useRef(2);
  const nextActivityIdRef = useRef(2 + initialLedgerLog.length);
  const { playTypingTick, playGlitchBurst, unlockAudio } = useAudio();

  const focusTerminalInput = (preserveViewport = false) => {
    if (!inputRef.current) return;
    inputRef.current.focus(preserveViewport ? { preventScroll: true } : undefined);
  };

  const helpText = useMemo(
    () =>
      MINI_TERMINAL_COMMANDS
        .filter((command) => !command.hidden)
        .map((command) => `${command.command.padEnd(14, ' ')} ${command.description}`),
    []
  );
  const visibleQuickCommands = useMemo(
    () => MINI_TERMINAL_COMMANDS.filter((command) => !command.hidden),
    []
  );
  const filteredActivity = useMemo(
    () =>
      activeFilter === 'all'
        ? activityLog
        : activityLog.filter((activityEntry) => activityEntry.tone === activeFilter),
    [activeFilter, activityLog]
  );

  useEffect(() => {
    focusTerminalInput(true);
  }, []);

  useEffect(() => {
    const chromeNode = chromeRef.current;
    if (!isFloating || !chromeNode || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const glideX = gsap.quickTo(chromeNode, 'x', { duration: 0.35, ease: 'power3.out' });
    const glideY = gsap.quickTo(chromeNode, 'y', { duration: 0.35, ease: 'power3.out' });
    const tiltX = gsap.quickTo(chromeNode, 'rotationX', { duration: 0.35, ease: 'power3.out' });
    const tiltY = gsap.quickTo(chromeNode, 'rotationY', { duration: 0.35, ease: 'power3.out' });

    const moveChrome = (event: MouseEvent) => {
      const bounds = chromeNode.getBoundingClientRect();
      const relativeX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const relativeY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;

      glideX(relativeX * 10);
      glideY(relativeY * 8);
      tiltY(relativeX * 1.6);
      tiltX(relativeY * -1.2);
    };

    const resetChrome = () => {
      glideX(0);
      glideY(0);
      tiltX(0);
      tiltY(0);
    };

    chromeNode.addEventListener('mousemove', moveChrome);
    chromeNode.addEventListener('mouseleave', resetChrome);

    return () => {
      chromeNode.removeEventListener('mousemove', moveChrome);
      chromeNode.removeEventListener('mouseleave', resetChrome);
      gsap.set(chromeNode, { clearProps: 'x,y,rotationX,rotationY' });
    };
  }, [isFloating]);

  useEffect(() => {
    const viewportNode = viewportRef.current;
    if (!viewportNode) {
      return;
    }

    window.requestAnimationFrame(() => {
      viewportNode.scrollTo({
        top: viewportNode.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [activeFilter, activeView, activityLog, history]);

  useEffect(() => {
    const viewportNode = viewportRef.current;
    if (!viewportNode) {
      return undefined;
    }

    const syncScrollTelemetry = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewportNode;
      const overflowRange = scrollHeight - clientHeight;
      const hasOverflow = overflowRange > 8;
      const progress = hasOverflow ? scrollTop / overflowRange : 0;
      const thumbHeight = hasOverflow
        ? Math.max((clientHeight / scrollHeight) * clientHeight, 28)
        : 0;
      const thumbTravel = Math.max(clientHeight - thumbHeight, 0);

      setScrollTelemetry({
        hasOverflow,
        progress,
        thumbHeight,
        thumbTop: thumbTravel * progress,
      });
    };

    syncScrollTelemetry();
    viewportNode.addEventListener('scroll', syncScrollTelemetry, { passive: true });
    window.addEventListener('resize', syncScrollTelemetry);

    return () => {
      viewportNode.removeEventListener('scroll', syncScrollTelemetry);
      window.removeEventListener('resize', syncScrollTelemetry);
    };
  }, [activeFilter, activeView, filteredActivity.length, history.length]);

  const appendEntry = (type: HistoryEntryType, text: string) => {
    const id = nextIdRef.current++;
    setHistory((prev) => [...prev, { id, type, text }]);
    return id;
  };

  const pushActivity = (tone: ActivityTone, message: string) => {
    const id = nextActivityIdRef.current++;
    setActivityLog((prev) => [
      ...prev.slice(-119),
      {
        id,
        stamp: stampNow(),
        tone,
        message,
      },
    ]);
  };

  const updateEntry = (id: number, text: string) => {
    setHistory((prev) => prev.map((entry) => (entry.id === id ? { ...entry, text } : entry)));
  };

  const printLine = async (line: string, type: HistoryEntryType = 'output') => {
    const id = appendEntry(type, '');

    for (let index = 1; index <= line.length; index += 1) {
      updateEntry(id, line.slice(0, index));
      if (line[index - 1] !== ' ') {
        playTypingTick();
      }
      await wait(14);
    }
  };

  const printLines = async (lines: string[], type: HistoryEntryType = 'output') => {
    for (const line of lines) {
      await printLine(line, type);
      await wait(55);
    }
  };

  const performTargetedAction = (definition: NonNullable<ReturnType<typeof getMiniTerminalCommand>>) => {
    if (!definition.target) {
      return;
    }

    if (definition.action === 'route') {
      pushActivity('route', `ROUTE_DISPATCH // ${definition.target}`);
      router.push(definition.target);
      return;
    }

    if (definition.action === 'section') {
      pushActivity('route', `VIEWPORT_REROUTE // #${definition.target}`);
      document.getElementById(definition.target)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }

    if (definition.action === 'mailto') {
      pushActivity('route', `MAILTO_OPEN // ${definition.target.replace('mailto:', '')}`);
      window.location.href = definition.target;
    }
  };

  const shiftChamber = async (targetMode: ChamberMode) => {
    const nextMode =
      targetMode === 'alternate'
        ? toggleAlternateChamber()
        : (setChamberMode('primary'), 'primary' as const);

    window.dispatchEvent(
      new CustomEvent('hero-chamber-shift', {
        detail: { mode: nextMode },
      })
    );

    pushActivity('system', `CHAMBER_SHIFT // ${nextMode.toUpperCase()}`);

    const chamberLines =
      nextMode === 'alternate'
        ? [
            'Chamber branch acknowledged.',
            'Secondary halo geometry waking under the skull.',
            'Signal pressure rerouted to the alternate frame.',
          ]
        : [
            'Chamber branch sealed.',
            'Returning the hero to the primary chamber.',
            'Ambient stress lowered to the baseline state.',
          ];

    setIsPrinting(true);
    await printLines(chamberLines, 'system');
    setIsPrinting(false);
  };

  const runDestructSequence = async () => {
    setIsReloading(true);
    playGlitchBurst();

    const shell = document.getElementById('site-shell');
    const targets = shell
      ? Array.from(shell.querySelectorAll('section, footer, nav, article, pre, aside, canvas'))
      : [];

    const timeline = gsap.timeline({
      onComplete: () => window.location.reload(),
    });

    if (overlayRef.current) {
      timeline
        .set(overlayRef.current, { opacity: 0, display: 'block' })
        .to(overlayRef.current, { opacity: 0.92, duration: 0.08 })
        .to(overlayRef.current, { opacity: 0.2, duration: 0.08, repeat: 4, yoyo: true }, '>-0.02');
    }

    if (shell) {
      timeline.to(
        shell,
        {
          filter: 'contrast(180%) brightness(150%) hue-rotate(18deg)',
          x: 6,
          y: -4,
          duration: 0.06,
          repeat: 7,
          yoyo: true,
        },
        0
      );
    }

    if (targets.length > 0) {
      timeline.to(
        targets,
        {
          y: () => gsap.utils.random(140, 360),
          x: () => gsap.utils.random(-180, 180),
          rotate: () => gsap.utils.random(-22, 22),
          opacity: 0,
          duration: 0.55,
          stagger: 0.02,
          ease: 'power4.in',
        },
        0.18
      );
    }

    if (overlayRef.current) {
      timeline.to(
        overlayRef.current,
        {
          opacity: 1,
          duration: 0.18,
        },
        '>-0.2'
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const commandText = input.trim();
    if (!commandText || isPrinting || isReloading || activeView === 'logs') return;

    await unlockAudio();
    appendEntry('input', `${PROMPT} ${commandText}`);
    pushActivity('command', `COMMAND_EXEC // ${commandText}`);
    setInput('');

    const definition = getMiniTerminalCommand(commandText);

    if (!definition) {
      setIsPrinting(true);
      pushActivity('error', `COMMAND_FAIL // ${commandText}`);
      await printLines([`-bash: ${commandText}: command not found`], 'error');
      setIsPrinting(false);
      return;
    }

    if (definition.action === 'clear') {
      pushActivity('system', 'BUFFER_CLEAR // shell history wiped');
      setHistory([]);
      return;
    }

    if (definition.action === 'destruct') {
      setIsPrinting(true);
      pushActivity('error', 'FILESYSTEM_CORRUPTION // destructive branch armed');
      await printLines(definition.output ?? [], 'error');
      await runDestructSequence();
      return;
    }

    if (definition.action === 'chamber') {
      await shiftChamber(definition.target === 'alternate' ? 'alternate' : 'primary');
      return;
    }

    setIsPrinting(true);

    if (definition.command === 'help') {
      await printLines(helpText);
    } else {
      await printLines(definition.output ?? []);
    }

    setIsPrinting(false);

    if (definition.action === 'route' || definition.action === 'section' || definition.action === 'mailto') {
      await wait(120);
      performTargetedAction(definition);
    }
  };

  return (
    <section
      id="shell"
      className={`${isFloating
        ? 'home-panel section-lock-shell relative z-20 overflow-visible px-5 pb-4 pt-0 md:px-20'
        : 'home-panel section-lock-shell relative overflow-hidden bg-black px-5 py-20 md:px-20 md:py-36'
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.62),rgba(224,224,224,0.16),transparent)] opacity-0 section-signal-line" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_22%,transparent_100%)] opacity-0 section-signal-field" />
      <div className="pointer-events-none absolute inset-x-[16%] top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(224,224,224,0.05)_35%,rgba(0,240,255,0.18)_55%,rgba(255,255,255,0.0)_100%)] opacity-0 blur-2xl section-signal-beam" />
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[1000004] hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95),rgba(0,240,255,0.35),rgba(0,0,0,0.95))] mix-blend-screen"
      />
      <div className={`mx-auto ${isFloating ? 'max-w-[1500px]' : 'max-w-6xl'}`}>
        <div
          className={`section-lock-copy ${isFloating
            ? 'mb-6 grid gap-6 lg:grid-cols-[0.54fr_0.46fr] lg:items-end'
            : 'mb-8 grid gap-6 lg:mb-10 lg:grid-cols-[0.9fr_0.8fr] lg:items-end lg:gap-12'
          }`}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[#00F0FF]/78 md:text-xs">
              {isFloating ? 'shell window / a live tool inside the current' : 'interactive shell / live commands'}
            </p>
            <h2
              className={`section-lock-heading ${isFloating
                ? 'mt-3 text-[clamp(1.8rem,4.2vw,3.2rem)]'
                : 'mt-5 text-[clamp(2.5rem,5.8vw,5.6rem)]'
              } font-black uppercase leading-[0.84] tracking-[-0.08em] text-white`}
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              {isFloating ? (
                <>
                  SHELL
                  <br />
                  WINDOW<span className="text-[#00F0FF]">.</span>
                </>
              ) : (
                <>
                  TALK TO THE
                  <br />
                  PORTFOLIO<span className="text-[#00F0FF]">.</span>
                </>
              )}
            </h2>
          </div>

          <div className={`${isFloating ? 'space-y-5 lg:pl-10' : 'space-y-6 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0'}`}>
            <p className={`max-w-lg ${isFloating ? 'text-xs leading-6 text-white/58 md:text-sm md:leading-7' : 'text-sm leading-7 text-white/66 md:text-base'}`}>
              {isFloating
                ? 'The terminal drifts in as a usable pause between the manifesto and the process ledger, then hands the reading flow back to the archive.'
                : 'The terminal is back where it belongs. Use it to inspect the stack, jump into casefiles, route to the manual, or try the one command that should obviously stay off-limits.'}
            </p>
            {isFloating ? (
              <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/52">
                <span className="flow-chip">about / contact / work</span>
                <span className="flow-chip">whoami / skills / help</span>
                <span className="flow-chip">logs / clear / sudo</span>
              </div>
            ) : (
              <div className="grid gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/52 md:grid-cols-3">
                <div className="border border-white/10 bg-[#060a0d]/78 p-4">
                  <p className="text-[#00F0FF]">direct</p>
                  <p className="mt-3 leading-6 text-white/72">about / contact / work</p>
                </div>
                <div className="border border-white/10 bg-[#060a0d]/78 p-4">
                  <p className="text-[#00F0FF]">inspect</p>
                  <p className="mt-3 leading-6 text-white/72">whoami / skills / help</p>
                </div>
                <div className="border border-white/10 bg-[#060a0d]/78 p-4">
                  <p className="text-[#00F0FF]">open</p>
                  <p className="mt-3 leading-6 text-white/72">logs / clear / sudo</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <article ref={chromeRef} className={`terminal-window mx-auto w-full overflow-hidden border border-white/14 bg-[#02060a]/92 backdrop-blur-xl ${isFloating
          ? 'max-w-[82rem] lg:ml-auto lg:w-[min(100%,82rem)] shadow-[0_24px_90px_rgba(0,0,0,0.58),0_0_36px_rgba(0,240,255,0.06)]'
          : 'max-w-[76rem] shadow-[0_18px_70px_rgba(0,0,0,0.52),0_0_28px_rgba(0,240,255,0.05)]'
        }`}>
          <div className="terminal-header flex-col items-stretch justify-between gap-3 border-b border-white/8 bg-[linear-gradient(180deg,rgba(224,224,224,0.08)_0%,rgba(255,255,255,0.03)_100%)] px-4 py-2.5 backdrop-blur-xl md:flex-row md:items-center md:px-5">
            <div className="min-w-0 overflow-x-auto pb-1 md:overflow-visible md:pb-0">
              <div className="flex min-w-max items-end gap-1">
                <button
                  type="button"
                  className={`flex h-8 min-w-[8.5rem] items-center gap-3 border px-3 text-[10px] uppercase tracking-[0.18em] transition-colors md:min-w-[10rem] ${
                    activeView === 'shell'
                      ? 'border-white/12 border-b-transparent bg-[#0b1015]/96 text-[#E0E0E0]/82'
                      : 'border-white/8 bg-black/34 text-[#E0E0E0]/42 hover:border-white/14 hover:text-[#E0E0E0]/72'
                  }`}
                  onClick={() => {
                    setActiveView('shell');
                    focusTerminalInput();
                  }}
                  aria-pressed={activeView === 'shell'}
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center border border-[#00F0FF]/38 bg-[#071218] text-[8px] text-[#00F0FF]">
                    &gt;_
                  </span>
                  root
                </button>
                <button
                  type="button"
                  className={`flex h-7 min-w-[7.5rem] items-center gap-2 border px-3 text-[10px] uppercase tracking-[0.18em] transition-colors md:min-w-[8.5rem] ${
                    activeView === 'logs'
                      ? 'border-white/12 border-b-transparent bg-[#0b1015]/96 text-[#E0E0E0]/82'
                      : 'border-white/8 bg-black/34 text-[#E0E0E0]/42 hover:border-white/14 hover:text-[#E0E0E0]/72'
                  }`}
                  onClick={() => setActiveView('logs')}
                  aria-pressed={activeView === 'logs'}
                >
                  <span className="h-2 w-2 border border-white/16" />
                  logs ({activityLog.length})
                </button>
                <button
                  type="button"
                  className="flex h-7 w-8 items-center justify-center border border-white/8 bg-black/34 text-xs text-[#E0E0E0]/46 transition-colors hover:border-white/16 hover:text-[#00F0FF]"
                  onClick={() => {
                    setActiveView('shell');
                    focusTerminalInput();
                  }}
                  aria-label="Focus terminal"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <span className="hidden text-[10px] uppercase tracking-[0.22em] text-[#E0E0E0]/62 md:block">
                Windows Terminal / root@maarif / chamber:{' '}
                <span className={chamberMode === 'alternate' ? 'text-[#00F0FF]' : 'text-[#E0E0E0]/62'}>
                  {chamberMode}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <span className="flex h-6 w-8 items-center justify-center border border-white/8 bg-black/26">
                  <span className="h-px w-3 bg-white/50" />
                </span>
                <span className="flex h-6 w-8 items-center justify-center border border-white/8 bg-black/26">
                  <span className="h-2.5 w-2.5 border border-white/50" />
                </span>
                <span className="flex h-6 w-8 items-center justify-center border border-[#ff6b9d]/24 bg-[#240910]">
                  <span className="relative h-3 w-3">
                    <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 rotate-45 bg-[#ff6b9d]" />
                    <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 -rotate-45 bg-[#ff6b9d]" />
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8">
            <div
              className="group/viewport relative"
              onMouseEnter={() => setIsViewportHovered(true)}
              onMouseLeave={() => setIsViewportHovered(false)}
            >
              <div
                ref={viewportRef}
                data-lenis-prevent-wheel
                tabIndex={0}
                className="h-[13rem] overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_18%,transparent_100%)] px-4 py-3 outline-none md:h-[15rem] md:px-5 md:py-4 lg:h-[15.5rem]"
              >
                {activeView === 'shell' ? (
                  <div className="space-y-2 font-mono text-[10px] leading-relaxed md:text-[13px]">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className={
                          entry.type === 'input'
                            ? 'text-white'
                            : entry.type === 'error'
                              ? 'text-[#ff6b9d]'
                              : entry.type === 'system'
                                ? 'text-[#E0E0E0]/60'
                                : 'text-foreground/85'
                        }
                      >
                        {entry.text || '\u00A0'}
                      </div>
                    ))}
                    {isPrinting && <div className="animate-pulse text-[#E0E0E0]">_</div>}
                  </div>
                ) : (
                  <div className="space-y-2.5 text-[10px] md:text-[12px]">
                    <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-white/8 bg-[#02060a]/94 px-4 pb-3 pt-1 backdrop-blur-xl md:-mx-5 md:px-5">
                      <div className="flex flex-wrap gap-2">
                        {ACTIVITY_FILTERS.map((activityFilter) => (
                          <button
                            key={activityFilter.value}
                            type="button"
                            className={`border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] transition-colors md:text-[10px] ${
                              activeFilter === activityFilter.value
                                ? 'border-[#00F0FF]/36 bg-[#071018] text-[#00F0FF]'
                                : 'border-white/10 bg-black/45 text-[#E0E0E0]/56 hover:border-white/18 hover:text-[#E0E0E0]/82'
                            }`}
                            onClick={() => setActiveFilter(activityFilter.value)}
                            aria-pressed={activeFilter === activityFilter.value}
                          >
                            {activityFilter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredActivity.map((activityEntry) => (
                      <div key={activityEntry.id} className="grid grid-cols-[auto_auto_1fr] items-start gap-3">
                        <span className="text-[#E0E0E0]/34">{activityEntry.stamp}</span>
                        <span
                          className={
                            activityEntry.tone === 'error'
                              ? 'text-[#ff6b9d]'
                              : activityEntry.tone === 'route'
                                ? 'text-[#00F0FF]'
                                : activityEntry.tone === 'ledger'
                                  ? 'text-white/58'
                                : activityEntry.tone === 'command'
                                  ? 'text-[#E0E0E0]/78'
                                : 'text-[#39FF14]'
                          }
                        >
                          [{activityEntry.tone.toUpperCase()}]
                        </span>
                        <span className="break-words text-[#E0E0E0]/76">{activityEntry.message}</span>
                      </div>
                    ))}

                    {filteredActivity.length === 0 && (
                      <div className="border border-dashed border-white/10 bg-black/38 px-3 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#E0E0E0]/42 md:text-[11px]">
                        no events match the current filter
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className={`pointer-events-none absolute right-2 top-3 z-10 flex items-start gap-2 transition-opacity duration-300 md:right-3 ${
                  isViewportHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="rounded-sm border border-white/10 bg-black/72 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.26em] text-[#00F0FF]/74">
                  scroll
                </div>
                <div className="relative h-[calc(100%-0.5rem)] min-h-[6rem] w-1.5 rounded-full bg-white/6">
                  <div
                    className={`absolute left-0.5 right-0.5 rounded-full bg-[#00F0FF]/70 transition-opacity duration-300 ${
                      scrollTelemetry.hasOverflow ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      height: `${scrollTelemetry.thumbHeight}px`,
                      transform: `translateY(${scrollTelemetry.thumbTop}px)`,
                    }}
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-accent/20 px-4 py-2.5 md:px-5 md:py-3">
              <label className="flex items-center gap-3 font-mono text-[10px] md:text-[13px]">
                <span className="text-[#E0E0E0]">{PROMPT}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={() => {
                    if (!isPrinting && !isReloading) {
                      playTypingTick();
                    }
                  }}
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-[#E0E0E0]/25"
                  placeholder={
                    isReloading
                      ? 'filesystem corruption detected...'
                      : activeView === 'logs'
                        ? 'log stream is read-only; switch back to shell'
                        : 'type a command'
                  }
                  disabled={isPrinting || isReloading || activeView === 'logs'}
                  spellCheck={false}
                />
              </label>
            </form>

            <div className="border-t border-white/8 bg-[#060b10]/94 px-4 py-3 md:px-5">
              <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.28em] text-[#E0E0E0]/48 md:text-[10px]">
                <span>quick commands</span>
                <span>tab + enter ready</span>
              </div>
              <div className="overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2">
                {visibleQuickCommands.map((command) => (
                  <button
                    key={command.command}
                    type="button"
                    className="border border-white/10 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#E0E0E0]/78 transition-colors hover:border-[#00F0FF]/35 hover:text-[#00F0FF] md:text-[11px]"
                    onClick={() => {
                      setActiveView('shell');
                      setInput(command.command);
                      focusTerminalInput();
                    }}
                  >
                    {command.command}
                  </button>
                ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.0)_100%)] px-4 py-2 md:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/42 md:text-[10px]">
                <div className="flex flex-wrap items-center gap-3 md:gap-5">
                  <span>utf-8</span>
                  <span>lf</span>
                  <span>shell ready</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-5">
                  <span>lines {activeView === 'shell' ? history.length : filteredActivity.length}</span>
                  <span>scroll {Math.round(scrollTelemetry.progress * 100)}%</span>
                  <span>{isPrinting ? 'typing' : isReloading ? 'corrupting' : 'idle'}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
