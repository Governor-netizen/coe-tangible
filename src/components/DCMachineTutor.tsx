import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Zap, RotateCw, GitBranch, ArrowDown, ArrowRight } from 'lucide-react';

interface TutorParams {
  voltage: number;
  load: number;
  speed: number;
}

const OPERATION_STEPS = [
  {
    title: '1. Energising the Field Winding',
    part: 'stator',
    icon: '🧲',
    content:
      'DC current flows through the field winding wrapped around the stator poles, creating a strong, steady magnetic field (flux Φ) across the air gap.',
    analogy: 'Think of the field winding as a permanent magnet you can "tune" — more current → stronger pull.',
  },
  {
    title: '2. Current Enters the Armature',
    part: 'windings',
    icon: '⚡',
    content:
      'Supply voltage pushes current through the brushes → commutator → armature conductors. Each conductor sitting in the magnetic field experiences a force (Lorentz force: F = BIL).',
    analogy: 'Like water entering a turbine through a pipe — the brushes are the pipe inlet.',
  },
  {
    title: '3. Torque Production',
    part: 'rotor',
    icon: '🔄',
    content:
      'Forces on opposite sides of each coil act in opposite directions, creating a turning torque on the rotor: T = k · Φ · Iₐ. The rotor begins to spin.',
    analogy: 'Imagine pushing a playground roundabout from two sides at once — the forces cooperate to spin it.',
  },
  {
    title: '4. The Commutator Switches Current',
    part: 'commutator',
    icon: '🔀',
    content:
      'As the rotor turns, each coil passes through the neutral axis. At that instant the commutator segment slides from one brush to the other, reversing current direction so the torque always acts the same way.',
    analogy: 'The commutator is like a traffic roundabout that keeps every car going clockwise — no matter which road they came from.',
  },
  {
    title: '5. Brushes Maintain Contact',
    part: 'brushes',
    icon: '🖌️',
    content:
      'Carbon brushes press against the spinning commutator with spring force, providing a sliding electrical contact. They wear slowly and are designed to be replaced.',
    analogy: 'Like a record-player needle sliding along grooves — it must stay in contact to keep the music (current) flowing.',
  },
  {
    title: '6. The Shaft Delivers Mechanical Power',
    part: 'shaft',
    icon: '⚙️',
    content:
      'The shaft transmits the rotor torque to the external load (pump, fan, conveyor …). Output power P = T × ω. Back-EMF builds up as speed increases: E = k · Φ · N.',
    analogy: 'The shaft is the "delivery truck" carrying rotational energy from the motor to wherever it\'s needed.',
  },
];

const PARALLEL_PATHS_CONTENT = {
  definition:
    'In a DC armature, conductors are arranged in closed loops. These loops form multiple parallel electrical paths between the positive and negative brushes. The total armature current Iₐ splits equally among all parallel paths.',
  lapWinding: {
    title: 'Lap Winding',
    paths: 'A = P (number of poles)',
    description:
      'Each coil connects to adjacent commutator segments. The number of parallel paths equals the number of poles. This gives high current capacity but lower voltage per path.',
    bestFor: 'High-current, low-voltage machines (e.g. starter motors, electroplating).',
    example: 'A 4-pole lap-wound machine → 4 parallel paths. If Iₐ = 40 A, each path carries 10 A.',
  },
  waveWinding: {
    title: 'Wave Winding',
    paths: 'A = 2 (always)',
    description:
      'Each coil connects to a commutator segment roughly two pole-pitches away, "waving" around the armature. Only 2 parallel paths exist regardless of the number of poles.',
    bestFor: 'High-voltage, low-current machines (e.g. railway traction motors).',
    example: 'A 4-pole wave-wound machine → still only 2 parallel paths. If Iₐ = 40 A, each path carries 20 A.',
  },
  formula: 'Current per path = Iₐ / A',
  impact: [
    'More parallel paths → each path carries less current → thinner wire can be used',
    'Fewer parallel paths → higher voltage per path → better for high-voltage applications',
    'Lap winding requires equalizer connections to balance currents',
    'Wave winding is self-equalizing and needs fewer brushes (minimum 2)',
  ],
};

