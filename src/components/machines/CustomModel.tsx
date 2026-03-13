import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface CustomModelProps {
  url: string;
  isAnimating: boolean;
  animationSpeed: number;
}

export function CustomModel({ url, isAnimating, animationSpeed }: CustomModelProps) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        // Center and scale
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        gltf.scene.scale.setScalar(scale);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center.multiplyScalar(scale));

        setScene(gltf.scene);

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          mixerRef.current = mixer;
        }
      },
      undefined,
      (err) => console.error('Failed to load GLB:', err)
    );

    return () => {
      mixerRef.current?.stopAllAction();
    };
  }, [url]);

  useFrame((_, delta) => {
    if (mixerRef.current && isAnimating) {
      mixerRef.current.update(delta * animationSpeed);
    }
    if (groupRef.current && isAnimating) {
      groupRef.current.rotation.y += delta * animationSpeed * 0.5;
    }
  });

  if (!scene) return null;

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}
