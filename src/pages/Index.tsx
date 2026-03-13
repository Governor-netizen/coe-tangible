import { useState, useRef } from 'react';
import { MachineViewer } from '@/components/MachineViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { MachineType, machineDatabase, machineList } from '@/data/machineData';
import { cn } from '@/lib/utils';
import { Upload, Home, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero-bg.mp4"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-4"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            ⚡ Machine Explorer
          </h1>
          <p
            className="text-lg sm:text-xl text-white/85 mb-12 max-w-2xl"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
          >
            Interactive 3D Learning Platform for Electrical Machines
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
            {machineList.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMachineChange(m.id)}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
              >
                <span className="text-4xl">{m.icon}</span>
                <span className="text-sm font-medium text-white">{m.name}</span>
                <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 text-white font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Your Own 3D Model
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EXPLORER VIEW
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <div className="w-px h-5 bg-border" />
              <h1 className="text-lg font-serif font-bold text-foreground tracking-tight">
                ⚡ Machine Explorer
              </h1>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload 3D Model
              </button>
            </div>
          </div>
          <nav className="flex gap-1 mt-3 overflow-x-auto">
            {allTabs.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMachineChange(m.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  currentView === m.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                <span className="mr-1.5">{m.icon}</span>
                {m.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 md:w-[65%] p-3">
          <MachineViewer
            machineType={machineType as MachineType}
            selectedPart={selectedPart}
            onPartClick={setSelectedPart}
            isAnimating={isAnimating}
            animationSpeed={animationSpeed}
            isExploded={isExploded}
            showLabels={showLabels}
            customModelUrl={customModelUrl}
          />
        </div>

        {currentView !== 'custom' && (
          <div className="md:w-[35%] border-t md:border-t-0 md:border-l border-border bg-card overflow-hidden">
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
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
