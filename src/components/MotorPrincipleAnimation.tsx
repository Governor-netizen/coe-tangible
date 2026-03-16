import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Power, X } from 'lucide-react';
import * as THREE from 'three';

/* ───────── shared helpers ───────── */

function Arrow({ from, to, color = '#ef4444', radius = 0.03 }: { from: [number, number, number]; to: [number, number, number]; color?: string; radius?: number }) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  const mid = new THREE.Vector3(...from).add(dir.clone().multiplyScalar(0.5));
  const tip = new THREE.Vector3(...to);
  dir.normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group>
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[radius, radius, len - 0.15, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={tip} quaternion={quat}>
        <coneGeometry args={[radius * 2.5, 0.15, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/* animated dots along a path */
function CurrentDots({ path, count = 6, color = '#facc15', speed = 1 }: { path: THREE.Vector3[]; count?: number; color?: string; speed?: number }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(path, false), [path]);

  useFrame((_, delta) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const ud = mesh.userData as { t: number };
      ud.t = ((ud.t ?? i / count) + delta * speed * 0.3) % 1;
      const pt = curve.getPointAt(ud.t);
      mesh.position.copy(pt);
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) { refs.current[i] = el; el.userData = { t: i / count }; } }}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </>
  );
}

/* concentric field rings around conductor */
function FieldRings({ count = 4, radius = 0.3, y = 0, clockwise = true }: { count?: number; radius?: number; y?: number; clockwise?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * (clockwise ? 0.5 : -0.5);
  });
  return (
    <group ref={groupRef} position={[0, y, 0]}>
      {Array.from({ length: count }).map((_, i) => {
        const r = radius + i * 0.25;
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.012, 8, 48]} />
            <meshStandardMaterial color="#60a5fa" transparent opacity={0.6 - i * 0.1} />
          </mesh>
        );
      })}
      {/* direction indicator */}
      <mesh position={[radius + 0.1, 0, 0]}>
        <coneGeometry args={[0.04, 0.1, 6]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
}

/* N / S pole pieces */
function Poles({ gap = 2.4 }: { gap?: number }) {
  const hw = gap / 2;
  return (
    <>
      <mesh position={[-hw, 0, 0]}>
        <boxGeometry args={[0.6, 1.8, 1.2]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <Html position={[-hw, 1.2, 0]} center><span style={{ color: '#dc2626', fontWeight: 800, fontSize: 18 }}>N</span></Html>
      <mesh position={[hw, 0, 0]}>
        <boxGeometry args={[0.6, 1.8, 1.2]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <Html position={[hw, 1.2, 0]} center><span style={{ color: '#2563eb', fontWeight: 800, fontSize: 18 }}>S</span></Html>
    </>
  );
}

/* horizontal field lines N→S */
function FieldLines({ gap = 2.4, count = 5 }: { gap?: number; count?: number }) {
  const hw = gap / 2;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const y = -0.6 + (1.2 / (count - 1)) * i;
        return (
          <Arrow key={i} from={[-hw + 0.35, y, 0]} to={[hw - 0.35, y, 0]} color="#94a3b8" radius={0.015} />
        );
      })}
    </>
  );
}

/* ───────── Scene 1: Current-carrying conductor ───────── */
function Scene1({ currentOn }: { currentOn: boolean }) {
  const wirePath = useMemo(() => [
    new THREE.Vector3(-1.2, -1.5, 0),
    new THREE.Vector3(-1.2, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.8, 0),
    new THREE.Vector3(1.2, 1.8, 0),
    new THREE.Vector3(1.2, -1.5, 0),
  ], []);

  return (
    <group>
      {/* conductor */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* wire path */}
      {wirePath.slice(0, -1).map((p, i) => {
        const next = wirePath[i + 1];
        const d = next.clone().sub(p);
        const len = d.length();
        const mid = p.clone().add(d.clone().multiplyScalar(0.5));
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.025, 0.025, len, 8]} />
            <meshStandardMaterial color="#a3a3a3" />
          </mesh>
        );
      })}

      {/* battery */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.4]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <Html position={[0, -1.5, 0.25]} center>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>+ V −</span>
      </Html>

      {currentOn && (
        <>
          <CurrentDots path={wirePath} count={8} speed={1.5} />
          <FieldRings count={4} radius={0.3} y={0.3} />
          <FieldRings count={4} radius={0.3} y={-0.3} />
        </>
      )}
    </group>
  );
}

