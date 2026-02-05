"use client";

import React, { useMemo, useState, useLayoutEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function cloneSceneWithUniqueMaterials(src: THREE.Object3D) {
  // ✅ 인스턴스별 scene clone
  const cloned = src.clone(true);

  // ✅ (원본 material -> 복제 material) 캐시: 같은 재질을 여러 번 clone하지 않도록
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
      const m = mat as THREE.Material;
      const cached = materialCache.get(m);
      if (cached) {
        mesh.material = cached;
      } else {
        const c = m.clone();
        materialCache.set(m, c);
        createdMaterials.push(c);
        mesh.material = c;
      }
    }
  });

  return { cloned, createdMaterials };
}

export function GlbModel({
  url,
  position = [0, 0, 0],
  scale = 1,
}: {
  url: string;
  position?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(url);
  const [hovered, setHovered] = useState(false);

  // ✅ 1) scene + material “완전 분리 clone”
  const { localScene, createdMaterials } = useMemo(() => {
    const { cloned, createdMaterials } = cloneSceneWithUniqueMaterials(scene);
    return { localScene: cloned as THREE.Group, createdMaterials };
  }, [scene]);

  // ✅ 2) 모델의 바닥을 y=0으로 정렬(이펙트가 모델 위로 떠서 화면을 덮는 걸 방지)
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(localScene);
    // localScene 자체를 바닥 기준으로 올림
    localScene.position.y -= box.min.y;
  }, [localScene]);

  // ✅ 우리가 clone해서 만든 material만 dispose (원본/공유 리소스 건드리지 않음)
  useLayoutEffect(() => {
    return () => {
      createdMaterials.forEach((m) => m.dispose());
    };
  }, [createdMaterials]);

  // ✅ hover 효과(예시): 인스턴스별로만 변경됨
  useLayoutEffect(() => {
    localScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      const mat = mesh.material as any;
      if (mat?.isMeshStandardMaterial) {
        mat.emissiveIntensity = hovered ? 0.8 : 0.0;
        mat.needsUpdate = true;
      }
    });
  }, [hovered, localScene]);

  // ✅ 3) (중요) “겹쳐 물드는” 이펙트는 depthTest를 켜고, 모델 바닥 아래에 두기
  // 링/글로우가 다른 모델 위로 덮여 보이는 건 대부분 depthTest=false or 위로 떠있어서임
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (ringRef.current && hovered) ringRef.current.rotation.z += dt * 1.2;
  });

  // 모델 크기 기반 링 반지름 계산
  const dims = useMemo(() => {
    const box = new THREE.Box3().setFromObject(localScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    return {
      radius: Math.max(size.x, size.z) * 0.65,
    };
  }, [localScene]);

  const effectY = -0.002; // ✅ 모델 바닥(0)보다 아주 살짝 아래로

  return (
    <group position={position} scale={scale}>
      {/* 모델 */}
      <group
        onPointerOver={(e) => {
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
      </group>

      {/* 링 (hover일 때만 보이게) */}
      {hovered && (
        <mesh
          ref={ringRef}
          raycast={() => null} // ✅ 이펙트가 hover 판정에 간섭하지 않게
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, effectY, 0]}
        >
          <ringGeometry args={[dims.radius * 0.82, dims.radius, 64]} />
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthTest={true}      // ✅ 다른 오브젝트가 앞에 있으면 이펙트가 “덮지 못하게”
            depthWrite={false}
            polygonOffset={true}  // ✅ z-fighting 방지
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      )}

      {/* 글로우 평면 (hover일 때만) */}
      {hovered && (
        <mesh
          raycast={() => null}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, effectY - 0.001, 0]}
        >
          <circleGeometry args={[dims.radius * 1.05, 64]} />
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthTest={true}     // ✅ 덮어쓰기 방지 핵심
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
