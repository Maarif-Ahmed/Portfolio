import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import HUD from "@/components/HUD";
import BugHunter from "@/components/BugHunter";
import BootSequence from "@/components/BootSequence";
import ScanLine from "@/components/ScanLine";
import Sidebar from "@/components/Sidebar";
import FooterBar from "@/components/FooterBar";
import Providers from "@/components/Providers";
import CustomCursor from "@/components/CustomCursor";
import RootEasterEgg from "@/components/RootEasterEgg";
import CommandPalette from "@/components/CommandPalette";
import LiquidBackground from "@/components/LiquidBackground";
import ViewportHUD from "@/components/ViewportHUD";
import Breadcrumb from "@/components/Breadcrumb";
import ParticleCanvas from "@/components/ParticleCanvas";
import CommandInput from "@/components/CommandInput";
import OverScrollEgg from "@/components/OverScrollEgg";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maarif - ROOT_ACCESS",
  description: "TERMINAL PORTFOLIO. STATUS: ONLINE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrains.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-mono relative">
        <div className="noise-overlay" />
        <div className="scanlines" />
        <div className="scanlines" />
        <div className="scanlines" />
        <Providers>
          <LiquidBackground />
          <ParticleCanvas />
          <ViewportHUD />
          <Breadcrumb />
          <CommandInput />
          <OverScrollEgg />
          <BootSequence />
          <ScanLine />
          <Sidebar />
          <CustomCursor />
          <RootEasterEgg />
          <CommandPalette />
          <HUD />
          <BugHunter />
          <div className="pb-10">
            {children}
          </div>
          <FooterBar />
        </Providers>
      </body>
    </html>
  );
}

