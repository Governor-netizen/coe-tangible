import { useState, useRef } from 'react';
import { MachineViewer } from '@/components/MachineViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { MachineType, machineDatabase, machineList } from '@/data/machineData';
import { Upload, Home } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import dcMotorIcon from '@/assets/icons/dc-motor.jpeg';
import dcGeneratorIcon from '@/assets/icons/dc-generator.jpeg';
import transformerIcon from '@/assets/icons/transformer.jpeg';
import inductionMotorIcon from '@/assets/icons/induction-motor.jpeg';
import { LandingPage } from '@/components/landing/LandingPage';

const machineIcons: Record<string, string> = {
  'dc-motor': dcMotorIcon,
  'dc-generator': dcGeneratorIcon,
  'transformer': transformerIcon,
  'induction-motor': inductionMotorIcon,
};

type View = 'home' | MachineType;

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isExploded, setIsExploded] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizTargetPart, setQuizTargetPart] = useState<string | null>(null);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [explodeSpread, setExplodeSpread] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const machineType = currentView === 'home' ? 'dc-motor' : currentView;
  const machine = machineDatabase[machineType] || machineDatabase['dc-motor'];

  const handleMachineChange = (id: MachineType) => {
    setCurrentView(id);
    setSelectedPart(null);
    setIsAnimating(false);
    setIsExploded(false);
    setAnimationSpeed(1);
    setQuizMode(false);
    setQuizTargetPart(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomModelUrl(url);
    setCurrentView('custom');
    setSelectedPart(null);
    setIsAnimating(false);
    setIsExploded(false);
  };

  const allTabs = [
    ...machineList,
    ...(customModelUrl ? [{ id: 'custom' as MachineType, name: 'Custom Model', icon: '📦' }] : []),
  ];

  // HOME VIEW
  if (currentView === 'home') {
    return <LandingPage onMachineSelect={handleMachineChange} onFileUpload={handleFileUpload} />;
  }

  // EXPLORER VIEW
  return (
    <div className="flex flex-col h-screen" style={{ background: '#1e293b' }}>
      {/* Header - dark slate style */}
      <header className="border-b" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <div className="w-px h-5" style={{ background: '#334155' }} />
              <img src={logo} alt="Tangible logo" className="w-7 h-7 rounded" />
              <h1 className="text-lg font-serif font-bold tracking-tight" style={{ color: '#e2e8f0' }}>
                Tangible
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{ background: '#2563eb', color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; }}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload 3D Model
              </button>
            </div>
          </div>
          {/* Tabs */}
          <nav className="flex gap-1 mt-3 overflow-x-auto">
            {allTabs.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMachineChange(m.id)}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                style={
                  currentView === m.id
                    ? { background: '#2563eb', color: '#fff' }
                    : { color: '#cbd5e1' }
                }
                onMouseEnter={(e) => {
                  if (currentView !== m.id) e.currentTarget.style.background = '#334155';
                }}
                onMouseLeave={(e) => {
                  if (currentView !== m.id) e.currentTarget.style.background = 'transparent';
                }}
              >
                {machineIcons[m.id] ? <img src={machineIcons[m.id]} alt={m.name} className="w-5 h-5 object-contain mr-1.5 rounded-sm" /> : <span className="mr-1.5">{m.icon}</span>}
                {m.name}
              </button>
            ))}
          </nav>
          {/* Camera hints */}
          <div className="flex justify-center gap-4 mt-2 pb-1" style={{ color: '#64748b', fontSize: '11px' }}>
            <span>🖱️ Drag to rotate</span>
            <span>🖱️ Scroll to zoom</span>
            <span>🖱️ Right-click to pan</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        <div className="h-[40vh] md:h-auto md:flex-1 md:w-[65%] p-3">
          <MachineViewer
            machineType={machineType as MachineType}
            selectedPart={selectedPart}
            onPartClick={setSelectedPart}
            isAnimating={isAnimating}
            animationSpeed={animationSpeed}
            isExploded={isExploded}
            showLabels={showLabels}
            customModelUrl={customModelUrl}
            canvasRef={canvasRef}
            explodeSpread={explodeSpread}
          />
        </div>

        <div className="flex-1 min-h-0 md:w-[35%] border-t md:border-t-0 md:border-l overflow-hidden" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
          <ControlPanel
            machine={machine}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
