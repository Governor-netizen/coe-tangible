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
  const tabTriggerClass =
    "text-[11px] gap-1.5 flex items-center justify-center font-label tracking-widest uppercase text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/80 data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=active]:shadow-none rounded";

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-container text-on-surface">
      {/* Machine title */}
      <div className="p-4 border-b border-outline-variant/30">
        <h2 className="text-lg font-serif font-bold text-on-surface">{machine.name}</h2>
        <p className="text-sm mt-1 text-on-surface-variant">{machine.description}</p>
        {/* Labels toggle */}
        <div className="flex items-center gap-2 mt-2">
          <Tag className="w-3.5 h-3.5 text-on-surface-variant" />
          <span className="text-xs text-on-surface-variant font-label tracking-wider uppercase">Labels</span>
          <Switch checked={showLabels} onCheckedChange={setShowLabels} className="scale-75" />
        </div>
      </div>

      <Tabs defaultValue="parts" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 mb-1 grid grid-cols-3 grid-rows-2 md:grid-cols-6 md:grid-rows-1 h-auto bg-surface-container-low border border-outline-variant/20 p-1 gap-1 rounded-none">
          <TabsTrigger value="parts" className={tabTriggerClass}>
            <BookOpen className="w-3.5 h-3.5" />
            Parts
          </TabsTrigger>
          <TabsTrigger value="tutor" className={tabTriggerClass}>
            <GraduationCap className="w-3.5 h-3.5" />
            Tutor
          </TabsTrigger>
          <TabsTrigger value="operation" className={tabTriggerClass}>
            <Zap className="w-3.5 h-3.5" />
            Operate
          </TabsTrigger>
          <TabsTrigger value="lab" className={tabTriggerClass}>
            <Gauge className="w-3.5 h-3.5" />
            Lab
          </TabsTrigger>
          <TabsTrigger value="exploded" className={tabTriggerClass}>
            <Layers className="w-3.5 h-3.5" />
            Explode
          </TabsTrigger>
          <TabsTrigger value="quiz" className={tabTriggerClass}>
            <Brain className="w-3.5 h-3.5" />
            Quiz
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 bg-surface-container">
          {/* Parts Info Tab */}
          <TabsContent value="parts" className="mt-0">
            {currentPart && !quizMode ? (
              <div className="animate-fade-in space-y-4">
                {/* Part name heading */}
                <h3 className="text-xl font-bold text-on-surface">{currentPart.name}</h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-on-surface-variant">{currentPart.description}</p>

                {/* Did You Know? card */}
                <div className="rounded-r-xl p-4 bg-surface-container-high border-l-4 border-primary-container">
                  <p className="text-xs font-bold mb-1 text-primary font-label tracking-wider uppercase">Did You Know?</p>
                  <p className="text-sm text-on-surface">{currentPart.function}</p>
                </div>

                {/* Related Concepts */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-on-surface">Related Concepts</h4>
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
                <p className="text-sm font-medium text-on-surface-variant">Click any part to learn about it</p>
                <p className="text-xs mt-1 text-outline">Hover over parts to highlight them</p>
              </div>
            )}
          </TabsContent>

          {/* Tutor Tab */}
          <TabsContent value="tutor" className="mt-0">
            <DCMachineTutor />
          </TabsContent>


          <TabsContent value="operation" className="mt-0 space-y-4">
            {/* Toolbar area */}
            <div className="rounded p-3 space-y-3 bg-surface-container-low border border-outline-variant/20">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded px-3 py-2 text-xs font-label tracking-wider uppercase border transition-all ${
                    isAnimating
                      ? "bg-primary-container border-primary text-on-primary-container"
                      : "bg-surface-container border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {isAnimating ? (
                    <><Square className="w-4 h-4" /> Stop</>
                  ) : (
                    <><Play className="w-4 h-4" /> Start</>
                  )}
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">
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

            <Card className="bg-surface-container-low border-outline-variant/25">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-on-surface">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {machine.operationDescription}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Virtual Lab Tab */}
          <TabsContent value="lab" className="mt-0 space-y-4">
            <Card className="bg-surface-container-low border-outline-variant/25">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-on-surface">Parameters</CardTitle>
                <CardDescription className="text-on-surface-variant">Adjust values and see real-time results</CardDescription>
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

            <Card className="bg-surface-container-low border-outline-variant/25">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-on-surface">Output Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {labOutputs.map((out) => (
                    <div
                      key={out.id}
                      className="flex items-center justify-between p-3 rounded border border-outline-variant/20 bg-surface-container"
                    >
                      <span className="text-sm font-medium text-on-surface">{out.name}</span>
                      <span className="text-lg font-mono font-bold text-primary">
                        {out.value} <span className="text-xs text-on-surface-variant">{out.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-container-low border-outline-variant/25">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-on-surface">Formulas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {machine.formulas.map((f) => (
                  <div key={f.name} className="p-3 rounded border border-outline-variant/20 bg-surface-container">
                    <p className="text-xs font-semibold text-on-surface mb-1">{f.name}</p>
                    <p className="formula-text text-base text-primary">{f.formula}</p>
                    <div className="mt-2 space-y-0.5">
                      {f.variables.map((v) => (
                        <p key={v.symbol} className="text-xs text-on-surface-variant">
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
            <div className="rounded p-3 space-y-3 bg-surface-container-low border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsExploded(!isExploded)}
                  className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-label tracking-wider uppercase border transition-all ${
                    isExploded
                      ? "bg-primary-container border-primary text-on-primary-container"
                      : "bg-surface-container border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {isExploded ? 'Collapse' : 'Explode'}
                </button>
              </div>

              {/* Explode spread slider - only when exploded */}
              {isExploded && setExplodeSpread && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-on-surface-variant">Spread</span>
                    <span className="font-mono text-sm text-primary">{explodeSpread.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={explodeSpread}
                    onChange={(e) => setExplodeSpread(parseFloat(e.target.value))}
                    className="w-full accent-primary-container"
                  />
                </div>
              )}
            </div>

            <Card className="bg-surface-container-low border-outline-variant/25">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-on-surface">Assembly Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...machine.parts]
                    .sort((a, b) => a.assemblyOrder - b.assemblyOrder)
                    .map((part) => (
                      <div
                        key={part.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-surface-container-high transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {part.assemblyOrder}
                        </span>
                        <div
                          className="w-3 h-3 rounded-full border border-outline-variant"
                          style={{ backgroundColor: part.color }}
                        />
                        <span className="text-sm text-on-surface">{part.name}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="mt-0 space-y-4">
            {!quizMode ? (
              <Card className="bg-surface-container-low border-outline-variant/25">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-on-surface flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Assessment Mode
                  </CardTitle>
                  <CardDescription className="text-on-surface-variant">
                    Test your knowledge! Identify machine parts by clicking on them in the 3D view.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={startQuiz} className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                    <Brain className="w-4 h-4" /> Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score */}
                <Card className="bg-surface-container-low border-outline-variant/25">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface">Score</span>
                      <span className="text-lg font-mono font-bold text-primary">
                        {quizScore} / {quizTotal}
                      </span>
                    </div>
                    {quizTotal > 0 && (
                      <div className="w-full bg-surface-container-high rounded-full h-2 mt-2">
                        <div
                          className="bg-primary-container h-2 rounded-full transition-all"
                          style={{ width: `${(quizScore / quizTotal) * 100}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current question */}
                {currentQuestion && (
                  <Card className="bg-surface-container-low border-outline-variant/25">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-on-surface">Find this part:</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded bg-surface-container-high border border-primary/20">
                        <p className="text-base font-bold text-primary">{currentQuestion.targetPartName}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{currentQuestion.hint}</p>
                      </div>

                      {quizFeedback === 'correct' && (
                        <div className="flex items-center gap-2 p-3 rounded border border-tertiary/30 bg-tertiary-container/25">
                          <CheckCircle2 className="w-5 h-5 text-tertiary-fixed" />
                          <span className="text-sm font-medium text-tertiary-fixed">Correct! 🎉</span>
                        </div>
                      )}

                      {quizFeedback === 'wrong' && (
                        <div className="p-3 rounded border border-error/40 bg-error-container/30 space-y-1">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-error" />
                            <span className="text-sm font-medium text-error">
                              Wrong! You clicked: {machine.parts.find((p) => p.id === quizWrongPart)?.name}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant">Try to find the correct part next time.</p>
                        </div>
                      )}

                      {quizFeedback && (
                        <Button onClick={nextQuestion} className="w-full border-outline-variant/40 bg-surface-container text-on-surface hover:bg-surface-container-high" variant="outline">
                          Next Question →
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button onClick={stopQuiz} variant="ghost" className="w-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high">
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