/* ───────── Scene 2: External magnetic field ───────── */
function Scene2() {
  return (
    <group>
      <Poles />
      <FieldLines count={6} />
    </group>
  );
}

/* ───────── Scene 3: Conductor in the field (catapult) ───────── */
function Scene3() {
  return (
    <group>
      <Poles />
      {/* conductor cross-section */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* cross notation (current going in) */}
      <Html position={[0, 0, 0.35]} center>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>⊗</span>
      </Html>

      {/* dense field lines on top */}
      {Array.from({ length: 7 }).map((_, i) => {
        const y = 0.3 + i * 0.1;
        return <Arrow key={`top-${i}`} from={[-0.9, y, 0]} to={[0.9, y, 0]} color="#64748b" radius={0.012} />;
      })}
      {/* sparse field lines on bottom */}
      {[0, 1].map((i) => {
        const y = -0.4 - i * 0.25;
        return <Arrow key={`bot-${i}`} from={[-0.9, y, 0]} to={[0.9, y, 0]} color="#cbd5e1" radius={0.008} />;
      })}

      {/* Force arrow DOWN */}
      <Arrow from={[0, -0.3, 0]} to={[0, -1.3, 0]} color="#dc2626" radius={0.05} />
      <Html position={[0.35, -0.9, 0]} center>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>F = BIL ↓</span>
      </Html>

      {/* labels */}
      <Html position={[0, 1.1, 0]} center>
        <span style={{ fontSize: 11, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>Fields ADD ↑ dense</span>
      </Html>
      <Html position={[0, -1.5, 0]} center>
        <span style={{ fontSize: 11, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>Fields CANCEL ↓ sparse</span>
      </Html>
    </group>
  );
}

/* ───────── Scene 4: Both sides of the coil ───────── */
function Scene4() {
  return (
    <group>
      <Poles gap={3} />

      {/* left conductor (current in ⊗) */}
      <mesh position={[-0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} />
      </mesh>
      <Html position={[-0.5, 0, 0.32]} center><span style={{ fontSize: 20, fontWeight: 900 }}>⊗</span></Html>
      <Arrow from={[-0.5, -0.2, 0]} to={[-0.5, -1.2, 0]} color="#dc2626" radius={0.04} />
      <Html position={[-0.15, -0.8, 0]} center><span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>F ↓</span></Html>

      {/* right conductor (current out ⊙) */}
      <mesh position={[0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} />
      </mesh>
      <Html position={[0.5, 0, 0.32]} center><span style={{ fontSize: 20, fontWeight: 900 }}>⊙</span></Html>
      <Arrow from={[0.5, 0.2, 0]} to={[0.5, 1.2, 0]} color="#16a34a" radius={0.04} />
      <Html position={[0.85, 0.8, 0]} center><span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>F ↑</span></Html>

      {/* connecting bar top */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.06]} />
        <meshStandardMaterial color="#a3a3a3" />
      </mesh>
      {/* connecting bar bottom */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.06]} />
        <meshStandardMaterial color="#a3a3a3" />
      </mesh>

      {/* torque arc hint */}
      <Html position={[0, -1.6, 0]} center>
        <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>⟳ Net Torque = Clockwise rotation</span>
      </Html>

      <FieldLines gap={3} count={5} />
    </group>
  );
}

/* ───────── Scene 5: Rotating coil with commutator ───────── */
function RotatingCoil() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 1.2;
  });

  return (
    <group ref={groupRef}>
      {/* coil sides */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} />
        </mesh>
      ))}
      {/* top and bottom bars */}
      {[-0.4, 0.4].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.0, 0.06, 0.06]} />
          <meshStandardMaterial color="#d4d4d4" />
        </mesh>
      ))}
      {/* commutator segments */}
      <mesh position={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#b45309" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.5]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#92400e" metalness={0.7} />
      </mesh>
    </group>
  );
}

