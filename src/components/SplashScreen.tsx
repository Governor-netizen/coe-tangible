import { useEffect, useState } from "react";
import logo from "../assets/logo.jpeg";

interface SplashScreenProps {
  onHidden: () => void;
}

export function SplashScreen({ onHidden }: SplashScreenProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const firstFrameReadyStorageKey = "tangible:first-frame-ready";
    const requiredFrameCount = 20;
    const totalTargets = requiredFrameCount + 1; // first 20 frames + hero model
    let loadedFrames = 0;
    let heroModelReady = false;

    // Critical loading tasks:
    // - First 20 frames of MotorScrolly
    // - dc-motor.glb model

    const updateProgress = () => {
      const currentLoaded = loadedFrames + (heroModelReady ? 1 : 0);
      const pct = Math.round((currentLoaded / totalTargets) * 100);
      setProgress(pct);

      if (loadedFrames >= requiredFrameCount && heroModelReady) {
        setTimeout(() => {
          setIsHidden(true);
          setTimeout(onHidden, 600); // Match CSS transition duration
        }, 300);
      }
    };

    const markFrameLoaded = (index: number) => {
      if (index === 1) {
        sessionStorage.setItem(firstFrameReadyStorageKey, "true");
      }
      loadedFrames++;
      updateProgress();
    };

    const markHeroModelReady = () => {
      if (heroModelReady) return;
      heroModelReady = true;
      updateProgress();
    };

    // Preload first 20 scrolly frames (blocking)
    for (let i = 1; i <= requiredFrameCount; i++) {
      const frame = new Image();
      const onFrameDone = () => markFrameLoaded(i);
      frame.onload = onFrameDone;
      frame.onerror = onFrameDone;
      frame.src = `/ezgif/ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
    }

    // Preload hero GLB model (blocking)
    const preloadGLB = async () => {
      try {
        const response = await fetch("/dc-motor.glb");
        if (response.ok) {
          markHeroModelReady();
        } else {
          markHeroModelReady();
        }
      } catch {
        markHeroModelReady();
      }
    };
    preloadGLB();
  }, [onHidden]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] transition-all duration-600 ${
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
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 font-label text-[10px] text-[#0057FF] tracking-widest uppercase">
        {progress}%
      </div>
    </div>
  );
}
