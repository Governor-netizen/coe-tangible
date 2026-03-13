import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MachineData, MachinePart } from '@/data/machineData';
import { Play, Square, RotateCcw, Layers, BookOpen, Gauge, Zap } from 'lucide-react';

interface ControlPanelProps {
  machine: MachineData;
  selectedPart: string | null;
  isAnimating: boolean;
  setIsAnimating: (v: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (v: number) => void;
  isExploded: boolean;
  setIsExploded: (v: boolean) => void;
}

export function ControlPanel({
  machine,
  selectedPart,
  isAnimating,
  setIsAnimating,
  animationSpeed,
  setAnimationSpeed,
  isExploded,
  setIsExploded,
}: ControlPanelProps) {
  const [labParams, setLabParams] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    machine.labParameters.forEach((p) => (defaults[p.id] = p.defaultValue));
    return defaults;
  });

  const labOutputs = useMemo(() => {
    return machine.labOutputs.map((out) => ({
      ...out,
      value: out.compute(labParams),
    }));
  }, [labParams, machine.labOutputs]);

  const currentPart = selectedPart
    ? machine.parts.find((p) => p.id === selectedPart)
    : null;

  const updateParam = (id: string, value: number) => {
    setLabParams((prev) => ({ ...prev, [id]: value }));
  };

  // Reset lab params when machine changes
  useMemo(() => {
    const defaults: Record<string, number> = {};
    machine.labParameters.forEach((p) => (defaults[p.id] = p.defaultValue));
    setLabParams(defaults);
  }, [machine.id]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Machine title */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-serif font-bold text-foreground">{machine.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{machine.description}</p>
      </div>

      <Tabs defaultValue="parts" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 grid grid-cols-4">
          <TabsTrigger value="parts" className="text-xs gap-1">
            <BookOpen className="w-3 h-3" />
            Parts
          </TabsTrigger>
          <TabsTrigger value="operation" className="text-xs gap-1">
            <Zap className="w-3 h-3" />
            Operate
          </TabsTrigger>
          <TabsTrigger value="lab" className="text-xs gap-1">
            <Gauge className="w-3 h-3" />
            Lab
          </TabsTrigger>
          <TabsTrigger value="exploded" className="text-xs gap-1">
            <Layers className="w-3 h-3" />
            Explode
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Parts Info Tab */}
          <TabsContent value="parts" className="mt-0">
            {currentPart ? (
              <div className="animate-fade-in space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: currentPart.color }}
                      />
                      <CardTitle className="text-base">{currentPart.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs">
                      Assembly Order: #{currentPart.assemblyOrder}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{currentPart.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Function</h4>
                      <p className="text-sm text-muted-foreground">{currentPart.function}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Related Concepts</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentPart.concepts.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">Click any part of the machine</p>
                <p className="text-xs mt-1">to see its description and function</p>
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Machine Parts:</p>
                  {machine.parts.map((part) => (
                    <div key={part.id} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: part.color }}
                      />
                      <span>{part.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Operation Tab */}
          <TabsContent value="operation" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Animation Control</CardTitle>
                <CardDescription>Watch the machine in operation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="flex-1"
                    variant={isAnimating ? 'destructive' : 'default'}
                  >
                    {isAnimating ? (
                      <>
                        <Square className="w-4 h-4" /> Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Start
                      </>
                    )}
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Speed: {animationSpeed.toFixed(1)}×
                  </label>
                  <Slider
                    value={[animationSpeed]}
                    onValueChange={([v]) => setAnimationSpeed(v)}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {machine.operationDescription}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Virtual Lab Tab */}
          <TabsContent value="lab" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Parameters</CardTitle>
                <CardDescription>Adjust values and see real-time results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {machine.labParameters.map((param) => (
                  <div key={param.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{param.name}</span>
                      <span className="text-primary font-mono">
                        {labParams[param.id]} {param.unit}
                      </span>
                    </div>
                    <Slider
                      value={[labParams[param.id]]}
                      onValueChange={([v]) => updateParam(param.id, v)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Output Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {labOutputs.map((out) => (
                    <div
                      key={out.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium text-foreground">{out.name}</span>
                      <span className="text-lg font-mono font-bold text-primary">
                        {out.value} <span className="text-xs text-muted-foreground">{out.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Formulas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {machine.formulas.map((f) => (
                  <div key={f.name} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold text-foreground mb-1">{f.name}</p>
                    <p className="formula-text text-base text-primary">{f.formula}</p>
                    <div className="mt-2 space-y-0.5">
                      {f.variables.map((v) => (
                        <p key={v.symbol} className="text-xs text-muted-foreground">
                          <span className="font-mono font-medium">{v.symbol}</span> = {v.name}
                          {v.unit && ` (${v.unit})`}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exploded View Tab */}
          <TabsContent value="exploded" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Exploded View</CardTitle>
                <CardDescription>Separate parts to see the internal structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Explode Model</span>
                  <Switch
                    checked={isExploded}
                    onCheckedChange={setIsExploded}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assembly Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...machine.parts]
                    .sort((a, b) => a.assemblyOrder - b.assemblyOrder)
                    .map((part) => (
                      <div
                        key={part.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {part.assemblyOrder}
                        </span>
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: part.color }}
                        />
                        <span className="text-sm text-foreground">{part.name}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
