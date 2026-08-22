import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Home, Upload } from "lucide-react";
import logo from "../assets/logo.svg";
import LandingPage from "./LandingPage";
import { MachineViewer } from "../components/MachineViewer";
import { ControlPanel } from "../components/ControlPanel";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  machineDatabase,
  machineList,
  MachineData,
  MachineType,
  getMachineIcon,
  getSimulation,
} from "../data/machineData";

type AppView = "home" | "machines";

function defaultParams(machine: MachineData): Record<string, number> {
  const out: Record<string, number> = {};
  machine.labParameters.forEach((p) => (out[p.id] = p.defaultValue));
  return out;
}

const customMachineData: MachineData = {
  id: "custom",
  name: "Custom Model",
  description: "Interact with your uploaded model using the same explorer workflow.",
  parts: [],
  formulas: [],
  labParameters: [],
  labOutputs: [],
  operationDescription: "Upload a GLB/GLTF model and explore it in the viewer.",
};

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentView, setCurrentView] = useState<AppView>("home");
  const [machineType, setMachineType] = useState<MachineType>("dc-motor");
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isExploded, setIsExploded] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizTargetPart, setQuizTargetPart] = useState<string | null>(null);
  const [explodeSpread, setExplodeSpread] = useState(1);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [hintedPart, setHintedPart] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [showField, setShowField] = useState(true);
  const [linkLab, setLinkLab] = useState(true);
  const [labParams, setLabParams] = useState<Record<string, number>>(() =>
    defaultParams(machineDatabase["dc-motor"]),
  );

  useEffect(() => {
    setCurrentView(location.pathname === "/machines" ? "machines" : "home");
  }, [location.pathname]);

  const activeMachine = useMemo(() => {
    if (machineType === "custom") return customMachineData;
    return machineDatabase[machineType];
  }, [machineType]);

  // Lab sliders are per-machine, so reset them whenever the machine changes.
  useEffect(() => {
    setLabParams(defaultParams(activeMachine));
  }, [activeMachine]);

  const simulation = useMemo(
    () => getSimulation(machineType, labParams),
    [machineType, labParams],
  );

  /**
   * When the lab link is on, the model spins at a speed proportional to the
   * computed RPM instead of an arbitrary slider value — the 3D view becomes
   * the output of the simulation rather than decoration next to it.
   */
  const viewerRotorRpm = linkLab && machineType !== "custom" ? simulation.rotorRpm : null;
  const viewerFieldRpm = linkLab && machineType !== "custom" ? simulation.fieldRpm : null;

  const resetMachineTransientState = useCallback(() => {
    setSelectedPart(null);
    setQuizMode(false);
    setQuizTargetPart(null);
    setHintedPart(null);
    setIsExploded(false);
    setIsAnimating(false);
    setFocusMode(false);
  }, []);

  const handleMachineChange = useCallback(
    (nextMachine: "dc-motor" | "dc-generator" | "transformer" | "induction-motor") => {
      setMachineType(nextMachine);
      resetMachineTransientState();
      setCurrentView("machines");
      if (location.pathname !== "/machines") {
        navigate("/machines");
      }
    },
    [location.pathname, navigate, resetMachineTransientState],
  );

  const handleGoHome = useCallback(() => {
    setCurrentView("home");
    if (location.pathname !== "/") {
      navigate("/");
    }
  }, [location.pathname, navigate]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".glb") && !fileName.endsWith(".gltf")) {
      event.target.value = "";
      return;
    }

    setCustomModelUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    setMachineType("custom");
    resetMachineTransientState();
    setCurrentView("machines");
    if (location.pathname !== "/machines") {
      navigate("/machines");
    }

    event.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (customModelUrl) {
        URL.revokeObjectURL(customModelUrl);
      }
    };
  }, [customModelUrl]);

  if (currentView === "home") {
    return <LandingPage onMachineSelect={handleMachineChange} />;
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface">
      <header className="px-4 py-2 border-b border-outline-variant/40 bg-surface-container-low sticky top-0 z-30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface text-xs font-label tracking-widest uppercase transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface text-xs font-label tracking-widest uppercase transition-colors"
            >
              Research
            </Link>
            <div className="h-6 w-px bg-outline-variant/60" />
            <div className="flex items-center gap-2">
              <img alt="Tangible Logo" className="w-10 h-10 object-contain" style={{ transform: 'scale(1.6)', transformOrigin: 'center' }} src={logo} />
              <span className="text-3xl font-serif text-primary">Tangible</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
              onChange={handleUploadChange}
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-2.5 rounded-none text-xs font-label tracking-widest uppercase transition-all hover:bg-opacity-90"
            >
              <Upload className="w-4 h-4" />
              Upload 3D Model
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {machineList.map((m) => {
            const active = machineType === m.id;
            const IconComponent = getMachineIcon(m.icon);
            return (
              <button
                key={m.id}
                onClick={() => handleMachineChange(m.id as "dc-motor" | "dc-generator" | "transformer" | "induction-motor")}
                className={`inline-flex items-center gap-2 rounded px-3 py-2 border transition-all font-label text-xs tracking-wider ${
                  active
                    ? "bg-primary-container border-primary text-on-primary-container"
                    : "bg-surface-container border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${active ? "text-on-primary-container" : "text-primary"}`} />
                <span>{m.name}</span>
              </button>
            );
          })}
          {machineType === "custom" && (
            <span className="inline-flex items-center rounded px-3 py-2 border border-tertiary/50 bg-tertiary-container/25 text-tertiary-fixed text-xs font-label tracking-wider uppercase">
              Custom Model Loaded
            </span>
          )}
        </div>
      </header>

      <div className="px-4 py-3 text-on-surface-variant text-xs font-label tracking-widest uppercase text-center border-b border-outline-variant/20">
        Drag to rotate   Scroll to zoom   Right-click to pan
      </div>

      <main className="grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-3 px-4 py-4">
        <div className="min-h-[420px] rounded border border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
          <MachineViewer
            machineType={machineType}
            selectedPart={selectedPart}
            onPartClick={setSelectedPart}
            isAnimating={isAnimating}
            animationSpeed={animationSpeed}
            isExploded={isExploded}
            showLabels={showLabels}
            customModelUrl={customModelUrl}
            canvasRef={canvasRef}
            explodeSpread={explodeSpread}
            hintedPart={hintedPart}
            focusMode={focusMode}
            showField={showField}
            rotorRpm={viewerRotorRpm}
            fieldRpm={viewerFieldRpm}
            flux={simulation.flux}
            current={simulation.current}
          />
        </div>

        <div className="min-h-[420px] rounded border border-outline-variant/30 bg-surface-container overflow-hidden">
          <ControlPanel
            machine={activeMachine}
            selectedPart={selectedPart}
            isAnimating={isAnimating}
            setIsAnimating={setIsAnimating}
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            isExploded={isExploded}
            setIsExploded={setIsExploded}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
            quizMode={quizMode}
            setQuizMode={setQuizMode}
            quizTargetPart={quizTargetPart}
            setQuizTargetPart={setQuizTargetPart}
            explodeSpread={explodeSpread}
            setExplodeSpread={setExplodeSpread}
            labParams={labParams}
            setLabParams={setLabParams}
            hintedPart={hintedPart}
            setHintedPart={setHintedPart}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            showField={showField}
            setShowField={setShowField}
            linkLab={linkLab}
            setLinkLab={setLinkLab}
            simulation={simulation}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
