'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/context/AudioContext';
import { useMotionPreference } from '@/context/MotionContext';
import { useSudo } from '@/context/SudoContext';
import { useTransitionContext } from '@/context/TransitionContext';
import { getVisibleProjects } from '@/lib/projects';
import ProjectShader, { type ProjectShaderHandle } from './ProjectShader';

gsap.registerPlugin(ScrollTrigger);

const CASEFILE_GEOMETRY = [
  {
    shell: 'md:col-start-1 md:col-span-3 md:row-start-1 md:row-span-3 md:translate-y-10',
    number: 'right-5 top-6 md:right-8 md:top-8',
    trace: 'max-w-xl',
  },
  {
    shell: 'md:col-start-4 md:col-span-3 md:row-start-1 md:row-span-2 md:-translate-y-6 md:ml-8',
    number: 'right-4 top-5 md:right-6 md:top-6',
    trace: 'max-w-md',
  },
  {
    shell: 'md:col-start-5 md:col-span-2 md:row-start-3 md:row-span-3 md:translate-y-12 md:-ml-6',
    number: 'right-3 top-5 md:right-5 md:top-6',
    trace: 'max-w-sm',
  },
  {
    shell: 'md:col-start-1 md:col-span-4 md:row-start-4 md:row-span-3 md:-translate-y-4 md:mr-10',
    number: 'right-4 top-5 md:right-8 md:top-8',
    trace: 'max-w-2xl',
  },
  {
    shell: 'md:col-start-3 md:col-span-3 md:row-start-6 md:row-span-2 md:translate-y-8 md:ml-12',
    number: 'right-4 top-5 md:right-6 md:top-6',
    trace: 'max-w-lg',
  },
] as const;

const SIGNAL_TRACES: Record<string, string[]> = {
  '1': [
    'boot --shell terminal_vibe',
    'attach viewport.telemetry --persist',
    'render chrome with tactile latency budget',
  ],
  '2': [
    'triage queue --signal high',
    'reroute beige dashboard output',
    'promote bug pressure to first-class UI',
  ],
  '3': [
    'capture rollback artifacts',
    'treat debugging as narrative material',
    'leave the tension visible on purpose',
  ],
  '4': [
    'synthesize contribution terrain',
    'light geometry like silent telemetry',
    'keep the sculpture quieter than the hype',
  ],
  '5': [
    'sudo unlock neon_abyss.tmp',
    'allow unstable color behavior',
    'ship the weird branch anyway',
  ],
};

const FLAGSHIP_CAPTURE_BARS = [20, 28, 42, 36, 54, 32, 46] as const;

