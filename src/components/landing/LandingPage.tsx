import { useRef, useState, lazy, Suspense } from 'react';
import { ArrowRight, Upload, CheckCircle, Package, Eye, PenLine } from 'lucide-react';

const HeroDCMotor = lazy(() => import('./HeroDCMotor').then(m => ({ default: m.HeroDCMotor })));
import logo from '@/assets/logo.jpeg';
import dcMotorIcon from '@/assets/icons/dc-motor.jpeg';
import dcGeneratorIcon from '@/assets/icons/dc-generator.jpeg';
import transformerIcon from '@/assets/icons/transformer.jpeg';
import inductionMotorIcon from '@/assets/icons/induction-motor.jpeg';
import { MachineType, machineList } from '@/data/machineData';

const machineIcons: Record<string, string> = {
  'dc-motor': dcMotorIcon,
  'dc-generator': dcGeneratorIcon,
  'transformer': transformerIcon,
  'induction-motor': inductionMotorIcon,
};

interface LandingPageProps {
  onMachineSelect: (id: MachineType) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NAV_LINKS = ['Machines', 'Systems', 'Courses', 'Research', 'About'];

const MODEL_CARDS = [
  {
    tag: 'DC_MACHINES',
    tagNew: true,
    title: 'Shunt-Wound DC Generator',
    desc: 'Exploration of voltage-current characteristics under varying load conditions with interactive field rheostat.',
    machineId: 'dc-generator' as MachineType,
  },
  {
    tag: 'TRANSFORMERS',
    title: 'Single-Phase Core Type',
    desc: 'Visualize magnetic flux distribution and eddy current losses across high-fidelity laminated core sections.',
    machineId: 'transformer' as MachineType,
  },
  {
    tag: 'CONTROL_SYSTEMS',
    title: 'Inverted Pendulum',
    desc: 'Adjust PID parameters in real-time and observe the response of a classic balancing control algorithm.',
    machineId: 'induction-motor' as MachineType,
  },
];

const STEPS = [
  { icon: Package, num: 'STEP_01', title: 'Browse Library', desc: 'Select from hundreds of machines mapped to university curricula.' },
  { icon: Eye, num: 'STEP_02', title: 'Open 3D', desc: 'Manipulate models in real-time. Toggle exploded views and animations.' },
  { icon: PenLine, num: 'STEP_03', title: 'Annotate & Study', desc: 'Layer technical data and equations directly over the active 3D components.' },
];

const STATS = [
  { value: '150+', label: 'Interactive Models' },
  { value: '24', label: 'African Partner Unis' },
  { value: '98%', label: 'Retention Improvement' },
  { value: '0.5s', label: 'Latency Rendering' },
];

const PART_TABS = ['STATOR', 'ARMATURE', 'Commutator', 'Brushes'];

export function LandingPage({ onMachineSelect, onFileUpload }: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePart, setActivePart] = useState(0);
  const [activeContentTab, setActiveContentTab] = useState(0);
  const contentTabs = ['OVERVIEW', 'WORKING PRINCIPLE', 'EQUATIONS', '3D VIEW'];

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1a', color: '#e2e8f0' }}>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".glb,.gltf" onChange={onFileUpload} className="hidden" />

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: '#0a0f1aee', borderColor: '#1e293b', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Tangible" className="w-7 h-7 rounded" />
            <span className="font-serif font-bold text-lg tracking-tight text-white">Tangible</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <button key={l} className="font-mono-tech text-xs tracking-wider uppercase transition-colors" style={{ color: '#94a3b8' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >{l}</button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden sm:block font-mono-tech text-xs tracking-wider" style={{ color: '#94a3b8' }}>Sign In</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors" style={{ background: '#2563eb', color: '#fff' }}
              onClick={() => onMachineSelect('dc-motor')}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
            >Get Access →</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="blueprint-grid relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1 max-w-xl animate-materialize">
            <p className="font-mono-tech text-xs tracking-[0.3em] mb-5 tech-tag">ENGINEERING · VISUALIZED</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6" style={{ textWrap: 'balance' as any }}>
              Understand <span className="italic">Machines</span> Through Motion.
            </h1>
            <p className="text-base sm:text-lg mb-8 leading-relaxed" style={{ color: '#94a3b8' }}>
              Interactive 3D models for DC machines, transformers, control systems, and more — designed for deep technical learning and spatial intuition.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onMachineSelect('dc-motor')} className="px-5 py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.97]" style={{ background: '#2563eb', color: '#fff' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
              >→ Explore the Library</button>
              <button onClick={() => onMachineSelect('dc-motor')} className="px-5 py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.97]" style={{ border: '1px solid #1e293b', color: '#94a3b8' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; }}
              >View Featured: DC Motor Series ↗</button>
            </div>
          </div>

          {/* Right – placeholder for 3D animation */}
          <div className="flex-1 relative w-full min-h-[320px] md:min-h-[400px] rounded-xl" style={{ background: '#111827', border: '1px solid #1e293b' }}>
            {/* Floating tech labels */}
            <div className="absolute top-4 left-4 font-mono-tech text-[10px] animate-float" style={{ color: '#4DFFB4', animationDelay: '0s' }}>
              <span style={{ color: '#334155' }}>●</span> SYSTEM_STABLE: 104.2Hz
            </div>
            <div className="absolute top-4 right-4 font-mono-tech text-[10px] text-right animate-float" style={{ color: '#64748b', animationDelay: '1s' }}>
              DC_MOTOR_MODEL_A1
            </div>
            <div className="absolute bottom-4 left-4 font-mono-tech text-[10px] animate-float" style={{ color: '#64748b', animationDelay: '2s' }}>
              FIELD_WINDING: NOMINAL
            </div>
            <div className="absolute bottom-4 right-4 font-mono-tech text-[10px] animate-float" style={{ color: '#4DFFB4', animationDelay: '0.5s' }}>
              VOLTAGE: 220V
            </div>
            {/* Center placeholder text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-mono-tech text-xs" style={{ color: '#334155' }}>3D ANIMATION PLACEHOLDER</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENTLY PUBLISHED MODELS ── */}
      <section className="py-16 md:py-24" style={{ borderTop: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-10">Recently Published Models</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODEL_CARDS.map((card) => (
              <div key={card.machineId} className="rounded-xl p-5 transition-all duration-300 group cursor-pointer"
                style={{ background: '#111827', border: '1px solid #1e293b' }}
                onClick={() => onMachineSelect(card.machineId)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#334155')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
              >
                {/* Image */}
                <div className="w-full h-36 rounded-lg mb-4 flex items-center justify-center overflow-hidden" style={{ background: '#0a0f1a' }}>
                  <img src={machineIcons[card.machineId] || ''} alt={card.title} className="w-20 h-20 object-contain rounded-lg" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {card.tagNew && <span className="font-mono-tech text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#2563eb', color: '#fff' }}>NEW</span>}
                  <span className="font-mono-tech text-[10px] tracking-wider tech-tag">{card.tag}</span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>{card.desc}</p>
                <button className="font-mono-tech text-xs tracking-wider flex items-center gap-1 transition-colors" style={{ color: '#94a3b8' }}>
                  OPEN MODEL <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── A SCIENTIFIC WORKFLOW ── */}
      <section className="py-16 md:py-24" style={{ borderTop: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-12">A Scientific Workflow</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#111827', border: '1px solid #1e293b' }}>
                  <step.icon className="w-5 h-5" style={{ color: '#4DFFB4' }} />
                </div>
                <span className="font-mono-tech text-[10px] tracking-wider tech-tag">{step.num}</span>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FROM LECTURE TO SPATIAL UNDERSTANDING ── */}
      <section className="py-16 md:py-24" style={{ borderTop: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="flex-1">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">
                From lecture to<br /><span className="italic">spatial understanding.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748b' }}>
                Every model is mapped to specific course weeks, ensuring that visual aids are perfectly synced with the theoretical concepts being taught in the classroom.
              </p>
              <button className="px-5 py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.97]" style={{ border: '1px solid #1e293b', color: '#94a3b8' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; }}
              >View Course Mapping →</button>
            </div>
            <div className="flex-1 w-full min-h-[220px] rounded-xl relative" style={{ background: '#111827', border: '1px solid #1e293b' }}>
              <div className="absolute top-3 left-3 font-mono-tech text-[10px]" style={{ color: '#334155' }}>MODEL_REF: DC_SERIES_V1</div>
              <div className="absolute bottom-3 right-3 rounded px-2 py-1 font-mono-tech text-[10px]" style={{ background: '#4DFFB4', color: '#0a0f1a' }}>SYLLABUS_MAP</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-mono-tech text-sm font-medium" style={{ color: '#64748b' }}>EE304: Electrical Machines I</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl p-5 text-center" style={{ background: '#111827', border: '1px solid #1e293b' }}>
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="font-mono-tech text-[10px] tracking-wider" style={{ color: '#64748b' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DEEP DIVE ── */}
      <section className="py-16 md:py-24" style={{ borderTop: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="font-mono-tech text-[10px] tracking-wider mb-3 tech-tag">FEATURED_DEEP_DIVE</p>
          <div className="flex flex-col md:flex-row gap-8 rounded-xl p-6 md:p-8" style={{ background: '#111827', border: '1px solid #1e293b' }}>
            {/* Left – image placeholder */}
            <div className="flex-1 min-h-[240px] rounded-lg relative" style={{ background: '#0a0f1a', border: '1px solid #1e293b' }}>
              <img src={machineIcons['dc-motor']} alt="DC Motor" className="absolute inset-0 m-auto w-28 h-28 object-contain rounded-lg" />
              {/* Part tabs */}
              <div className="absolute bottom-0 left-0 right-0 flex">
                {PART_TABS.map((pt, i) => (
                  <button key={pt} onClick={() => setActivePart(i)}
                    className="flex-1 py-2 font-mono-tech text-[10px] tracking-wider text-center transition-colors"
                    style={i === activePart ? { background: '#1e293b', color: '#4DFFB4' } : { color: '#475569' }}
                  >{pt}</button>
                ))}
              </div>
            </div>

            {/* Right – content */}
            <div className="flex-1">
              {/* Content tabs */}
              <div className="flex gap-1 mb-5 flex-wrap">
                {contentTabs.map((t, i) => (
                  <button key={t} onClick={() => setActiveContentTab(i)}
                    className="px-3 py-1.5 rounded text-[11px] font-mono-tech tracking-wider transition-colors"
                    style={i === activeContentTab ? { background: '#1e293b', color: '#e2e8f0' } : { color: '#475569' }}
                  >{t}</button>
                ))}
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">The Series DC Motor</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>
                Commonly used in applications requiring high starting torque, such as electric locomotives and cranes. In a series-wound motor, the field winding is connected in series with the armature winding.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#4DFFB4' }} />
                  <span className="text-sm" style={{ color: '#94a3b8' }}>High starting torque at low speeds.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#4DFFB4' }} />
                  <span className="text-sm" style={{ color: '#94a3b8' }}>Self-governing magnetic flux based on load current.</span>
                </div>
              </div>
              <button onClick={() => onMachineSelect('dc-motor')} className="font-mono-tech text-xs tracking-wider flex items-center gap-1 transition-colors" style={{ color: '#2563eb' }}>
                Open Full 3D Model <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12" style={{ borderTop: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Tangible" className="w-6 h-6 rounded" />
              <span className="font-serif font-bold text-white">Tangible</span>
            </div>
            <p className="text-xs" style={{ color: '#475569' }}>Built for engineering education in Africa</p>
            <div className="flex gap-4 font-mono-tech text-[10px] tracking-wider" style={{ color: '#475569' }}>
              {['ResearchGate', 'GitHub', 'LinkedIn', 'Privacy', 'Terms'].map((l) => (
                <button key={l} className="transition-colors hover:text-white/70">{l}</button>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="font-mono-tech text-[10px] tracking-wider" style={{ color: '#334155' }}>© 2026 TANGIBLE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
