import { useEffect, useState } from "react";
import logo from "../assets/logo.jpeg";

interface SplashScreenProps {
  onHidden: () => void;
}

export function SplashScreen({ onHidden }: SplashScreenProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Simulate quick progress ramp while waiting for critical assets
    const progressInterval = setInterval(() => {
      if (cancelled) return;
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 120);

    // Preload the hero GLB model
    const preloadGLB = async () => {
      try {
        const response = await fetch("/dc-motor.glb");
        if (response.ok) {
          await response.blob();
        }
      } catch {
        // fail gracefully
      }
    };

    // Preload the motor video
    const preloadVideo = () =>
      new Promise<void>((resolve) => {
        const video = document.createElement("video");
        video.src = "/motor.mp4";
        video.onloadeddata = () => resolve();
        video.onerror = () => resolve();
      });

    // Race against a max timeout so splash never takes too long
    const maxTimeout = new Promise<void>((resolve) => setTimeout(resolve, 4000));

    Promise.race([
      Promise.all([preloadGLB(), preloadVideo()]),
      maxTimeout,
    ]).then(() => {
      if (cancelled) return;
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsHidden(true);
        setTimeout(onHidden, 500);
      }, 200);
    });

    return () => {
      cancelled = true;
      clearInterval(progressInterval);
    };
  }, [onHidden]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] transition-all duration-500 ${
        isHidden ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <img alt="Tangible Logo" className="w-16 h-16 object-contain" src={logo} />
        <div className="text-3xl font-serif text-[#B6C4FF]">
          Tangible<sup className="text-xs text-[#0057FF]">3D</sup>
        </div>
      </div>

      <div className="w-[200px] h-[2px] bg-[#1a1a1a] rounded-sm mt-6 overflow-hidden">
        <div
          className="h-full bg-[#0057FF] rounded-sm transition-all duration-150"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="mt-3 font-label text-[10px] text-[#0057FF] tracking-widest uppercase">
        {Math.round(Math.min(progress, 100))}%
      </div>
    </div>
  );
}
