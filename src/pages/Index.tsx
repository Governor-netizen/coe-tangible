import { useState } from 'react';
import { MachineViewer } from '@/components/MachineViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { MachineType, machineDatabase, machineList } from '@/data/machineData';
import { cn } from '@/lib/utils';

const Index = () => {
  const [machineType, setMachineType] = useState<MachineType>('dc-motor');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isExploded, setIsExploded] = useState(false);

  const machine = machineDatabase[machineType];

  const handleMachineChange = (id: MachineType) => {
    setMachineType(id);
    setSelectedPart(null);
    setIsAnimating(false);
    setIsExploded(false);
    setAnimationSpeed(1);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation */}
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
        </div>
        {/* Machine tabs */}
        <nav className="flex gap-1 mt-3 overflow-x-auto">
          {machineList.map((m) => (
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

      {/* Split View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 3D Viewer */}
        <div className="flex-1 md:w-[65%] p-3">
          <MachineViewer
            machineType={machineType}
            selectedPart={selectedPart}
            onPartClick={setSelectedPart}
            isAnimating={isAnimating}
            animationSpeed={animationSpeed}
            isExploded={isExploded}
          />
        </div>

        {/* Control Panel */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
