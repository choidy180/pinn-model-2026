"use client";

import React, { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Html,
  Center,
  Environment,
  Resize,
  useTexture,
} from "@react-three/drei";
import styled from "styled-components";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";

const AnimatedGroup = animated.group;
const AnimatedMesh = animated.mesh;

// TS 무한 타입 추론 방지용 (너가 쓰던 방식 유지)
const AnimatedBasicMaterial = animated("meshBasicMaterial") as any;

export interface ModelProp {
  url: string;
  position: [number, number, number];
}

interface ViewerProps {
  models: ModelProp[];
}

const FullScreenWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  inset: 0;
  background-color: #1a1a1a;
  z-index: 0;
`;

/** ✅ 핵심: GLTF 씬을 인스턴스별로 복제 + material을 전부 clone해서 공유를 끊는다 */
function cloneSceneWithUniqueMaterials(src: THREE.Object3D) {
  const cloned = src.clone(true);

  // 같은 material이 여러 mesh에 재사용되는 경우가 많아서,
  // 1개 material을 여러 번 clone하지 않도록 캐시
  const materialCache = new Map<THREE.Material, THREE.Material>();
  const createdMaterials: THREE.Material[] = [];

  cloned.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    const mat = mesh.material;

    if (Array.isArray(mat)) {
      mesh.material = mat.map((m) => {
        if (!m) return m;
        const cached = materialCache.get(m);
        if (cached) return cached;
        const c = m.clone();
        materialCache.set(m, c);
        createdMaterials.push(c);
        return c;
      });
    } else if (mat) {
      const cached = materialCache.get(mat);
      if (cached) {
        mesh.material = cached;
      } else {
        const c = (mat as THREE.Material).clone();
        materialCache.set(mat as THREE.Material, c);
        createdMaterials.push(c);
        mesh.material = c;
      }
    }
  });

  return { cloned, createdMaterials };
}

function GlbModel({
  url,
  position,
}: {
  url: string;
  position: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const glowTexture = useTexture(
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png"
  );

  const [hovered, setHovered] = useState(false);

  // ✅ scene + material 완전 분리 clone
  const { localScene, createdMaterials } = useMemo(() => {
    const { cloned, createdMaterials } = cloneSceneWithUniqueMaterials(scene);
    return { localScene: cloned as THREE.Group, createdMaterials };
  }, [scene]);

  // ✅ 우리가 clone해서 만든 material만 dispose (원본/공유 리소스 건드리지 않음)
  useLayoutEffect(() => {
    return () => {
      createdMaterials.forEach((m) => m.dispose());
    };
  }, [createdMaterials]);

  // 링/글로우 크기 계산
  const dimensions = useMemo(() => {
    const box = new THREE.Box3().setFromObject(localScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    return {
      width: Math.max(size.x, 0.001),
      depth: Math.max(size.z, 0.001),
      radius: Math.max(size.x, size.z) * 0.6,
    };
  }, [localScene]);

  const { scale, hoverY, ringOpacity, ringScale } = useSpring({
    scale: hovered ? 1.1 : 1,
    hoverY: hovered ? 0.5 : 0,
    ringOpacity: hovered ? 0.8 : 0,
    ringScale: hovered ? 1 : 0.5,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current && hovered) ringRef.current.rotation.z += delta * 1;
  });

  return (
    <group position={position}>
      {/* 1) 모델 */}
      <Resize scale={3}>
        <Center top>
          <AnimatedGroup
            scale={scale}
            position-y={hoverY}
            onPointerOver={(e: any) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
              setHovered(true);
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
              setHovered(false);
            }}
          >
            <primitive object={localScene} />
          </AnimatedGroup>
        </Center>
      </Resize>

      {/* 2) 링 - 이펙트가 hover 판정에 간섭 못 하게 raycast 차단 */}
      <AnimatedMesh
        ref={ringRef}
        raycast={() => null}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.1, 0]}
        scale={ringScale}
      >
        <ringGeometry args={[dimensions.radius * 0.8, dimensions.radius, 32]} />
        <AnimatedBasicMaterial
          color="#00ffff"
          transparent
          opacity={ringOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </AnimatedMesh>

      {/* 3) 글로우 */}
      <AnimatedMesh
        raycast={() => null}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        scale={ringScale}
      >
        <planeGeometry args={[dimensions.width * 1.5, dimensions.depth * 1.5]} />
        <AnimatedBasicMaterial
          map={glowTexture}
          color="#00ffff"
          transparent
          opacity={ringOpacity.to((o: number) => o * 0.3)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </AnimatedMesh>
    </group>
  );
}

const FullScreenGlbViewer: React.FC<ViewerProps> = ({ models }) => {
  return (
    <FullScreenWrapper>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        <color attach="background" args={["#1a1a1a"]} />

        <Suspense fallback={<Html center style={{ color: "white" }}>Loading...</Html>}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <Environment preset="city" />

          {models.map((m, i) => (
            <GlbModel key={i} url={m.url} position={m.position} />
          ))}

          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        </Suspense>
      </Canvas>
    </FullScreenWrapper>
  );
};

const DynamicFullScreenGlbViewer = dynamic<ViewerProps>(
  () => Promise.resolve(FullScreenGlbViewer),
  { ssr: false }
);

export default DynamicFullScreenGlbViewer;
