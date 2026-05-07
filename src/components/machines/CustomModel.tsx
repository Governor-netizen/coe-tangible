import { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Shared DRACOLoader instance — reused across all CustomModel mounts
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dracoLoader.setDecoderConfig({ type: 'js' }); // JS fallback for broader mobile device support

interface ExtractedPart {
  id: string;
  name: string;
  mesh: THREE.Mesh;
  center: THREE.Vector3;
  color: string;
}

interface CustomModelProps {
  url: string;
  isAnimating: boolean;
  animationSpeed: number;
  selectedPart: string | null;
  onPartClick: (id: string) => void;
  isExploded: boolean;
  showLabels: boolean;
  explodeSpread: number;
}

const PART_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#2980b9', '#27ae60', '#c0392b',
  '#8e44ad', '#16a085', '#d35400', '#f1c40f', '#7f8c8d',
];

function formatName(raw: string): string {
  return raw
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\d+$/, '')
    .trim() || 'Part';
}

function CustomPart({
  part,
  index,
  isSelected,
  isExploded,
  explodeSpread,
  showLabels,
  sceneCenter,
  onClick,
}: {
  part: ExtractedPart;
  index: number;
  isSelected: boolean;
  isExploded: boolean;
  explodeSpread: number;
  showLabels: boolean;
  sceneCenter: THREE.Vector3;
  onClick: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate explode direction from scene center
  const explodeDir = useMemo(() => {
    const dir = part.center.clone().sub(sceneCenter);
    if (dir.length() < 0.01) {
      // If part is at center, push it along a unique axis
      dir.set(Math.sin(index * 2.4), Math.cos(index * 1.7) * 0.5, Math.sin(index * 3.1));
    }
    dir.normalize().multiplyScalar(2);
    return dir;
  }, [part.center, sceneCenter, index]);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = isExploded
      ? new THREE.Vector3(
          explodeDir.x * explodeSpread,
          explodeDir.y * explodeSpread,
          explodeDir.z * explodeSpread
        )
      : new THREE.Vector3(0, 0, 0);
    groupRef.current.position.lerp(target, 0.08);
  });

  const emissiveColor = isSelected ? '#06b6d4' : hovered ? '#2563eb' : '#000000';
  const emissiveIntensity = isSelected ? 0.35 : hovered ? 0.15 : 0;

  // Clone geometry and create new material
  const geometry = part.mesh.geometry;

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        position={part.mesh.position.toArray()}
        rotation={[part.mesh.rotation.x, part.mesh.rotation.y, part.mesh.rotation.z]}
        scale={part.mesh.scale.toArray()}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(part.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial
          color={part.color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>

      {showLabels && (
        <Html distanceFactor={8} position={[part.mesh.position.x, part.mesh.position.y + 0.8, part.mesh.position.z]} center>
          <div className="bg-card/90 backdrop-blur border border-border rounded px-2 py-1 text-xs font-medium text-foreground whitespace-nowrap shadow-md pointer-events-none select-none">
            {isExploded && <span className="text-primary font-bold mr-1">{index + 1}.</span>}
            {part.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export function CustomModel({
  url,
  isAnimating,
  animationSpeed,
  selectedPart,
  onPartClick,
  isExploded,
  showLabels,
  explodeSpread,
}: CustomModelProps) {
  const [parts, setParts] = useState<ExtractedPart[]>([]);
  const [sceneCenter, setSceneCenter] = useState(new THREE.Vector3());
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      url,
      (gltf) => {
        // Center and scale the scene
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        gltf.scene.scale.setScalar(scale);

        const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
        gltf.scene.position.sub(center);

        // Update world matrices after transform
        gltf.scene.updateMatrixWorld(true);

        // Extract all meshes as parts
        const extracted: ExtractedPart[] = [];
        const nameCount: Record<string, number> = {};

        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            let rawName = child.name || child.parent?.name || `Part`;
            const formattedName = formatName(rawName);

            // Handle duplicates
            nameCount[formattedName] = (nameCount[formattedName] || 0) + 1;
            const uniqueName = nameCount[formattedName] > 1
              ? `${formattedName} ${nameCount[formattedName]}`
              : formattedName;

            // Get world position for this mesh
            const worldPos = new THREE.Vector3();
            child.getWorldPosition(worldPos);

            // Get color from existing material or assign one
            let color = PART_COLORS[extracted.length % PART_COLORS.length];
            if (child.material) {
              const mat = Array.isArray(child.material) ? child.material[0] : child.material;
              if (mat && 'color' in mat && mat.color) {
                color = '#' + (mat.color as THREE.Color).getHexString();
              }
            }

            // Bake world transform into geometry
            const clonedGeom = child.geometry.clone();
            clonedGeom.applyMatrix4(child.matrixWorld);

            const partMesh = new THREE.Mesh(clonedGeom);
            // Reset position/rotation/scale since transform is baked
            partMesh.position.set(0, 0, 0);
            partMesh.rotation.set(0, 0, 0);
            partMesh.scale.set(1, 1, 1);

            extracted.push({
              id: `custom-part-${extracted.length}`,
              name: uniqueName,
              mesh: partMesh,
              center: worldPos,
              color,
            });
          }
        });

        // Compute scene center for explode directions
        const allCenter = new THREE.Vector3();
        extracted.forEach((p) => allCenter.add(p.center));
        if (extracted.length > 0) allCenter.divideScalar(extracted.length);
        setSceneCenter(allCenter);

        setParts(extracted);

        // Handle animations
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
    if (groupRef.current && isAnimating && !isExploded) {
      groupRef.current.rotation.y += delta * animationSpeed * 0.5;
    }
  });

  if (parts.length === 0) return null;

  return (
    <group ref={groupRef}>
      {parts.map((part, i) => (
        <CustomPart
          key={part.id}
          part={part}
          index={i}
          isSelected={selectedPart === part.id}
          isExploded={isExploded}
          explodeSpread={explodeSpread}
          showLabels={showLabels}
          sceneCenter={sceneCenter}
          onClick={onPartClick}
        />
      ))}
    </group>
  );
}
