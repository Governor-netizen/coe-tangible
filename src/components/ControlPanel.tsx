import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MachineData, generateQuizQuestions, shuffleArray, QuizQuestion } from '@/data/machineData';
import { Play, Square, Layers, BookOpen, Gauge, Zap, Brain, CheckCircle2, XCircle, Tag, GraduationCap } from 'lucide-react';
import { DCMachineTutor } from './DCMachineTutor';

interface ControlPanelProps {
  machine: MachineData;
  selectedPart: string | null;
  isAnimating: boolean;
  setIsAnimating: (v: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (v: number) => void;
  isExploded: boolean;
  setIsExploded: (v: boolean) => void;
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  quizMode: boolean;
  setQuizMode: (v: boolean) => void;
  quizTargetPart: string | null;
  setQuizTargetPart: (v: string | null) => void;
  explodeSpread?: number;
  setExplodeSpread?: (v: number) => void;
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
  showLabels,
  setShowLabels,
  quizMode,
  setQuizMode,
  quizTargetPart,
  setQuizTargetPart,
  explodeSpread = 1,
  setExplodeSpread,
}: ControlPanelProps) {
  const [labParams, setLabParams] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    machine.labParameters.forEach((p) => (defaults[p.id] = p.defaultValue));
    return defaults;
  });

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [quizWrongPart, setQuizWrongPart] = useState<string | null>(null);

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

  // Start quiz
  const startQuiz = useCallback(() => {
    const questions = shuffleArray(generateQuizQuestions(machine));
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizTotal(0);
    setQuizFeedback(null);
    setQuizWrongPart(null);
    setQuizMode(true);
    if (questions.length > 0) {
      setQuizTargetPart(questions[0].targetPartId);
    }
  }, [machine, setQuizMode, setQuizTargetPart]);

  const stopQuiz = useCallback(() => {
    setQuizMode(false);
    setQuizTargetPart(null);
    setQuizFeedback(null);
    setQuizWrongPart(null);
  }, [setQuizMode, setQuizTargetPart]);

  // Track the selectedPart value we've already processed to avoid auto-answering
  const lastProcessedPart = useRef<string | null>(null);

  // Reset processed part when quiz starts or question changes
  useEffect(() => {
    lastProcessedPart.current = selectedPart ?? null;
  }, [quizTargetPart]);

  // Handle quiz answer — only react to genuinely new clicks
  useEffect(() => {
    if (!quizMode || !selectedPart || !quizTargetPart || quizFeedback) return;
    if (selectedPart === lastProcessedPart.current) return;

    lastProcessedPart.current = selectedPart;

    if (selectedPart === quizTargetPart) {
      setQuizFeedback('correct');
      setQuizScore((s) => s + 1);
    } else {
      setQuizFeedback('wrong');
      setQuizWrongPart(selectedPart);
    }
    setQuizTotal((t) => t + 1);
  }, [selectedPart, quizMode, quizTargetPart]);

  const nextQuestion = useCallback(() => {
    const nextIdx = quizIndex + 1;
    if (nextIdx >= quizQuestions.length) {
      const questions = shuffleArray(generateQuizQuestions(machine));
      setQuizQuestions(questions);
      setQuizIndex(0);
      setQuizTargetPart(questions[0]?.targetPartId || null);
    } else {
      setQuizIndex(nextIdx);
      setQuizTargetPart(quizQuestions[nextIdx].targetPartId);
    }
    setQuizFeedback(null);
    setQuizWrongPart(null);
  }, [quizIndex, quizQuestions, machine, setQuizTargetPart]);

  const currentQuestion = quizQuestions[quizIndex];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
      {/* Machine title */}
      <div className="p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <h2 className="text-lg font-serif font-bold" style={{ color: '#1e293b' }}>{machine.name}</h2>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>{machine.description}</p>
        {/* Labels toggle */}
        <div className="flex items-center gap-2 mt-2">
          <Tag className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>Labels</span>
          <Switch checked={showLabels} onCheckedChange={setShowLabels} className="scale-75" />
        </div>
      </div>

      <Tabs defaultValue="parts" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 grid grid-cols-6">
          <TabsTrigger value="parts" className="text-xs gap-1">
            <BookOpen className="w-3 h-3" />
            Parts
          </TabsTrigger>
          <TabsTrigger value="tutor" className="text-xs gap-1">
            <GraduationCap className="w-3 h-3" />
            Tutor
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
          <TabsTrigger value="quiz" className="text-xs gap-1">
            <Brain className="w-3 h-3" />
            Quiz
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Parts Info Tab */}
          <TabsContent value="parts" className="mt-0">
            {currentPart && !quizMode ? (
              <div className="animate-fade-in space-y-4">
                {/* Part name heading */}
                <h3 className="text-xl font-bold" style={{ color: '#1e293b' }}>{currentPart.name}</h3>

                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{currentPart.description}</p>

                {/* Did You Know? card */}
                <div className="rounded-r-xl p-4" style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#1e40af' }}>💡 Did You Know?</p>
                  <p className="text-sm" style={{ color: '#1e40af' }}>{currentPart.function}</p>
                </div>

                {/* Related Concepts */}
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>Related Concepts</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPart.concepts.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Assembly order */}
                <Badge variant="outline" className="w-fit text-xs">
                  Assembly Order: #{currentPart.assemblyOrder}
                </Badge>
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-16">
                <p className="text-4xl mb-4">👆</p>
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>Click any part to learn about it</p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Hover over parts to highlight them</p>
              </div>
            )}
          </TabsContent>

          {/* Operation Tab */}
          <TabsContent value="operation" className="mt-0 space-y-4">
            {/* Toolbar area */}
            <div className="rounded-xl p-3 space-y-3" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium border transition-colors"
                  style={
                    isAnimating
                      ? { background: '#eff6ff', borderColor: '#3b82f6', color: '#2563eb' }
                      : { background: '#fff', borderColor: '#e2e8f0', color: '#475569' }
                  }
                >
                  {isAnimating ? (
                    <><Square className="w-4 h-4" /> Stop</>
                  ) : (
                    <><Play className="w-4 h-4" /> Start</>
                  )}
                </button>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: '#475569' }}>
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
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
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
            <div className="rounded-xl p-3 space-y-3" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsExploded(!isExploded)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium border transition-colors"
                  style={
                    isExploded
                      ? { background: '#eff6ff', borderColor: '#3b82f6', color: '#2563eb' }
                      : { background: '#fff', borderColor: '#e2e8f0', color: '#475569' }
                  }
                >
                  <Layers className="w-4 h-4" />
                  {isExploded ? 'Collapse' : 'Explode'}
                </button>
              </div>

              {/* Explode spread slider - only when exploded */}
              {isExploded && setExplodeSpread && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium" style={{ color: '#475569' }}>Spread</span>
                    <span className="font-mono text-sm" style={{ color: '#2563eb' }}>{explodeSpread.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={explodeSpread}
                    onChange={(e) => setExplodeSpread(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              )}
            </div>

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

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="mt-0 space-y-4">
            {!quizMode ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Assessment Mode
                  </CardTitle>
                  <CardDescription>
                    Test your knowledge! Identify machine parts by clicking on them in the 3D view.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={startQuiz} className="w-full">
                    <Brain className="w-4 h-4" /> Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Score</span>
                      <span className="text-lg font-mono font-bold text-primary">
                        {quizScore} / {quizTotal}
                      </span>
                    </div>
                    {quizTotal > 0 && (
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(quizScore / quizTotal) * 100}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current question */}
                {currentQuestion && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Find this part:</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-base font-bold text-primary">{currentQuestion.targetPartName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{currentQuestion.hint}</p>
                      </div>

                      {quizFeedback === 'correct' && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Correct! 🎉</span>
                        </div>
                      )}

                      {quizFeedback === 'wrong' && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-1">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-red-700">
                              Wrong! You clicked: {machine.parts.find((p) => p.id === quizWrongPart)?.name}
                            </span>
                          </div>
                          <p className="text-xs text-red-600">Try to find the correct part next time.</p>
                        </div>
                      )}

                      {quizFeedback && (
                        <Button onClick={nextQuestion} className="w-full" variant="outline">
                          Next Question →
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button onClick={stopQuiz} variant="ghost" className="w-full text-muted-foreground">
                  End Quiz
                </Button>
              </>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
