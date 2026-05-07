import { useEffect, useState, useRef, useCallback } from "react";
import { useProgress } from "@react-three/drei";
import logo from "../assets/logo.jpeg";

interface SplashScreenProps {
  onHidden: () => void;
}

export function SplashScreen({ onHidden }: SplashScreenProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const finishedRef = useRef(false);

  // Track readiness of individual assets
  const videoReadyRef = useRef(false);
  const modelReadyRef = useRef(false);

  // R3F loading progress (tracks useGLTF and other drei loaders)
  const { progress: r3fProgress } = useProgress();

  const finishSplash = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDisplayProgress(100);
    setTimeout(() => {
      setIsHidden(true);
      setTimeout(onHidden, 500);
    }, 300);
  }, [onHidden]);

  const checkAllReady = useCallback(() => {
    if (videoReadyRef.current && modelReadyRef.current) {
      finishSplash();
    }
  }, [finishSplash]);

  // --- Preload the background video ---
  useEffect(() => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = "/motor.mp4";

    const onVideoReady = () => {
      videoReadyRef.current = true;
      checkAllReady();
    };

    video.addEventListener("canplaythrough", onVideoReady, { once: true });
    video.addEventListener("error", onVideoReady, { once: true });
    video.load();

    return () => {
      video.removeEventListener("canplaythrough", onVideoReady);
      video.removeEventListener("error", onVideoReady);
    };
  }, [checkAllReady]);

  // --- Track R3F 3D model loading ---
  useEffect(() => {
    if (r3fProgress >= 100) {
      modelReadyRef.current = true;
      checkAllReady();
    }
  }, [r3fProgress, checkAllReady]);

  // Failsafe: never block the user for more than 15 seconds
  useEffect(() => {
    const maxTimeout = setTimeout(finishSplash, 15000);
    return () => clearTimeout(maxTimeout);
  }, [finishSplash]);

  // Smooth progress ramp — blends video + 3D progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (finishedRef.current) return 100;

        // Weight: 40% video, 60% 3D model
        const videoContrib = videoReadyRef.current ? 40 : Math.min(prev * 0.4, 30);
        const modelContrib = (r3fProgress / 100) * 60;
        const target = videoContrib + modelContrib;

        // Smoothly approach the target, never jump backwards
        if (target > prev) {
          return prev + Math.min(target - prev, 3);
        }
        // If both aren't done yet, nudge slowly to 85 max
        if (prev < 85) return prev + 0.5;
        return prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [r3fProgress]);

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
          style={{ width: `${Math.min(displayProgress, 100)}%` }}
        />
      </div>

      <div className="mt-3 font-label text-[10px] text-[#0057FF] tracking-widest uppercase">
        {Math.round(Math.min(displayProgress, 100))}%
      </div>
    </div>
  );
}
