'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Sparkles } from '@react-three/drei';
import { Color, Group, InstancedMesh, Object3D } from 'three';
import { generateContributionData, summarizeContributionData } from '@/lib/contributionData';

function ContributionBars() {
  const meshRef = useRef<InstancedMesh>(null);
  const days = useMemo(() => generateContributionData(), []);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    days.forEach((day, index) => {
      const height = Math.max(day.height, 0.12);
      dummy.position.set(day.week * 0.28 - 7.2, height / 2, day.weekday * 0.28 - 0.84);
      dummy.scale.set(1, height, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const lightness = 0.11 + day.intensity * 0.08;
      mesh.setColorAt(index, color.setHSL(0.52, 0.9, lightness));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [color, days, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, days.length]}>
      <boxGeometry args={[0.2, 1, 0.2]} />
      <meshStandardMaterial
        vertexColors
        emissive="#00F0FF"
        emissiveIntensity={0.16}
        metalness={0.28}
        roughness={0.22}
      />
    </instancedMesh>
  );
}

function SceneContents() {
  const rigRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!rigRef.current) return;
    rigRef.current.rotation.y += delta * 0.08;
    rigRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.04;
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[8.5, 7.4, 8.5]} zoom={72} near={0.1} far={100} />
      <color attach="background" args={['#02070a']} />
      <fog attach="fog" args={['#02070a', 10, 28]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[6, 9, 4]} intensity={1.2} color="#d6fdff" />
      <pointLight position={[0, 5, 0]} intensity={1.8} color="#00F0FF" />
      <pointLight position={[-6, 2.5, -4]} intensity={0.7} color="#0a4653" />

      <group ref={rigRef}>
        <ContributionBars />
        <gridHelper args={[18, 30, '#0f5564', '#082831']} position={[0, 0.001, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[18, 6]} />
          <meshStandardMaterial color="#031317" emissive="#02171c" emissiveIntensity={0.45} />
        </mesh>
      </group>

      <Sparkles count={12} scale={[16, 5, 6]} size={1.8} speed={0.14} opacity={0.12} color="#00F0FF" />
    </>
  );
}

function ContributionFallback() {
  const summary = useMemo(() => summarizeContributionData(generateContributionData()), []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="border border-[#E0E0E0]/18 bg-[#0a0d10] px-4 py-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]/60">active_days</p>
        <p className="text-3xl font-black text-foreground">{summary.activeDays}</p>
      </div>
      <div className="border border-[#E0E0E0]/18 bg-[#0a0d10] px-4 py-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]/60">total_intensity</p>
        <p className="text-3xl font-black text-foreground">{summary.totalIntensity}</p>
      </div>
      <div className="border border-[#E0E0E0]/18 bg-[#0a0d10] px-4 py-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]/60">peak_load</p>
        <p className="text-3xl font-black text-foreground">{summary.maxIntensity}/4</p>
      </div>
    </div>
  );
}

export default function ContributionGraph3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const [canRender3D, setCanRender3D] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)');
    const updateCapability = () => setCanRender3D(!mediaQuery.matches);

    updateCapability();
    mediaQuery.addEventListener('change', updateCapability);

    return () => mediaQuery.removeEventListener('change', updateCapability);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '35% 0px' }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="graph" className="bg-background px-6 py-14 md:px-20 md:py-20">
      <article className="mx-auto max-w-6xl overflow-hidden border border-[#E0E0E0]/22 bg-[#090d10] shadow-[0_0_40px_rgba(224,224,224,0.06)]">
        <div className="border-b border-[#E0E0E0]/18 px-5 py-4 md:px-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]/65 md:text-xs">
            contribution_graph_3d
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Activity Rendered as an Isometric Signal Grid
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-foreground/65 md:text-base">
            A deterministic year of output mapped into glowing columns, viewed through an orthographic camera so the graph reads like hardware instead of a chart.
          </p>
        </div>
        <div className="px-5 py-6 md:px-8 md:py-8">
          {canRender3D && isInView ? (
            <div className="h-[22rem] overflow-hidden border border-[#E0E0E0]/15 bg-black md:h-[36rem]">
              <Canvas
                dpr={[1, 1.1]}
                gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
                performance={{ min: 0.8 }}
              >
                <Suspense fallback={null}>
                  <SceneContents />
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <ContributionFallback />
          )}
        </div>
      </article>
    </section>
  );
}
