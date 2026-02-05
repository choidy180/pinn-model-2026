'use client'; 

import React, { Suspense, useState, useMemo, useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, Center, Environment, Resize, Line } from '@react-three/drei';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

// ✅ 모델 데이터 타입 정의 (type 필드 추가)
export interface ModelProp {
  url: string;
  position: [number, number, number];
  type: 'background' | 'interactive'; // 배경인지 상호작용인지 구분
}

interface ViewerProps {
  models: ModelProp[];
}

const FullScreenWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #1a1a1a;
  z-index: 0;
`;

// --- 상수 설정 ---
const LASER_RED_HEX = 0xff0000;
const LASER_COLOR = new THREE.Color(LASER_RED_HEX); 
const ROTATION_Y = Math.PI + 0.3; 
const MODEL_SCALE = 11;

// =================================================================
// 🧱 [NEW] 배경 전용 컴포넌트 (이벤트 X, 애니메이션 X, 측정 X)
// =================================================================
const BackgroundGlbModel = React.memo(({ url, position }: { url: string, position: [number, number, number] }) => {
  const { scene } = useGLTF(url);
  // Scene 복제 (필수)
  const copiedScene = useMemo(() => scene.clone(), [scene]);

  // 배경은 useFrame이나 이벤트 핸들러가 전혀 필요 없음 -> 성능 최상
  return (
    <group position={position}>
      <Resize scale={MODEL_SCALE}>
        <Center top>
          <primitive 
            object={copiedScene}
            rotation={[0, ROTATION_Y, 0]} // 각도 유지
            // 이벤트 핸들러 제거됨
          />
        </Center>
      </Resize>
    </group>
  );
});
BackgroundGlbModel.displayName = 'BackgroundGlbModel';


// =================================================================
// 🖱️ [EXISTING] 상호작용 컴포넌트 (마우스 오버 효과 포함)
// =================================================================
function InteractiveGlbModel({ url, position }: { url: string, position: [number, number, number] }) {
  const { scene } = useGLTF(url);
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  const [hovered, setHover] = useState(false);
  
  // Refs
  const measureRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const scanPlaneRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<any>(null);

  // 애니메이션 상태
  const animState = useRef({
    height: 0, opacity: 0, intensity: 0, lineOpacity: 0
  });

  const [dimensions, setDimensions] = useState({ width: 1, height: 1, depth: 1 });

  useLayoutEffect(() => {
    if (measureRef.current) {
      const box = new THREE.Box3();
      box.setFromObject(measureRef.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      const safeX = size.x || 1;
      const safeY = size.y || 1;
      const safeZ = size.z || 1;

      setDimensions({ width: safeX * 1, height: safeY, depth: safeZ * 1 });

      const uniqueMaterials = new Set<THREE.MeshStandardMaterial>();
      measureRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.emissive = LASER_COLOR;
              mat.emissiveIntensity = 0;
              uniqueMaterials.add(mat);
            }
          });
        }
      });
      materialsRef.current = Array.from(uniqueMaterials);
    }
  }, [copiedScene]);

  useFrame((state, delta) => {
    const targetHeight = hovered ? dimensions.height : 0;
    const targetOpacity = hovered ? 0.3 : 0;
    const targetIntensity = hovered ? 0.5 : 0;
    const targetLineOpacity = hovered ? 1 : 0;
    const speed = delta * 8; 

    const current = animState.current;
    const lerpWithSnap = (curr: number, target: number) => {
      if (Math.abs(curr - target) < 0.001) return target;
      return THREE.MathUtils.lerp(curr, target, speed);
    };

    current.height = lerpWithSnap(current.height, targetHeight);
    current.opacity = lerpWithSnap(current.opacity, targetOpacity);
    current.intensity = lerpWithSnap(current.intensity, targetIntensity);
    current.lineOpacity = lerpWithSnap(current.lineOpacity, targetLineOpacity);
    
    const isActive = current.opacity > 0 || current.intensity > 0 || current.lineOpacity > 0;

    if (isActive) {
      const len = materialsRef.current.length;
      for (let i = 0; i < len; i++) {
        materialsRef.current[i].emissiveIntensity = current.intensity;
      }
      if (scanPlaneRef.current) {
        scanPlaneRef.current.position.y = current.height;
        scanPlaneRef.current.visible = current.opacity > 0.01;
        const mat = scanPlaneRef.current.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = current.opacity;
      }
      if (lineRef.current && lineRef.current.material) {
        lineRef.current.material.opacity = current.lineOpacity;
        lineRef.current.visible = current.lineOpacity > 0.01;
      }
    } else {
      if (scanPlaneRef.current && scanPlaneRef.current.visible) scanPlaneRef.current.visible = false;
      if (lineRef.current && lineRef.current.visible) lineRef.current.visible = false;
      if (materialsRef.current.length > 0 && materialsRef.current[0].emissiveIntensity !== 0) {
        materialsRef.current.forEach(m => m.emissiveIntensity = 0);
      }
    }
  });

  const halfW = dimensions.width / 2;
  const halfD = dimensions.depth / 2;
  const rectPoints = useMemo(() => [
    [-halfW, 0, -halfD], [halfW, 0, -halfD], [halfW, 0, halfD], [-halfW, 0, halfD], [-halfW, 0, -halfD] 
  ] as [number, number, number][], [dimensions]);

  return (
    <group position={position}>
      <group ref={measureRef}>
        <Resize scale={MODEL_SCALE}>
          <Center top>
            <primitive 
              object={copiedScene}
              rotation={[0, ROTATION_Y, 0]} 
              onPointerOver={(e: any) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHover(true); }}
              onPointerOut={(e: any) => { document.body.style.cursor = 'auto'; setHover(false); }}
            />
          </Center>
        </Resize>
      </group>
      <group rotation={[0, ROTATION_Y, 0]}>
        <group position={[0, 0.02, 0]}>
          <Line ref={lineRef} points={rectPoints} color={`rgb(${LASER_RED_HEX >> 16}, ${(LASER_RED_HEX >> 8) & 255}, ${LASER_RED_HEX & 255})`} lineWidth={2} transparent depthWrite={false} visible={false} />
        </group>
        <mesh ref={scanPlaneRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[dimensions.width, dimensions.depth]} />
          <meshBasicMaterial color={LASER_RED_HEX} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

// --- 메인 뷰어 컴포넌트 ---
const FullScreenGlbViewer: React.FC<ViewerProps> = ({ models }) => {
  return (
    <FullScreenWrapper>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }} dpr={[1, 2]}> 
        <color attach="background" args={['#1a1a1a']} />
        <Suspense fallback={<Html center style={{color: 'white'}}>Loading Models...</Html>}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <Environment preset="city" />
          
          {models.map((model, index) => (
            // ✅ type에 따라 다른 컴포넌트 렌더링
            model.type === 'background' ? (
              <BackgroundGlbModel
                key={`bg-${model.url}-${index}`}
                url={model.url}
                position={model.position}
              />
            ) : (
              <InteractiveGlbModel 
                key={`interactive-${model.url}-${index}`} 
                url={model.url} 
                position={model.position} 
              />
            )
          ))}

          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        </Suspense>
      </Canvas>
    </FullScreenWrapper>
  );
}

const DynamicFullScreenGlbViewer = dynamic<ViewerProps>(
  () => Promise.resolve(FullScreenGlbViewer),
  { ssr: false }
);

export default DynamicFullScreenGlbViewer;