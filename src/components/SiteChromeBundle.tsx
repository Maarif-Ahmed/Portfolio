'use client';

import HUD from '@/components/HUD';
import BugHunter from '@/components/BugHunter';
import ScanLine from '@/components/ScanLine';
import Sidebar from '@/components/Sidebar';
import FooterBar from '@/components/FooterBar';
import CustomCursor from '@/components/CustomCursor';
import RootEasterEgg from '@/components/RootEasterEgg';
import CommandPalette from '@/components/CommandPalette';
import LiquidBackground from '@/components/LiquidBackground';
import ViewportHUD from '@/components/ViewportHUD';
import Breadcrumb from '@/components/Breadcrumb';
import ParticleCanvas from '@/components/ParticleCanvas';
import CommandInput from '@/components/CommandInput';
import OverScrollEgg from '@/components/OverScrollEgg';

export default function SiteChromeBundle() {
  return (
    <>
      <LiquidBackground />
      <ParticleCanvas />
      <ViewportHUD />
      <Breadcrumb />
      <CommandInput />
      <OverScrollEgg />
      <ScanLine />
      <Sidebar />
      <CustomCursor />
      <RootEasterEgg />
      <CommandPalette />
      <HUD />
      <BugHunter />
      <FooterBar />
    </>
  );
}
