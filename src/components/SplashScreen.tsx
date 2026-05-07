import { useEffect, useState, useRef, useCallback } from "react";
import logo from "../assets/logo.jpeg";

interface SplashScreenProps {
  onHidden: () => void;
}

export function SplashScreen({ onHidden }: SplashScreenProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const finishedRef = useRef(false);

  // Track individual asset readiness
  const videoReadyRef = useRef(false);
  const glbReadyRef = useRef(false);

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
    if (videoReadyRef.current && glbReadyRef.current) {
      finishSplash();
    }
  }, [finishSplash]);

  useEffect(() => {
    // --- Preload the background video ---
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = "/motor.mp4";

    const onVideoReady = () => {
      videoReadyRef.current = true;
      checkAllReady();
    };
    // canplaythrough = browser estimates it can play to end without buffering
    video.addEventListener("canplaythrough", onVideoReady, { once: true });
    video.addEventListener("error", onVideoReady, { once: true }); // fail gracefully
    video.load(); // kick off loading

    // --- Preload the GLB 3D model by fetching it into the browser cache ---
    const preloadGLB = async () => {
      try {
        const resp = await fetch("/dc-motor.glb");
        if (resp.ok) {
          // Read the entire body so it's fully cached
          await resp.arrayBuffer();
        }
      } catch {
        // fail gracefully
      }
      glbReadyRef.current = true;
      checkAllReady();
    };
    preloadGLB();

    // Failsafe: never block the user for more than 12 seconds
    const maxTimeout = setTimeout(finishSplash, 12000);

    return () => {
      clearTimeout(maxTimeout);
      video.removeEventListener("canplaythrough", onVideoReady);
      video.removeEventListener("error", onVideoReady);
    };
  }, [checkAllReady, finishSplash]);

  // Smooth progress ramp — holds at 85% until assets are truly done
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (finishedRef.current) return 100;
        // Ramp quickly to ~40%, then slow down, cap at 85%
        if (prev < 40) return prev + Math.random() * 8;
        if (prev < 70) return prev + Math.random() * 4;
        if (prev < 85) return prev + Math.random() * 1.5;
        return prev; // hold at 85 until finishSplash fires
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

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
