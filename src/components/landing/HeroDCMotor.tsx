import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { DCMotorModel } from '../machines/DCMotorModel';

export function HeroDCMotor() {
  return (
    <Canvas
      camera={{ position: [4, 2.5, 4], fov: 40 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <DCMotorModel
          selectedPart={null}
          onPartClick={() => {}}
          isAnimating={true}
          animationSpeed={0.5}
          isExploded={false}
          showLabels={false}
        />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  );
}
