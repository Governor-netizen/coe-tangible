import { useState, useRef } from 'react';
import { MachineViewer } from '@/components/MachineViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { MachineType, machineDatabase, machineList } from '@/data/machineData';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

const Index = () => {
  const [machineType, setMachineType] = useState<MachineType>('dc-motor');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isExploded, setIsExploded] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizTargetPart, setQuizTargetPart] = useState<string | null>(null);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const machine = machineDatabase[machineType] || machineDatabase['dc-motor'];

  const handleMachineChange = (id: MachineType) => {
    setMachineType(id);
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
    setMachineType('custom');
    setSelectedPart(null);
    setIsAnimating(false);
    setIsExploded(false);
  };

  const allTabs = [
    ...machineList,
    ...(customModelUrl ? [{ id: 'custom' as MachineType, name: 'Custom Model', icon: '📦' }] : []),
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-serif font-bold text-foreground tracking-tight">
              ⚡ Machine Explorer
            </h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Interactive 3D Learning Platform
            </span>
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
                machineType === m.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className="mr-1.5">{m.icon}</span>
              {m.name}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 md:w-[65%] p-3">
          <MachineViewer
            machineType={machineType}
            selectedPart={selectedPart}
            onPartClick={setSelectedPart}
            isAnimating={isAnimating}
            animationSpeed={animationSpeed}
            isExploded={isExploded}
            showLabels={showLabels}
            customModelUrl={customModelUrl}
          />
        </div>

        {machineType !== 'custom' && (
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
