import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";

const frameCount = 138;
const frameIndex = (index: number) => `/ezgif/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
const firstFrameReadyStorageKey = "tangible:first-frame-ready";
const frameCache: (HTMLImageElement | undefined)[] = new Array(frameCount);
const eagerFrameCount = 40;
const preloadConcurrency = 12;
let firstFrameReadyCache = false;

const getPerformanceProfile = () => {
  if (typeof navigator === "undefined") {
    return { eager: eagerFrameCount, concurrency: preloadConcurrency, frameStep: 1 };
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData === true;
  const lowEnd = saveData || cores <= 4 || memory <= 4;

  return {
    eager: lowEnd ? 20 : eagerFrameCount,
    concurrency: lowEnd ? 6 : preloadConcurrency,
    frameStep: lowEnd ? 2 : 1,
  };
};

export default function MotorScrolly() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([...frameCache]);
  const lastFrameRef = useRef(-1);
  const rafDrawRef = useRef<number | null>(null);
  const hasDrawnFrameRef = useRef(false);
  const pendingFrameRef = useRef(0);
  const viewportRef = useRef({ width: 0, height: 0 });
  const perfProfileRef = useRef(getPerformanceProfile());
  const [hasDrawnFrame, setHasDrawnFrame] = useState(false);
  const [loaded, setLoaded] = useState(() => {
    if (firstFrameReadyCache) return true;
    if (typeof window !== "undefined" && sessionStorage.getItem(firstFrameReadyStorageKey) === "true") {
      firstFrameReadyCache = true;
      return true;
    }
    return false;
  });

  // Preload first frame immediately, then progressively load the rest.
  useEffect(() => {
    let cancelled = false;

    const preloadFrame = (i: number, onDone?: () => void, priority: "high" | "low" = "low") => {
      if (cancelled) return;
      if (frameCache[i] && frameCache[i]?.complete) {
        imagesRef.current[i] = frameCache[i];
        onDone?.();
        return;
      }

      const img = new Image();
      img.decoding = "async";
      img.fetchPriority = priority;
      img.src = frameIndex(i + 1);
      img.onload = () => {
        if (cancelled) return;
        imagesRef.current[i] = img;
        frameCache[i] = img;
        onDone?.();
      };
      img.onerror = () => onDone?.();
    };

    // Limit in-flight image requests to avoid decode/network bursts.
    const queuePreload = (start: number, end: number, concurrency: number) => {
      let next = start;
      let inFlight = 0;

      const pump = () => {
        if (cancelled) return;
        while (inFlight < concurrency && next < end) {
          const idx = next;
          next += 1;
          inFlight += 1;
          preloadFrame(idx, () => {
            inFlight -= 1;
            pump();
          }, "high");
        }
      };

      pump();
    };

    preloadFrame(0, () => {
      firstFrameReadyCache = true;
      sessionStorage.setItem(firstFrameReadyStorageKey, "true");
      setLoaded(true);
    }, "high");

    const { eager, concurrency } = perfProfileRef.current;

    for (let i = 1; i < Math.min(eager, frameCount); i++) {
      preloadFrame(i, undefined, "high");
    }

    const kickQueue = () => queuePreload(eager, frameCount, concurrency);
    const idleId = typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(kickQueue, { timeout: 300 })
      : null;
    const delayed = window.setTimeout(() => {
      if (idleId === null) kickQueue();
    }, 120);

    // Safety timeout for slow connections.
    const timeout = window.setTimeout(() => setLoaded(true), 5000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearTimeout(delayed);
      if (idleId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.35 });

  useEffect(() => {
    if (!loaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      viewportRef.current.width = window.innerWidth;
      viewportRef.current.height = window.innerHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
      lastFrameRef.current = -1;
    };

    const drawFrame = (frameNum: number) => {
      if (frameNum === lastFrameRef.current) return;
      const img = imagesRef.current[frameNum];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      lastFrameRef.current = frameNum;
      if (!hasDrawnFrameRef.current) {
        hasDrawnFrameRef.current = true;
        setHasDrawnFrame(true);
      }

      const { width, height } = viewportRef.current;
      ctx.clearRect(0, 0, width, height);

      const canvasAspect = width / height;
      const imgAspect = img.width / img.height;

      let drawWidth;
      let drawHeight;
      let drawX;
      let drawY;

      if (canvasAspect > imgAspect) {
        drawHeight = height;
        drawWidth = img.width * (height / img.height);
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = width;
        drawHeight = img.height * (width / img.width);
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const findNearestLoadedFrame = (target: number) => {
      const exact = imagesRef.current[target];
      if (exact && exact.complete && exact.naturalWidth > 0) return target;

      for (let offset = 1; offset < frameCount; offset++) {
        const backward = target - offset;
        if (backward >= 0) {
          const backImg = imagesRef.current[backward];
          if (backImg && backImg.complete && backImg.naturalWidth > 0) return backward;
        }
        const forward = target + offset;
        if (forward < frameCount) {
          const fwdImg = imagesRef.current[forward];
          if (fwdImg && fwdImg.complete && fwdImg.naturalWidth > 0) return forward;
        }
      }

      return -1;
    };

    const scheduleDraw = (progress: number) => {
      const rawFrame = Math.min(frameCount - 1, Math.max(0, Math.floor(progress * (frameCount - 1))));
      const { frameStep } = perfProfileRef.current;
      const quantized = Math.floor(rawFrame / frameStep) * frameStep;
      pendingFrameRef.current = quantized;
      if (rafDrawRef.current !== null) return;
      rafDrawRef.current = requestAnimationFrame(() => {
        rafDrawRef.current = null;
        const nextFrame = findNearestLoadedFrame(pendingFrameRef.current);
        if (nextFrame >= 0) drawFrame(nextFrame);
      });
    };

    resizeCanvas();
    drawFrame(0);

    const unsubscribe = smoothProgress.on("change", (v) => scheduleDraw(v));
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible" && rafDrawRef.current !== null) {
        cancelAnimationFrame(rafDrawRef.current);
        rafDrawRef.current = null;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (rafDrawRef.current !== null) cancelAnimationFrame(rafDrawRef.current);
    };
  }, [loaded, smoothProgress]);

  // Beat A: 0-20%
  const opacityA = useTransform(smoothProgress, [0, 0.15, 0.2, 0.25], [1, 1, 0, 0]);
  // Beat B: 25-45%
  const opacityB = useTransform(smoothProgress, [0.2, 0.25, 0.4, 0.45], [0, 1, 1, 0]);
  // Beat C: 50-70%
  const opacityC = useTransform(smoothProgress, [0.45, 0.5, 0.65, 0.7], [0, 1, 1, 0]);
  // Beat D: 75-95%
  const opacityD = useTransform(smoothProgress, [0.7, 0.75, 0.9, 0.95], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#050505]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

        {/* Fallback first frame: visible until canvas renders its first frame */}
        <img
          src={frameIndex(1)}
          alt="DC motor first frame"
          className={`absolute inset-0 z-0 w-full h-full object-cover transition-opacity duration-300 ${hasDrawnFrame ? "opacity-0" : "opacity-100"}`}
          draggable={false}
        />
        
        {/* Full screen canvas taking up space and drawing frame by frame */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 w-full h-full mix-blend-screen"
        />

        {/* Dynamic Text Overlay Sequence */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end md:justify-center p-8 pointer-events-none pb-32 md:pb-8">
          
          <motion.div style={{ opacity: opacityA }} className="absolute text-center flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white drop-shadow-2xl mb-4 font-headline uppercase">Understand Machines.</h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl font-serif-body">Dive into the architecture of motion through high-fidelity visualization.</p>
          </motion.div>

          <motion.div style={{ opacity: opacityB }} className="absolute text-center flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white drop-shadow-2xl mb-4 font-headline uppercase">Electromagnetic Core.</h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl font-serif-body">The high-density copper armature rotates within a calibrated magnetic stator.</p>
          </motion.div>

          <motion.div style={{ opacity: opacityC }} className="absolute text-center flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white drop-shadow-2xl mb-4 font-headline uppercase">Precision Components.</h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl font-serif-body">From carbon brushes to neodymium magnets, every part is engineered for torque.</p>
          </motion.div>

          <motion.div style={{ opacity: opacityD }} className="absolute text-center flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-[#0057FF] drop-shadow-2xl mb-4 font-headline uppercase">Beyond the Surface.</h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl font-serif-body mb-8">Explore our full library of interactive 3D machines below.</p>
            <div className="h-1 w-32 bg-[#0057FF] mx-auto rounded-full blur-[1px] shadow-[0_0_15px_#0057FF]"></div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
