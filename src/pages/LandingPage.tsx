import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, useProgress } from "@react-three/drei";
import logo from "../assets/logo.jpeg";
import MotorScrolly from "../components/MotorScrolly";
import { ThemeToggle } from "../components/ThemeToggle";

interface LandingPageProps {
  onMachineSelect: (machineId: "dc-motor" | "dc-generator" | "transformer" | "induction-motor") => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="text-primary font-label text-xs tracking-widest whitespace-nowrap bg-surface-container-low/80 px-4 py-2 rounded backdrop-blur-sm border border-outline-variant/30">
      {progress.toFixed(0)}% LOADED
    </Html>
  );
}

function DCMotorGLBModel() {
  const { scene } = useGLTF("/dc-motor.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} scale={3.2} position={[0, -1.2, 0]} />;
}

function DCMotorGLBPreview({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [4.0, 2.6, 4.2], fov: 38 }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[6, 6, 6]} intensity={1.2} />
        <directionalLight position={[-5, 3, -3]} intensity={0.55} />
        <Suspense fallback={<Loader />}>
          <DCMotorGLBModel />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}

export default function LandingPage({ onMachineSelect }: LandingPageProps) {
  const openAuthNow = () => {
    window.location.assign("/auth");
  };

  useEffect(() => {
    if (document.head.querySelector('link[rel="preload"][href="/dc-motor.glb"]')) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "fetch";
    link.href = "/dc-motor.glb";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const vismeUrl = "https://forms.visme.co/formsPlayer/q74edmvw-membership-sign-up-form";

    const makeHint = (rel: "preconnect" | "dns-prefetch", href: string) => {
      if (document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (rel === "preconnect") {
        link.crossOrigin = "anonymous";
      }
      document.head.appendChild(link);
    };

    makeHint("dns-prefetch", "https://forms.visme.co");
    makeHint("preconnect", "https://forms.visme.co");

    const timer = setTimeout(() => {
      if (!document.getElementById("visme-auth-prewarm")) {
        const prewarmFrame = document.createElement("iframe");
        prewarmFrame.id = "visme-auth-prewarm";
        prewarmFrame.src = vismeUrl;
        prewarmFrame.loading = "lazy";
        prewarmFrame.setAttribute("aria-hidden", "true");
        prewarmFrame.tabIndex = -1;
        prewarmFrame.style.position = "fixed";
        prewarmFrame.style.width = "1px";
        prewarmFrame.style.height = "1px";
        prewarmFrame.style.opacity = "0";
        prewarmFrame.style.pointerEvents = "none";
        prewarmFrame.style.left = "-9999px";
        prewarmFrame.style.top = "-9999px";
        prewarmFrame.style.border = "0";
        document.body.appendChild(prewarmFrame);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-surface-dim text-on-surface selection:bg-primary-container selection:text-white min-h-screen">
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 bg-[#0A0C10] transition-all duration-300">
        <div className="flex items-center gap-3">
          <img alt="Tangible Logo" className="w-8 h-8 object-contain" src={logo} />
          <div className="text-2xl font-serif text-[#0057FF] dark:text-[#B6C4FF] after:content-['3D'] after:text-xs after:align-top after:ml-0.5 after:text-[#0057FF]">
            Tangible
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onMachineSelect("dc-motor")}
            className="text-slate-400 font-normal font-label text-xs tracking-widest hover:text-[#0057FF] transition-colors duration-200"
          >
            MACHINES
          </button>
          <a className="text-slate-400 font-normal font-label text-xs tracking-widest hover:text-[#0057FF] transition-colors duration-200" href="#">
            SYSTEMS
          </a>
          <a className="text-slate-400 font-normal font-label text-xs tracking-widest hover:text-[#0057FF] transition-colors duration-200" href="#">
            COURSES
          </a>
          <a className="text-slate-400 font-normal font-label text-xs tracking-widest hover:text-[#0057FF] transition-colors duration-200" href="#">
            RESEARCH
          </a>
          <a className="text-slate-400 font-normal font-label text-xs tracking-widest hover:text-[#0057FF] transition-colors duration-200" href="#">
            ABOUT
          </a>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle className="w-8 h-8" />
          <button
            onClick={openAuthNow}
            className="font-label text-xs tracking-widest text-slate-400 hover:text-white transition-colors uppercase"
          >
            Sign In
          </button>
          <button
            onClick={openAuthNow}
            className="bg-primary-container text-white font-label text-xs tracking-widest px-6 py-2.5 rounded-none active:scale-95 duration-75 uppercase"
          >
            Get Access →
          </button>
        </div>
      </nav>

      <MotorScrolly />

      <section className="relative min-h-screen flex items-center bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30"></div>
        <div className="absolute inset-0 blueprint-grid-fine opacity-20"></div>
        <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 pt-24 lg:pt-20">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-label tech-tag font-medium tracking-widest mb-6">ENGINEERING · VISUALIZED</span>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl leading-none text-on-surface mb-8">
              Understand <span className="italic text-primary">Machines</span> Through Motion.
            </h1>
            <p className="font-serif-body text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
              Interactive 3D models for DC machines, transformers, control systems, and more — designed for deep technical learning and spatial intuition.
            </p>
            <div className="flex flex-wrap gap-6">
              <button
                onClick={() => onMachineSelect("dc-motor")}
                className="bg-primary-container text-on-primary-container px-10 py-4 font-label text-sm tracking-widest rounded uppercase flex items-center gap-3 group hover:bg-opacity-90 transition-all"
              >
                → Explore the Library
              </button>
              <button
                onClick={() => onMachineSelect("dc-motor")}
                className="border border-outline-variant bg-surface-container-low text-on-surface px-10 py-4 font-label text-sm tracking-widest rounded uppercase hover:bg-surface-container-high transition-all"
              >
                View Featured: DC Motor Series ↗
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full aspect-square relative rounded border border-outline-variant/20 bg-surface-container-lowest/50 backdrop-blur-sm overflow-hidden flex items-center justify-center">
              <div className="relative w-full h-full p-8 flex items-center justify-center">
                <DCMotorGLBPreview className="hero-glb-preview w-full h-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-primary/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute top-4 left-4 font-label text-[10px] tech-tag tracking-tighter opacity-80">
                  SYSTEM_STABLE: 104.2Hz
                  <br />
                  DC_MOTOR_MODEL_A1
                </div>
                <div className="absolute bottom-4 right-4 font-label text-[10px] tech-tag tracking-tighter text-right opacity-80">
                  FIELD_WINDING: NOMINAL
                  <br />
                  VOLTAGE: 220V
                </div>
                <div className="absolute inset-0 pointer-events-none border-[1px] border-outline-variant/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-surface px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-12 lg:mb-16">
            <div className="w-1.5 h-12 bg-primary-container"></div>
            <h2 className="font-headline text-3xl md:text-4xl">Recently Published Models</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="group bg-surface-container-low border border-outline-variant/15 p-5 md:p-6 hover:border-primary-container transition-all duration-300 hover:-translate-y-1">
              <div className="relative aspect-video bg-surface-container-lowest mb-6 overflow-hidden flex items-center justify-center border border-outline-variant/10">
                <img className="recent-model-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" alt="DC Generator" src="/stitch-images/dc-motor.png" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-surface-dim/80 px-2 py-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-label text-[10px] text-secondary">NEW</span>
                </div>
              </div>
              <div className="font-label text-[10px] tech-tag tracking-widest mb-2 uppercase">DC_MACHINES</div>
              <h3 className="font-headline text-2xl mb-4">Shunt-Wound DC Generator</h3>
              <p className="font-serif-body text-on-surface-variant text-sm mb-8 leading-relaxed">
                Exploration of voltage-current characteristics under varying load conditions with interactive field rheostat.
              </p>
              <button
                onClick={() => onMachineSelect("dc-generator")}
                className="font-label text-xs text-primary-fixed-dim hover:text-primary transition-colors tracking-widest group flex items-center gap-2"
              >
                OPEN MODEL <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="group bg-surface-container-low border border-outline-variant/15 p-6 hover:border-primary-container transition-all duration-300 hover:-translate-y-1">
              <div className="relative aspect-video bg-surface-container-lowest mb-6 overflow-hidden flex items-center justify-center border border-outline-variant/10">
                <img className="recent-model-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" alt="Transformer" src="/stitch-images/transformer.png" />
              </div>
              <div className="font-label text-[10px] tech-tag tracking-widest mb-2 uppercase">TRANSFORMERS</div>
              <h3 className="font-headline text-2xl mb-4">Single-Phase Core Type</h3>
              <p className="font-serif-body text-on-surface-variant text-sm mb-8 leading-relaxed">
                Visualize magnetic flux distribution and eddy current losses across high-fidelity laminated core sections.
              </p>
              <button
                onClick={() => onMachineSelect("transformer")}
                className="font-label text-xs text-primary-fixed-dim hover:text-primary transition-colors tracking-widest group flex items-center gap-2"
              >
                OPEN MODEL <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="group bg-surface-container-low border border-outline-variant/15 p-6 hover:border-primary-container transition-all duration-300 hover:-translate-y-1">
              <div className="relative aspect-video bg-surface-container-lowest mb-6 overflow-hidden flex items-center justify-center border border-outline-variant/10">
                <img className="recent-model-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" alt="Induction Motor" src="/stitch-images/control-system.png" />
              </div>
              <div className="font-label text-[10px] tech-tag tracking-widest mb-2 uppercase">INDUCTION_MOTOR</div>
              <h3 className="font-headline text-2xl mb-4">Three-Phase Induction Motor</h3>
              <p className="font-serif-body text-on-surface-variant text-sm mb-8 leading-relaxed">
                Explore rotating magnetic fields, slip, and torque behavior in a modern induction machine.
              </p>
              <button
                onClick={() => onMachineSelect("induction-motor")}
                className="font-label text-xs text-primary-fixed-dim hover:text-primary transition-colors tracking-widest group flex items-center gap-2"
              >
                OPEN MODEL <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 px-4 md:px-8 border-y border-outline-variant/10">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-8">
              From lecture to <br />
              <span className="italic text-primary">spatial understanding</span>.
            </h2>
            <p className="font-serif-body text-base md:text-lg text-on-surface-variant mb-10 max-w-md">
              Every model is mapped to specific course weeks, ensuring that visual aids are synced with the theoretical concepts taught in class.
            </p>
            <button className="bg-surface-container-high border border-outline-variant/30 text-on-surface font-label text-xs tracking-widest px-8 py-4 uppercase flex items-center gap-3">
              View Course Mapping →
            </button>
          </div>

          <div className="relative h-[360px] md:h-[420px]">
            <div className="absolute top-0 right-0 w-3/4 aspect-[3/4] bg-surface-container border border-outline-variant/20 shadow-2xl z-0 transform rotate-3 overflow-hidden">
              <img className="w-full h-full object-cover grayscale opacity-50" alt="Technical notebook sketch" src="/stitch-images/sketch.png" />
            </div>
            <div className="absolute top-10 right-20 w-3/4 aspect-square bg-[#0A0C10] border border-primary/20 p-4 z-10 transform -rotate-2 flex items-center justify-center overflow-hidden">
              <img className="w-full h-full object-contain mix-blend-screen opacity-80" alt="DC motor wireframe" src="/stitch-images/dc-motor.png" />
              <div className="absolute top-4 left-4 font-label text-[10px] tech-tag">MODEL_REF: DC_SERIES_V1</div>
            </div>
            <div className="absolute bottom-4 left-8 bg-primary-container p-6 w-56 z-20">
              <div className="font-label text-[10px] text-white/70 mb-2">SYLLABUS_MAP</div>
              <div className="text-white font-headline text-lg">EE304: Electrical Machines I</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface px-4 md:px-8">
        <div className="container mx-auto bg-surface-container-lowest border border-outline-variant/10">
          <div className="grid lg:grid-cols-2">
            <div className="p-12 relative border-b lg:border-b-0 lg:border-r border-outline-variant/10 flex flex-col justify-center items-center overflow-hidden">
              <div className="font-label text-xs tech-tag self-start mb-8 tracking-[0.2em]">FEATURED_DEEP_DIVE</div>
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <img className="w-4/5 h-4/5 object-contain opacity-40 mix-blend-screen animate-snap" alt="DC Motor Breakdown" src="/stitch-images/dc-motor.png" />
              </div>
            </div>
            <div className="p-12 flex flex-col">
              <div className="flex gap-6 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                <button className="font-label text-xs tracking-widest text-primary border-b border-primary pb-1 whitespace-nowrap">OVERVIEW</button>
                <button className="font-label text-xs tracking-widest text-outline hover:text-white pb-1 whitespace-nowrap">WORKING PRINCIPLE</button>
                <button className="font-label text-xs tracking-widest text-outline hover:text-white pb-1 whitespace-nowrap">EQUATIONS</button>
                <button className="font-label text-xs tracking-widest text-outline hover:text-white pb-1 whitespace-nowrap">3D VIEW</button>
              </div>
              <div className="flex-grow">
                <h3 className="font-headline text-4xl mb-6">The Series DC Motor</h3>
                <p className="font-serif-body text-on-surface-variant leading-relaxed mb-6">
                  Commonly used in applications requiring high starting torque, such as electric locomotives and cranes. In a series-wound motor, the field winding is connected in series with the armature winding.
                </p>
              </div>
              <button
                onClick={() => onMachineSelect("dc-motor")}
                className="w-full bg-primary-container text-white font-label text-xs tracking-widest py-5 uppercase group flex justify-center items-center gap-2"
              >
                Open Full 3D Model <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-10 px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0C0E12] border-t border-[#434656]/15">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img alt="Tangible Logo" className="w-6 h-6 object-contain grayscale opacity-50" src={logo} />
            <div className="text-xl font-serif text-slate-200">Tangible</div>
          </div>
          <div className="font-label text-[10px] text-slate-500 tracking-wider uppercase">Built for engineering education in Africa</div>
        </div>
        <div className="font-label text-[10px] text-slate-600">© 2026 TANGIBLE</div>
      </footer>
    </div>
  );
}

useGLTF.preload("/dc-motor.glb");