function Scene5() {
  return (
    <group>
      <Poles gap={3} />

      {/* shaft */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.5, 12]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} />
      </mesh>

      <RotatingCoil />

      {/* brushes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, 0.5 + s * 0.0001]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.35, 0.08, 0.08]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}
      <Html position={[0, -0.35, 0.6]} center>
        <span style={{ fontSize: 10, color: '#6b7280' }}>Brushes</span>
      </Html>

      <FieldLines gap={3} count={4} />
    </group>
  );
}

/* ───────── scene metadata ───────── */
const SCENES = [
  {
    title: 'Scene 1: Current-Carrying Conductor',
    description: 'When current flows through a conductor, it creates a circular magnetic field around it (Ampère\'s law). Use the right-hand rule: thumb points in current direction, fingers curl in the direction of the magnetic field.',
    hasToggle: true,
  },
  {
    title: 'Scene 2: External Magnetic Field',
    description: 'A pair of permanent magnets or field poles creates a uniform magnetic field from North (red) to South (blue) across the air gap. This is the main field in which the armature conductors will sit.',
    hasToggle: false,
  },
  {
    title: 'Scene 3: The Catapult Effect',
    description: 'Place the current-carrying conductor inside the external field. The conductor\'s own field adds to the external field on one side (dense lines) and cancels on the other (sparse). This imbalance creates a net force F = BIL — like a stretched catapult pushing the conductor.',
    hasToggle: false,
  },
  {
    title: 'Scene 4: Both Sides of the Coil',
    description: 'In a real coil, current flows in opposite directions on each side (⊗ in, ⊙ out). The force on one side pushes down while the other pushes up, creating a torque that rotates the coil.',
    hasToggle: false,
  },
  {
    title: 'Scene 5: Rotating Armature Coil',
    description: 'The coil spins on a shaft between the poles. A commutator reverses the current direction every half-turn so the torque always acts in the same rotational direction. The brushes maintain sliding electrical contact.',
    hasToggle: false,
  },
];

/* ───────── Main exported component ───────── */
export function MotorPrincipleAnimation({ onClose }: { onClose: () => void }) {
  const [scene, setScene] = useState(0);
  const [currentOn, setCurrentOn] = useState(false);

  const sceneData = SCENES[scene];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            {scene + 1} / {SCENES.length}
          </Badge>
          <h2 className="text-sm font-bold text-foreground">{sceneData.title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>

      {/* 3D canvas */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 4, 5]} intensity={1} />
          <OrbitControls enablePan={false} />
          {scene === 0 && <Scene1 currentOn={currentOn} />}
          {scene === 1 && <Scene2 />}
          {scene === 2 && <Scene3 />}
          {scene === 3 && <Scene4 />}
          {scene === 4 && <Scene5 />}
        </Canvas>
      </div>

      {/* bottom panel */}
      <div className="px-4 py-3 border-t space-y-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <p className="text-sm leading-relaxed text-muted-foreground">{sceneData.description}</p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={scene === 0} onClick={() => { setScene(s => s - 1); setCurrentOn(false); }}>
            <ChevronLeft className="w-3 h-3 mr-1" /> Previous
          </Button>

          {sceneData.hasToggle && (
            <Button
              size="sm"
              variant={currentOn ? 'default' : 'outline'}
              onClick={() => setCurrentOn(c => !c)}
            >
              <Power className="w-3 h-3 mr-1" />
              {currentOn ? 'Current ON' : 'Turn ON'}
            </Button>
          )}

          <div className="flex-1" />

          <Button size="sm" disabled={scene === SCENES.length - 1} onClick={() => { setScene(s => s + 1); setCurrentOn(false); }}>
            Next <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
