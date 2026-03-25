import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function EngineerModel() {
  const { scene } = useGLTF("/me.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} scale={2.4} position={[0, -2.1, 0]} rotation={[0, 0.2, 0]} />;
}

export function AuthEngineerCanvas() {
  return (
    <div className="w-[300px] h-[420px] md:w-[360px] md:h-[500px] drop-shadow-[0_24px_38px_rgba(0,0,0,0.35)]">
      <Canvas camera={{ position: [0.8, 1.6, 4.1], fov: 28 }}>
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 7, 5]} intensity={1.1} />
        <directionalLight position={[-5, 3, -4]} intensity={0.45} />
        <Suspense fallback={null}>
          <EngineerModel />
        </Suspense>
        <OrbitControls enablePan={false} enableRotate={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/me.glb");