export default function WorkGallery() {
  const archiveRef = useRef<HTMLElement>(null);
  const warningBeaconRef = useRef<HTMLDivElement>(null);
  const previewPortsRef = useRef<(HTMLDivElement | null)[]>([]);
  const shaderPortsRef = useRef<(ProjectShaderHandle | null)[]>([]);

  const router = useRouter();
  const { playBlip } = useAudio();
  const { motionReduced } = useMotionPreference();
  const { sudoMode } = useSudo();
  const { startFlipTransition, triggerLoader } = useTransitionContext();
  const caseFiles = useMemo(() => getVisibleProjects(sudoMode), [sudoMode]);

  const launchCaseFile = (caseId: string, previewUrl: string, previewPort: HTMLDivElement | null) => {
    playBlip();
    const targetPath = `/work/${caseId}`;

    triggerLoader(targetPath, () => {
      if (previewPort) {
        startFlipTransition(previewPort, previewUrl, '0px');
      }

      router.push(targetPath);
    });
  };

  const armShader = (caseIndex: number, isArmed: boolean) => {
    shaderPortsRef.current[caseIndex]?.setHovered(isArmed);
  };

  useGSAP(() => {
    const archiveShell = archiveRef.current;
    const warningBeacon = warningBeaconRef.current;

    if (!archiveShell || !warningBeacon || motionReduced) {
      return;
    }

    const setWarningOpacity = gsap.quickSetter(warningBeacon, 'opacity');
    const setWarningLift = gsap.quickSetter(warningBeacon, 'yPercent');
    let warningReleaseAt = 0;

    const velocityProbe = ScrollTrigger.create({
      trigger: archiveShell,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (archiveScene) => {
        if (Math.abs(archiveScene.getVelocity()) > 2100) {
          warningReleaseAt = performance.now() + 260;
        }

        const warningVisible = performance.now() < warningReleaseAt ? 1 : 0;
        setWarningOpacity(warningVisible);
        setWarningLift((1 - warningVisible) * 18);
        warningBeacon.classList.toggle('hardware-jitter', warningVisible > 0.5);
      },
    });

    return () => {
      velocityProbe.kill();
      warningBeacon.classList.remove('hardware-jitter');
    };
  }, { dependencies: [caseFiles.length, motionReduced], scope: archiveRef });

  return (
    <section id="work" ref={archiveRef} className="home-panel section-lock-shell relative overflow-visible bg-transparent px-5 py-20 md:px-20 md:py-64">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(224,224,224,0.38),rgba(224,224,224,0.12),transparent)] opacity-0 section-signal-line" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(224,224,224,0.04),transparent_18%),radial-gradient(circle_at_72%_22%,rgba(255,255,255,0.03),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.018)_0%,transparent_24%,transparent_100%)] opacity-0 section-signal-field" />
      <div className="pointer-events-none absolute inset-x-[12%] top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(224,224,224,0.035)_35%,rgba(224,224,224,0.08)_55%,rgba(255,255,255,0.0)_100%)] opacity-0 blur-2xl section-signal-beam" />
      <div className="pointer-events-none absolute left-[10%] top-[16%] h-56 w-56 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[38%] h-44 w-44 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="mx-auto max-w-[1600px]">
        <div className="section-lock-copy relative grid gap-8 lg:grid-cols-[1.06fr_0.82fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/42 md:text-xs">
              casefile archive / evidence wall
            </p>
            <h2 className="section-lock-heading mt-5 max-w-[11ch] font-sans text-[clamp(2.8rem,12vw,5.8rem)] font-black uppercase leading-[0.84] tracking-[-0.09em] text-white md:mt-6 md:text-[clamp(3.3rem,9vw,10rem)]">
              PROOF OVER
              <br />
              THUMBNAILS<span className="text-white/82">.</span>
            </h2>
          </div>

          <div className="space-y-7 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="max-w-2xl text-sm leading-7 text-white/64 md:text-base md:leading-8">
              The archive should feel like evidence already washing into view. One flagship case anchors the room, the others drift around it, and the metadata stays readable enough to follow the thinking behind each build.
            </p>

            <div className="grid gap-4 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/48 md:grid-cols-3">
              <div className="flow-divider pb-4 md:border-b-0 md:border-r md:border-white/10 md:pb-0 md:pr-4">
                <p className="text-white/48">featured</p>
                <p className="mt-3 leading-6 text-white/72">one dominant casefile with supporting evidence</p>
              </div>
              <div className="flow-divider pb-4 md:border-b-0 md:border-r md:border-white/10 md:pb-0 md:px-4">
                <p className="text-white/48">reading flow</p>
                <p className="mt-3 leading-6 text-white/72">metrics, traces, and visual proof stay in frame</p>
              </div>
              <div className="md:pl-4">
                <p className="text-white/48">motion</p>
                <p className="mt-3 leading-6 text-white/72">temperamental enough to feel live, calm enough to read</p>
              </div>
            </div>
          </div>

          <div
            ref={warningBeaconRef}
            className="pointer-events-none absolute right-0 top-0 hidden border border-white/16 bg-black/88 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.35em] text-white/62 opacity-0 md:block"
          >
            [ SIGNAL_WARNING: VELOCITY SPIKE ]
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:mt-20 md:auto-rows-[8rem] md:grid-cols-6 md:gap-x-6 md:gap-y-8 lg:auto-rows-[9rem]">
          {caseFiles.map((caseFile, caseIndex) => {
            const geometry = CASEFILE_GEOMETRY[caseIndex % CASEFILE_GEOMETRY.length];
            const targetPath = `/work/${caseFile.id}`;
            const traceLines = SIGNAL_TRACES[caseFile.id] ?? [];
            const isFlagship = caseIndex === 0;
            const hoverAccentClass = caseFile.isSecret
              ? 'group-hover:text-[#FF00FF] group-focus-visible:text-[#FF00FF]'
              : 'group-hover:text-[#00F0FF] group-focus-visible:text-[#00F0FF]';
            const hoverAccentSoftClass = caseFile.isSecret
              ? 'group-hover:text-[#FF00FF]/78 group-focus-visible:text-[#FF00FF]/78'
              : 'group-hover:text-[#00F0FF]/78 group-focus-visible:text-[#00F0FF]/78';
            const hoverBorderClass = caseFile.isSecret
              ? 'group-hover:border-[#FF00FF]/34 group-focus-visible:border-[#FF00FF]/34'
              : 'group-hover:border-[#00F0FF]/34 group-focus-visible:border-[#00F0FF]/34';
            const hoverSignalClass = caseFile.isSecret
              ? 'group-hover:opacity-100 group-focus-visible:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,0,255,0.12),transparent_34%)]'
              : 'group-hover:opacity-100 group-focus-visible:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.12),transparent_34%)]';

            return (
              <article
                key={caseFile.id}
                className={`relative mx-auto w-full max-w-[34rem] md:mx-0 md:max-w-none ${geometry.shell}`}
              >
                <Link
                  href={targetPath}
                  data-cursor="OPEN_CASEFILE()"
                  className={`group relative block h-full min-h-[22rem] overflow-hidden border border-white/14 bg-black p-4 text-left transition-transform duration-500 hover:-translate-y-1 focus-visible:-translate-y-1 ${hoverBorderClass} sm:min-h-[24rem] sm:p-5 md:min-h-0 lg:p-10`}
                  onClick={(event) => {
                    event.preventDefault();
                    launchCaseFile(caseFile.id, caseFile.img, previewPortsRef.current[caseIndex]);
                  }}
                  onMouseEnter={() => {
                    playBlip();
                    armShader(caseIndex, true);
                  }}
                  onMouseLeave={() => armShader(caseIndex, false)}
                  onFocus={() => {
                    playBlip();
                    armShader(caseIndex, true);
                  }}
                  onBlur={() => armShader(caseIndex, false)}
                >
                  <div
                    ref={(node) => {
                      previewPortsRef.current[caseIndex] = node;
                    }}
                    className="absolute inset-0 opacity-60 grayscale brightness-[0.72] contrast-[0.82] saturate-[0.72] transition-[opacity,filter] duration-500 group-hover:opacity-88 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-[1.16] group-hover:saturate-100 group-focus-visible:opacity-88 group-focus-visible:grayscale-0 group-focus-visible:brightness-100 group-focus-visible:contrast-[1.16] group-focus-visible:saturate-100"
                  >
                    <ProjectShader
                      imageUrl={caseFile.img}
                      ref={(shaderPort) => {
                        shaderPortsRef.current[caseIndex] = shaderPort;
                      }}
                      />
                    </div>

                  {isFlagship && (
                    <div className="pointer-events-none absolute inset-0 z-[1]">
                      <div className="absolute inset-x-[8%] top-[12%] h-px bg-[linear-gradient(90deg,transparent,rgba(224,224,224,0.44),transparent)] signal-sweep opacity-70" />
                      <div className="absolute right-6 top-6 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.32em] text-white/54 md:text-[9px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/62 signal-flicker" />
                        live_capture
                      </div>
                      <div className="absolute left-6 top-16 max-w-[14rem] border border-white/10 bg-black/48 px-3 py-3 font-mono text-[8px] uppercase tracking-[0.24em] text-white/44 md:text-[9px]">
                        <p className="text-white/58">evidence feed</p>
                        <p className="mt-2 leading-5 text-white/72">Telemetry, case metrics, and product traces stay in frame while the archive opens.</p>
                      </div>
                      <div className="absolute bottom-24 right-6 border border-white/10 bg-black/46 px-3 py-3 font-mono text-[8px] uppercase tracking-[0.24em] text-white/44 md:text-[9px]">
                        <p className="text-white/58">capture rail</p>
                        <div className="mt-3 flex items-end gap-1.5">
                          {FLAGSHIP_CAPTURE_BARS.map((barHeight, barIndex) => (
                            <span
                              key={`capture-bar-${barHeight}-${barIndex}`}
                              className="data-bar w-1.5 bg-[linear-gradient(180deg,rgba(224,224,224,0.22),rgba(224,224,224,0.78))]"
                              style={{
                                height: `${barHeight}px`,
                                animationDelay: `${barIndex * 0.08}s`,
                                animationDuration: `${1.7 + barIndex * 0.07}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.58)_46%,rgba(0,0,0,0.92)_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_34%)]" />
                  <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${hoverSignalClass}`} />

                  <div
                    className={`pointer-events-none absolute ${geometry.number} select-none font-sans text-[clamp(5rem,14vw,10rem)] font-black leading-none tracking-[-0.1em] text-white/8`}
                  >
                    0{caseIndex + 1}
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.32em] text-white/56 md:text-[10px]">
                      <div>
                        <p className="text-white/38">/{caseFile.fileName}</p>
                        <p className={`mt-2 text-white/44 transition-colors duration-300 ${hoverAccentSoftClass}`}>{caseFile.category}</p>
                        {isFlagship && (
                          <p className={`mt-3 inline-flex border border-white/12 bg-white/[0.03] px-2 py-1 text-[8px] tracking-[0.28em] text-white/56 transition-colors duration-300 ${hoverAccentClass}`}>
                            featured_casefile
                          </p>
                        )}
                      </div>
                      <div className="text-right text-white/34">
                        <p>{caseFile.year}</p>
                        <p className="mt-2">case_{caseFile.id}</p>
                      </div>
                    </div>

                    <div className="mt-10">
                      <h3 className="max-w-4xl font-sans text-[clamp(1.65rem,10vw,3rem)] font-black uppercase leading-[0.88] tracking-[-0.06em] text-white md:text-[clamp(2rem,5vw,4.5rem)]">
                        {caseFile.title}
                        <span className={`text-white/82 transition-colors duration-300 ${hoverAccentClass}`}>.</span>
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 md:mt-5 md:text-base md:leading-7">
                        {caseFile.subtitle}
                      </p>

                      <div className={`mt-6 border border-white/10 bg-black/58 p-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 md:mt-8 ${geometry.trace}`}>
                        {traceLines.map((traceLine) => (
                          <p key={traceLine} className="truncate leading-6">
                            {traceLine}
                          </p>
                        ))}
                      </div>

                      {isFlagship && (
                        <div className="mt-5 grid gap-3 border border-white/10 bg-white/[0.025] p-4 font-mono text-[9px] uppercase tracking-[0.26em] text-white/46 md:grid-cols-3">
                          {caseFile.metrics.map((metricPatch) => (
                            <div key={metricPatch.label} className="border border-white/8 bg-black/36 px-3 py-3">
                              <p className={`text-white/56 transition-colors duration-300 ${hoverAccentSoftClass}`}>{metricPatch.label}</p>
                              <p className="mt-3 text-white/78">{metricPatch.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
                      <div className="flex flex-wrap gap-6">
                        {caseFile.metrics.slice(0, 2).map((metricPatch) => (
                          <div key={metricPatch.label} className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/46">
                            <p>{metricPatch.label}</p>
                            <p className="mt-2 text-white/78">{metricPatch.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className={`font-mono text-[10px] uppercase tracking-[0.32em] text-white/44 transition-colors duration-300 ${hoverAccentClass}`}>
                        [ OPEN CASEFILE ]
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