export function DCMachineTutor() {
  const [stepIndex, setStepIndex] = useState(0);
  const [params, setParams] = useState<TutorParams>({ voltage: 220, load: 50, speed: 1500 });
  const [windingTab, setWindingTab] = useState<'lap' | 'wave'>('lap');
  const [poles, setPoles] = useState(4);

  const step = OPERATION_STEPS[stepIndex];

  // Derived values based on user sliders
  const derived = useMemo(() => {
    const Ra = 0.5; // armature resistance
    const kPhi = 0.12; // k·Φ constant
    const backEmf = kPhi * params.speed;
    const armatureCurrent = (params.voltage - backEmf) / Ra;
    const torque = kPhi * Math.max(armatureCurrent, 0);
    const powerOut = torque * (params.speed * (2 * Math.PI) / 60);
    const lapPaths = poles;
    const wavePaths = 2;
    const currentPerPathLap = Math.max(armatureCurrent, 0) / lapPaths;
    const currentPerPathWave = Math.max(armatureCurrent, 0) / wavePaths;

    return {
      backEmf: Math.max(backEmf, 0).toFixed(1),
      armatureCurrent: Math.max(armatureCurrent, 0).toFixed(1),
      torque: Math.max(torque, 0).toFixed(2),
      powerOut: Math.max(powerOut, 0).toFixed(0),
      lapPaths,
      wavePaths,
      currentPerPathLap: currentPerPathLap.toFixed(1),
      currentPerPathWave: currentPerPathWave.toFixed(1),
    };
  }, [params, poles]);

  return (
    <div className="space-y-4">
      {/* Step-by-step operation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-primary" />
              How a DC Motor Works
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Step {stepIndex + 1}/{OPERATION_STEPS.length}
            </Badge>
          </div>
          <CardDescription>Click through each step — the relevant part is highlighted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg p-3" style={{ background: 'hsl(var(--muted))' }}>
            <p className="text-sm font-semibold flex items-center gap-2 mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              <span className="text-lg">{step.icon}</span> {step.title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {step.content}
            </p>
          </div>
          <div className="rounded-r-lg p-3" style={{ background: 'hsl(var(--accent))', borderLeft: '3px solid hsl(var(--primary))' }}>
            <p className="text-xs font-bold mb-0.5" style={{ color: 'hsl(var(--primary))' }}>💡 Analogy</p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{step.analogy}</p>
          </div>
          <Badge variant="secondary" className="text-xs">Part: {step.part}</Badge>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((i) => i - 1)}
              className="flex-1"
            >
              <ChevronLeft className="w-3 h-3 mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              disabled={stepIndex === OPERATION_STEPS.length - 1}
              onClick={() => setStepIndex((i) => i + 1)}
              className="flex-1"
            >
              Next <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive parameter adjustment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Interactive Simulation
          </CardTitle>
          <CardDescription>Change voltage, load & speed to see real-time effects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Supply Voltage</span>
                <span className="font-mono text-primary">{params.voltage} V</span>
              </div>
              <Slider value={[params.voltage]} onValueChange={([v]) => setParams((p) => ({ ...p, voltage: v }))} min={50} max={400} step={5} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Load Torque (%)</span>
                <span className="font-mono text-primary">{params.load}%</span>
              </div>
              <Slider value={[params.load]} onValueChange={([v]) => setParams((p) => ({ ...p, load: v }))} min={0} max={100} step={5} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Speed</span>
                <span className="font-mono text-primary">{params.speed} RPM</span>
              </div>
              <Slider value={[params.speed]} onValueChange={([v]) => setParams((p) => ({ ...p, speed: v }))} min={100} max={3000} step={50} />
            </div>
          </div>

          {/* Derived outputs */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Back-EMF', value: `${derived.backEmf} V`, desc: 'E = kΦN' },
              { label: 'Armature Current', value: `${derived.armatureCurrent} A`, desc: 'Iₐ = (V-E)/Rₐ' },
              { label: 'Torque', value: `${derived.torque} N·m`, desc: 'T = kΦIₐ' },
              { label: 'Output Power', value: `${derived.powerOut} W`, desc: 'P = Tω' },
            ].map((o) => (
              <div key={o.label} className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground">{o.desc}</p>
                <p className="text-xs font-medium text-foreground">{o.label}</p>
                <p className="text-base font-mono font-bold text-primary">{o.value}</p>
              </div>
            ))}
          </div>

          {/* Explanation that updates */}
          <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ background: 'hsl(var(--muted))' }}>
            {Number(derived.armatureCurrent) > 200 ? (
              <p className="text-destructive font-semibold">⚠️ Very high armature current! In practice, fuses or circuit breakers would trip. Reduce voltage or increase speed.</p>
            ) : Number(derived.armatureCurrent) < 1 ? (
              <p style={{ color: 'hsl(var(--muted-foreground))' }}>The motor is nearly at no-load. Back-EMF ≈ supply voltage, so very little current flows and torque is minimal.</p>
            ) : (
              <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                At {params.voltage} V and {params.speed} RPM, the back-EMF is {derived.backEmf} V.
                The remaining {(params.voltage - Number(derived.backEmf)).toFixed(1)} V drives {derived.armatureCurrent} A through the armature resistance,
                producing {derived.torque} N·m of torque.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parallel Paths Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Parallel Paths in the Armature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {PARALLEL_PATHS_CONTENT.definition}
          </p>

          {/* Number of poles selector */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground">Number of Poles (P)</span>
              <span className="font-mono text-primary">{poles}</span>
            </div>
            <Slider value={[poles]} onValueChange={([v]) => setPoles(v)} min={2} max={8} step={2} />
          </div>

          {/* Lap / Wave toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/60">
            {(['lap', 'wave'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setWindingTab(t)}
                className="flex-1 text-xs font-medium py-1.5 rounded-md transition-colors"
                style={
                  windingTab === t
                    ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                    : { color: 'hsl(var(--muted-foreground))' }
                }
              >
                {t === 'lap' ? 'Lap Winding' : 'Wave Winding'}
              </button>
            ))}
          </div>

          {/* Winding detail */}
          {windingTab === 'lap' ? (
            <div className="space-y-2">
              <div className="rounded-lg p-3 bg-muted/50">
                <p className="text-xs font-bold text-foreground mb-1">{PARALLEL_PATHS_CONTENT.lapWinding.title}</p>
                <p className="text-xs text-muted-foreground">{PARALLEL_PATHS_CONTENT.lapWinding.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-xs">A = P = {poles}</Badge>
                <Badge variant="outline" className="text-xs">Iₐ/path = {derived.currentPerPathLap} A</Badge>
              </div>

              {/* Visual: current splitting */}
              <div className="rounded-lg p-3 bg-muted/30">
                <p className="text-[10px] font-semibold text-foreground mb-2">Current Flow Diagram</p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                  <span className="font-mono font-bold text-primary">Iₐ={derived.armatureCurrent}A</span>
                  <ArrowRight className="w-3 h-3" />
                  <div className="flex flex-col items-center gap-0.5">
                    {Array.from({ length: poles }).map((_, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <ArrowDown className="w-2 h-2" />
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 font-mono text-primary">{derived.currentPerPathLap}A</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> {PARALLEL_PATHS_CONTENT.lapWinding.bestFor}
              </p>
              <p className="text-xs italic text-muted-foreground">{PARALLEL_PATHS_CONTENT.lapWinding.example}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-lg p-3 bg-muted/50">
                <p className="text-xs font-bold text-foreground mb-1">{PARALLEL_PATHS_CONTENT.waveWinding.title}</p>
                <p className="text-xs text-muted-foreground">{PARALLEL_PATHS_CONTENT.waveWinding.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-xs">A = 2 (always)</Badge>
                <Badge variant="outline" className="text-xs">Iₐ/path = {derived.currentPerPathWave} A</Badge>
              </div>

              {/* Visual: current splitting */}
              <div className="rounded-lg p-3 bg-muted/30">
                <p className="text-[10px] font-semibold text-foreground mb-2">Current Flow Diagram</p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                  <span className="font-mono font-bold text-primary">Iₐ={derived.armatureCurrent}A</span>
                  <ArrowRight className="w-3 h-3" />
                  <div className="flex flex-col items-center gap-0.5">
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-center gap-1">
                        <ArrowDown className="w-2 h-2" />
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 font-mono text-primary">{derived.currentPerPathWave}A</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> {PARALLEL_PATHS_CONTENT.waveWinding.bestFor}
              </p>
              <p className="text-xs italic text-muted-foreground">{PARALLEL_PATHS_CONTENT.waveWinding.example}</p>
            </div>
          )}

          {/* Key takeaways */}
          <div className="rounded-lg p-3" style={{ borderLeft: '3px solid hsl(var(--primary))', background: 'hsl(var(--accent))' }}>
            <p className="text-xs font-bold mb-1 text-foreground">🔑 Key Takeaways</p>
            <ul className="space-y-1">
              {PARALLEL_PATHS_CONTENT.impact.map((point, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
