'use client'; 

import React, { Suspense, useState, useMemo, useLayoutEffect, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html, Center, Environment, Resize, Line, CameraControls } from '@react-three/drei';
import styled, { css, keyframes } from 'styled-components';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

// =================================================================
// 📋 1. 타입 및 상수 정의
// =================================================================
export interface ModelProp {
  url: string;
  position: [number, number, number];
  type: 'background' | 'interactive';
  scale?: number;
  warning?: boolean; 
  isPending?: boolean;
  errorDetails?: {
    cause: string;
    solution: string;
  };
  info?: {
    title: string;
    description: string;
    details?: { label: string; value: string }[];
  };
  onZoomEnter?: (targetPosition: THREE.Vector3, targetSize: THREE.Vector3) => void;
  onZoomLeave?: () => void;
  forceHover?: boolean;
  isExternalHovered?: boolean; 
  portalRef?: React.RefObject<HTMLDivElement | null>;
}

interface ViewerProps {
  models: ModelProp[];
  portalRef?: React.RefObject<HTMLDivElement | null>;
}

const STAFF_LIST = [
  { id: 1, name: '이동진', position: '대리' },
  { id: 2, name: '임신홍', position: '사원' },
  { id: 3, name: '김광호', position: '과장' },
];

const COLOR_RED_HEX = 0xff003c;   
const COLOR_CYAN_HEX = 0x5ef6ff;  
const COLOR_AMBER_HEX = 0xff9900; 

const COLOR_RED_STR = '#ff003c';
const COLOR_CYAN_STR = '#5ef6ff';
const COLOR_AMBER_STR = '#ff9900';

const ROTATION_Y = Math.PI + 0.3; 
const MODEL_SCALE_DEFAULT = 11;   

const DEMO_ERROR_DATA: Record<string, { cause: string, solution: string }> = {
  // 1. 기존 에러 (그대로 유지): 가열/건조 관련 열효율 문제
  "DRY ZONE UNIT": { 
    cause: "내부 히터 코일 과부하로 인한 열효율 급감 감지 (Efficiency Drop)", 
    solution: "2번 가열 모듈 전원 차단 후 온도 센서 재설정 및 코일 교체 요망" 
  },

  // 2. 수정된 에러: 사출 성형기 관련 압력 및 기계적 결함 (현실적인 공장 시나리오)
  // 모델의 info.title을 "INJECTION SYSTEM" 또는 "MAIN ASSEMBLY"로 설정할 때 매칭됩니다.
  "INJECTION SYSTEM": { 
    cause: "사출 보압 공정 중 스크류 역류 및 유압 펌프 압력 저하 (Backflow & Pressure Loss)", 
    solution: "스크류 체크 링(Check Ring) 마모 점검 및 유압 솔레노이드 밸브 교체 필요" 
  },

  // (혹시 기존 모델명인 'MAIN ASSEMBLY'를 그대로 쓰실 경우를 대비해 동일한 내용을 매핑해둡니다)
  "MAIN ASSEMBLY": { 
    cause: "사출 보압 공정 중 스크류 역류 및 유압 펌프 압력 저하 (Backflow & Pressure Loss)", 
    solution: "스크류 체크 링(Check Ring) 마모 점검 및 유압 솔레노이드 밸브 교체 필요" 
  },

  "DEFAULT": { 
    cause: "데이터 통신 패킷 손실 및 응답 지연 (Timeout)", 
    solution: "네트워크 모듈 리셋 후 중앙 제어 장치 재연결 시도" 
  }
};

// =================================================================
// 🎞️ 2. 애니메이션 정의
// =================================================================

// 🚨 [수정] transform: translate를 제거하여 Flex 중앙 정렬과 충돌 방지
const popIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const scanAnimation = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(200%); opacity: 0; }
`;

const pulseBadge = keyframes`
  0% { box-shadow: 0 0 0 rgba(255, 0, 60, 0); }
  50% { box-shadow: 0 0 8px rgba(255, 0, 60, 0.6); }
  100% { box-shadow: 0 0 0 rgba(255, 0, 60, 0); }
`;

// =================================================================
// 🎨 3. 스타일 컴포넌트
// =================================================================

const FullScreenWrapper = styled.div`
  width: 100vw; height: 100vh; position: fixed; top: 0; left: 0;
  background-color: #050505; z-index: 0; font-family: 'Segoe UI', sans-serif;
`;

// 🚨 [수정] 담당자 선택 오버레이: z-index를 최상위(Max Safe Integer)로 설정
const SelectionOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.85); /* 배경을 더 어둡게 하여 모달 강조 */
  backdrop-filter: blur(10px);
  z-index: 2147483647; /* CSS 최상위 레이어 */
  display: flex; 
  justify-content: center; 
  align-items: center;
  pointer-events: auto;
`;

// 🚨 [수정] SelectionBox: absolute 제거 -> Flexbox 중앙 정렬 따름
const SelectionBox = styled.div`
  position: relative; /* absolute 제거 */
  background: #0f1218;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px; 
  width: 400px;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.8);
  display: flex; flex-direction: column; gap: 15px;
  animation: ${popIn} 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
`;

const StaffButton = styled.button`
  width: 100%; padding: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff; font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.2s;
  display: flex; justify-content: space-between; align-items: center;
  &:hover { background: ${COLOR_RED_STR}; border-color: ${COLOR_RED_STR}; transform: scale(1.02); }
  span.pos { font-size: 14px; font-weight: 400; opacity: 0.7; }
`;

// 🚨 [수정] 알림창 오버레이
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
  z-index: 2147483640; /* 선택창보다는 약간 아래지만 최상위권 */
  display: flex; justify-content: center; align-items: center;
  pointer-events: auto;
`;

// 🚨 [수정] ModalBox: absolute 제거 -> Flexbox 중앙 정렬 따름
const ModalBox = styled.div<{ $type: 'info' | 'success' }>`
  position: relative; /* absolute 제거 */
  background: rgba(10, 15, 20, 0.98);
  border: 2px solid ${props => props.$type === 'success' ? COLOR_CYAN_STR : COLOR_AMBER_STR};
  box-shadow: 0 0 80px ${props => props.$type === 'success' ? 'rgba(94, 246, 255, 0.2)' : 'rgba(255, 153, 0, 0.2)'};
  padding: 50px 70px; min-width: 500px; text-align: center; color: #fff;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  animation: ${popIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  display: flex; flex-direction: column; align-items: center; gap: 25px;
  &::before {
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
    background: ${props => props.$type === 'success' ? COLOR_CYAN_STR : COLOR_AMBER_STR};
  }
`;

const ModalIcon = styled.div<{ $type: 'info' | 'success' }>`
  width: 70px; height: 70px; border-radius: 50%;
  border: 3px solid ${props => props.$type === 'success' ? COLOR_CYAN_STR : COLOR_AMBER_STR};
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; color: ${props => props.$type === 'success' ? COLOR_CYAN_STR : COLOR_AMBER_STR};
  box-shadow: 0 0 20px ${props => props.$type === 'success' ? COLOR_CYAN_STR : COLOR_AMBER_STR};
`;

const ModalTitle = styled.h2<{ $type: 'info' | 'success' }>`
  margin: 0; font-size: 36px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  color: ${props => props.$type === 'success' ? COLOR_CYAN_STR : COLOR_AMBER_STR};
  text-shadow: 0 0 15px ${props => props.$type === 'success' ? 'rgba(94, 246, 255, 0.5)' : 'rgba(255, 153, 0, 0.5)'};
`;

const ModalMessage = styled.p`
  margin: 0; font-size: 22px; line-height: 1.6; color: #e0e0e0; font-weight: 500; white-space: pre-wrap;
`;

const WarningSidebar = styled.div`
  position: absolute; top: 380px; left: 30px; width: 340px;
  display: flex; flex-direction: column; gap: 16px; z-index: 1000; pointer-events: none;
`;

const WarningBox = styled.div<{ $active: boolean; $isPending?: boolean }>`
  pointer-events: auto; position: relative; overflow: hidden;
  background: rgba(11, 14, 20, 0.95);
  border-left: 4px solid ${props => props.$isPending ? COLOR_AMBER_STR : COLOR_RED_STR};
  border-right: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); border-bottom-right-radius: 12px;
  padding: 0; cursor: pointer; transition: all 0.2s;
  ${props => props.$active && css`
    transform: translateX(8px);
    background: rgba(20, 25, 35, 0.98);
    border-color: ${props.$isPending ? 'rgba(255, 153, 0, 0.5)' : 'rgba(255, 0, 60, 0.5)'};
    border-left-color: ${props.$isPending ? COLOR_AMBER_STR : COLOR_RED_STR};
    box-shadow: 0 0 20px ${props.$isPending ? 'rgba(255, 153, 0, 0.15)' : 'rgba(255, 0, 60, 0.15)'};
    &::after {
      content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 50%;
      background: linear-gradient(to bottom, transparent, ${props.$isPending ? 'rgba(255, 153, 0, 0.1)' : 'rgba(255, 0, 60, 0.1)'}, transparent);
      animation: ${scanAnimation} 2s infinite linear; pointer-events: none;
    }
  `}
`;

const WarningHeader = styled.div<{ $isPending?: boolean }>`
  padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: ${props => props.$isPending ? 'rgba(255, 153, 0, 0.05)' : 'rgba(255, 0, 60, 0.05)'};
  h4 { margin: 0; font-size: 18px; font-weight: 700; color: #fff; }
`;

const WarningBadge = styled.span<{ $isPending?: boolean }>`
  font-size: 14px; background: ${props => props.$isPending ? COLOR_AMBER_STR : COLOR_RED_STR};
  color: #fff; padding: 3px 6px; border-radius: 2px; font-weight: 800; animation: ${pulseBadge} 2s infinite;
`;

const WarningContent = styled.div` padding: 16px; display: flex; flex-direction: column; gap: 14px; `;
const DetailRow = styled.div` display: flex; flex-direction: column; gap: 4px; `;
const DetailLabel = styled.span<{ $isPending?: boolean }>`
  font-size: 14px; color: #a0aab5; font-weight: 600; display: flex; align-items: center; gap: 6px;
  &::before {
    content: ''; display: block; width: 4px; height: 4px;
    background: ${props => props.$isPending ? COLOR_AMBER_STR : COLOR_RED_STR}; border-radius: 50%;
  }
`;
const DetailValue = styled.span` font-size: 14px; color: #ffffff; padding-left: 10px; border-left: 1px solid rgba(255, 255, 255, 0.1); `;

const WarningActions = styled.div` display: flex; gap: 8px; padding: 0 16px 16px 16px; `;
const ActionButton = styled.button<{ $variant: 'notify' | 'resolve' }>`
  flex: 1; padding: 8px 0; font-family: 'Segoe UI', sans-serif; font-size: 13px; font-weight: 700;
  text-transform: uppercase; cursor: pointer; border: 1px solid; color: #fff; z-index: 10;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  ${props => props.$variant === 'notify' && css`
    background: rgba(255, 153, 0, 0.1); border-color: rgba(255, 153, 0, 0.5); color: #ff9900;
    &:hover:not(:disabled) { background: rgba(255, 153, 0, 0.3); box-shadow: 0 0 10px rgba(255, 153, 0, 0.2); }
  `}
  ${props => props.$variant === 'resolve' && css`
    background: rgba(94, 246, 255, 0.1); border-color: rgba(94, 246, 255, 0.5); color: #5ef6ff;
    &:hover:not(:disabled) { background: rgba(94, 246, 255, 0.3); box-shadow: 0 0 10px rgba(94, 246, 255, 0.2); text-shadow: 0 0 5px rgba(94, 246, 255, 0.5); }
  `}
`;

// 3D UI Styles
const CardWrapper = styled.div<StatusStyleProps>`
  position: absolute; top: 0; left: 0; width: 300px; pointer-events: none;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'translate3d(40px, -40px, 0)' : 'translate3d(20px, -20px, 0)')};
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(4px); color: #e0e0e0;
  border-left: 2px solid ${props => props.$isWarning ? COLOR_RED_STR : COLOR_CYAN_STR};
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%);
  box-shadow: 0 0 15px ${props => props.$isWarning ? 'rgba(255, 0, 60, 0.1)' : 'rgba(94, 246, 255, 0.1)'};
`;
interface StatusStyleProps { $visible: boolean; $isWarning: boolean; }
const CardHeader = styled.div<{ $isWarning: boolean }>`
  background: ${props => props.$isWarning ? 'rgba(255, 0, 60, 0.1)' : 'rgba(94, 246, 255, 0.1)'};
  padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid ${props => props.$isWarning ? 'rgba(255, 0, 60, 0.3)' : 'rgba(94, 246, 255, 0.3)'};
`;
const Title = styled.h3<{ $isWarning: boolean }>`
  margin: 0; font-size: 16px; font-weight: 700; color: ${props => props.$isWarning ? COLOR_RED_STR : COLOR_CYAN_STR};
`;
const LevelTag = styled.span<{ $isWarning: boolean }>`
  font-size: 14px; background: ${props => props.$isWarning ? COLOR_RED_STR : COLOR_CYAN_STR};
  color: #000; padding: 2px 6px; font-weight: bold; border-radius: 2px;
`;
const CardBody = styled.div` padding: 16px; `;
const Description = styled.p` margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #ffffff; `;
const StatsGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 14px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; `;
const StatItem = styled.div` display: flex; flex-direction: column; `;
const StatLabel = styled.span` font-size: 14px; color: #bebebe; text-transform: uppercase; `;
const StatValue = styled.span` font-size: 18px; color: #fff; font-family: 'Courier New', monospace; `;

const ConnectorSVG = styled.svg<{ $visible: boolean; $color: string }>`
  position: absolute; top: 0; left: 0; width: 100px; height: 100px; overflow: visible; pointer-events: none;
  opacity: ${props => (props.$visible ? 1 : 0)}; transition: opacity 0.2s ease; z-index: -1;
  path { stroke: ${props => props.$color}; fill: none; } circle { stroke: none; fill: ${props => props.$color}; }
`;

const ButtonGroup = styled.div` position: fixed; bottom: 30px; left: 30px; z-index: 1000; display: flex; gap: 12px; align-items: flex-end; pointer-events: auto; `;
const ButtonContainer = styled.div` position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto; `;
const Tooltip = styled.div<{ $show: boolean }>`
  position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
  background: rgba(10, 10, 12, 0.95); border: 1px solid #ff003c; color: #fff;
  padding: 8px 12px; font-size: 18px; white-space: nowrap; pointer-events: none;
  opacity: ${props => (props.$show ? 1 : 0)}; transition: opacity 0.2s ease; z-index: 1001;
  span { display: block; &.title { color: #ff003c; font-weight: bold; font-size: 16px; } &.desc { color: #ffffff; font-size: 14px; } }
`;
// 🚨 [수정] CyberButton: 평소에는 투명 + 낮은 투명도(Ghost), 호버 시 활성화
const CyberButton = styled.button<{ $active?: boolean }>`
  /* 기본 상태: 배경/테두리 투명, 텍스트 매우 흐림 */
  background: ${props => props.$active ? 'rgba(255, 0, 60, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 0, 60, 0.3)' : 'transparent'};
  color: ${props => props.$active ? '#ff003c' : 'rgba(255, 255, 255, 0.15)'}; /* 평소엔 아주 희미한 흰색 */
  
  font-family: 'Segoe UI', sans-serif; 
  font-size: 14px; /* 크기도 살짝 줄임 */
  font-weight: 600; 
  padding: 8px 16px; 
  cursor: pointer;
  
  /* 부드러운 전환 효과 */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* 형태 유지 */
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  display: flex; 
  align-items: center; 
  gap: 8px; 
  pointer-events: auto;

  /* SVG 아이콘도 흐리게 */
  svg { 
    width: 16px; 
    height: 16px; 
    opacity: ${props => props.$active ? 0.8 : 0.3}; 
    transition: opacity 0.3s;
  }

  /* 🖱️ 호버 시: 원래 UI 스타일로 복귀 (잘 보이게) */
  &:hover {
    background: rgba(10, 12, 16, 0.8); /* 어두운 배경 생성 */
    border-color: ${props => props.$active ? '#ff003c' : 'rgba(255, 255, 255, 0.3)'};
    color: ${props => props.$active ? '#ff003c' : '#fff'};
    transform: translateY(-2px); /* 살짝 떠오르는 느낌 */
    
    svg { opacity: 1; }
  }
`;

// =================================================================
// 🧱 [Background] Component
// =================================================================
const BackgroundGlbModel = React.memo(({ url, position, scale }: ModelProp) => {
  const { scene } = useGLTF(url);
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return (
    <group position={position}>
      <Resize scale={scale ?? MODEL_SCALE_DEFAULT}>
        <Center top><primitive object={copiedScene} rotation={[0, ROTATION_Y, 0]} /></Center>
      </Resize>
    </group>
  );
});
BackgroundGlbModel.displayName = 'BackgroundGlbModel';

// =================================================================
// 🖱️ [Interactive] Component
// =================================================================
function InteractiveGlbModel({ url, position, scale, info, onZoomEnter, onZoomLeave, forceHover = false, portalRef, warning = false, isPending = false, isExternalHovered = false }: ModelProp) {
  const { scene } = useGLTF(url);
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  const [localHover, setLocalHover] = useState(false);
  const isEffectiveHover = localHover || forceHover || isExternalHovered;

  const rootRef = useRef<THREE.Group>(null);
  const measureRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const scanPlaneRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<any>(null);
  const animState = useRef({ height: 0, opacity: 0, intensity: 0, lineOpacity: 0 });
  const [dimensions, setDimensions] = useState({ width: 1, height: 1, depth: 1 });

  const activeHexColor = isPending ? COLOR_AMBER_HEX : (warning ? COLOR_RED_HEX : COLOR_CYAN_HEX);
  const activeStrColor = isPending ? COLOR_AMBER_STR : (warning ? COLOR_RED_STR : COLOR_CYAN_STR);
  const activeThreeColor = useMemo(() => new THREE.Color(activeHexColor), [activeHexColor]);
  const rgbColor = useMemo(() => `rgb(${activeHexColor >> 16}, ${(activeHexColor >> 8) & 255}, ${activeHexColor & 255})`, [activeHexColor]);

  useLayoutEffect(() => {
    if (rootRef.current) {
      const box = new THREE.Box3().setFromObject(copiedScene);
      const size = new THREE.Vector3();
      box.getSize(size);
      setDimensions({ width: size.x * 1.01, height: size.y, depth: size.z * 1.01 });
      const uniqueMaterials = new Set<THREE.MeshStandardMaterial>();
      copiedScene.traverse((child: any) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => { if (m.isMeshStandardMaterial) { m.emissive = activeThreeColor; m.emissiveIntensity = 0; uniqueMaterials.add(m); } });
        }
      });
      materialsRef.current = Array.from(uniqueMaterials);
    }
  }, [copiedScene, scale, activeThreeColor]);

  useFrame((state, delta) => {
    const targetHeight = isEffectiveHover ? dimensions.height : 0;
    const targetOpacity = isEffectiveHover ? 0.3 : 0;
    const targetIntensity = (warning || isEffectiveHover) ? (isPending ? 0.6 : 1.0) : 0;
    const current = animState.current;
    
    current.height = THREE.MathUtils.lerp(current.height, targetHeight, delta * 8);
    current.opacity = THREE.MathUtils.lerp(current.opacity, targetOpacity, delta * 8);
    current.intensity = THREE.MathUtils.lerp(current.intensity, targetIntensity, delta * 8);

    const blinkValue = (Math.sin(state.clock.elapsedTime * 10) + 1) * 0.5;
    const pulsing = isPending ? current.intensity : current.intensity * (0.5 + 1.5 * blinkValue);

    if (current.opacity > 0 || current.intensity > 0) {
      materialsRef.current.forEach(m => { m.emissive = activeThreeColor; m.emissiveIntensity = pulsing; });
      if (scanPlaneRef.current) {
        scanPlaneRef.current.position.y = current.height;
        scanPlaneRef.current.visible = current.opacity > 0.01;
        (scanPlaneRef.current.material as THREE.MeshBasicMaterial).color = activeThreeColor;
        (scanPlaneRef.current.material as THREE.MeshBasicMaterial).opacity = current.opacity;
      }
      if (lineRef.current) { lineRef.current.visible = true; }
    } else {
      if (scanPlaneRef.current) scanPlaneRef.current.visible = false;
      if (lineRef.current) lineRef.current.visible = false;
      materialsRef.current.forEach(m => m.emissiveIntensity = 0);
    }
  });

  // Zoom Handler Wrapper
  useEffect(() => {
    if (isExternalHovered && onZoomEnter && rootRef.current) {
      const worldPos = new THREE.Vector3(); rootRef.current.getWorldPosition(worldPos);
      onZoomEnter(worldPos, new THREE.Vector3(dimensions.width, dimensions.height, dimensions.depth));
    } else if (!isExternalHovered && !localHover && !forceHover && onZoomLeave) {
      onZoomLeave();
    }
  }, [isExternalHovered, localHover, forceHover]);

  return (
    <group ref={rootRef} position={position} rotation={[0, ROTATION_Y, 0]}>
      <mesh position={[0, dimensions.height/2, 0]} onPointerOver={(e) => { e.stopPropagation(); setLocalHover(true); }} onPointerOut={() => setLocalHover(false)}>
        <boxGeometry args={[dimensions.width*1.2, dimensions.height*1.2, dimensions.depth*1.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group><Resize scale={scale ?? MODEL_SCALE_DEFAULT}><Center top><primitive object={copiedScene} /></Center></Resize></group>
      <group position={[0, 0.02, 0]}>
        <Line ref={lineRef} points={[[ -dimensions.width/2, 0, -dimensions.depth/2 ], [ dimensions.width/2, 0, -dimensions.depth/2 ], [ dimensions.width/2, 0, dimensions.depth/2 ], [ -dimensions.width/2, 0, dimensions.depth/2 ], [ -dimensions.width/2, 0, -dimensions.depth/2 ]]} color={rgbColor} lineWidth={2} transparent depthWrite={false} visible={false} />
        <mesh ref={scanPlaneRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[dimensions.width, dimensions.depth]} />
          <meshBasicMaterial color={activeHexColor} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      {info && (
        <Html position={[0, dimensions.height, 0]} center portal={portalRef as unknown as React.MutableRefObject<HTMLElement>} style={{ pointerEvents: 'none', width: '400px', height: '200px', zIndex: 999999 }}>
          <ConnectorSVG viewBox="0 0 100 100" $visible={isEffectiveHover} $color={activeStrColor}>
            <path d="M 50 100 L 80 70 L 150 70" strokeWidth="2" fill="none" />
            <circle cx="50" cy="100" r="3" />
          </ConnectorSVG>
          <CardWrapper $visible={isEffectiveHover} $isWarning={!!warning}>
            <CardHeader $isWarning={!!warning}>
              <Title $isWarning={!!warning}>{info.title}</Title>
              <LevelTag $isWarning={!!warning}>{isPending ? 'PENDING' : (warning ? 'WARNING' : 'NORMAL')}</LevelTag>
            </CardHeader>
            <CardBody>
              <Description>{info.description}</Description>
              {info.details && <StatsGrid>{info.details.map((d, i) => <StatItem key={i}><StatLabel>{d.label}</StatLabel><StatValue>{d.value}</StatValue></StatItem>)}</StatsGrid>}
            </CardBody>
          </CardWrapper>
        </Html>
      )}
    </group>
  );
}

// =================================================================
// 🚀 6. Main Viewer Component
// =================================================================

const FullScreenGlbViewer: React.FC<ViewerProps> = ({ models, portalRef }) => {
  const [localModels, setLocalModels] = useState(models);
  const cameraControlsRef = useRef<CameraControls>(null);
  const initialCameraState = useRef<{ position: THREE.Vector3, target: THREE.Vector3, distance: number } | null>(null);
  
  const [isGlobalActive, setIsGlobalActive] = useState(false);
  const [isFixMode, setIsFixMode] = useState(false); 
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null); 
  const [hoveredWarningIndex, setHoveredWarningIndex] = useState<number | null>(null);
  
  const [assignTargetIndex, setAssignTargetIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ title: string, msg: string, type: 'info' | 'success', id: number } | null>(null);

  useEffect(() => { setLocalModels(models); }, [models]);

  const showNotification = (title: string, msg: string, type: 'info' | 'success') => {
    const id = Date.now();
    setNotification({ title, msg, type, id });
    setTimeout(() => setNotification(prev => prev && prev.id === id ? null : prev), 3000);
  };

  const handleAssignStaff = (name: string, pos: string) => {
    if (assignTargetIndex === null) return;
    setLocalModels(prev => prev.map((m, i) => i === assignTargetIndex ? { ...m, isPending: true } : m));
    showNotification("REPORT SENT", `담당자 ${name} ${pos}에게\n장애 리포트를 전달하였습니다.`, "info");
    setAssignTargetIndex(null);
  };

  const handleResolve = (index: number) => {
    showNotification("SYSTEM RESTORED", "조치 완료. 시스템이 정상화되었습니다.\n(Status: NORMAL)", "success");
    setLocalModels(prev => prev.map((m, i) => i === index ? { ...m, warning: false, isPending: false } : m));
  };

  const handleZoomEnter = (targetPos: THREE.Vector3, targetSize: THREE.Vector3) => {
    if (!cameraControlsRef.current) return;
    if (!initialCameraState.current) {
      const pos = new THREE.Vector3(); const target = new THREE.Vector3();
      cameraControlsRef.current.getPosition(pos); cameraControlsRef.current.getTarget(target);
      initialCameraState.current = { position: pos, target: target, distance: pos.distanceTo(target) };
    }
    const currentCamPos = new THREE.Vector3(); cameraControlsRef.current.getPosition(currentCamPos);
    const direction = new THREE.Vector3().subVectors(targetPos, currentCamPos).normalize();
    const newCamPos = targetPos.clone().sub(direction.multiplyScalar(Math.max(currentCamPos.distanceTo(targetPos) * 0.5, targetSize.y * 1.5 + 2)));
    cameraControlsRef.current.setLookAt(newCamPos.x, newCamPos.y, newCamPos.z, targetPos.x, targetPos.y + (targetSize.y * 0.2), targetPos.z, true);
  };

  const resetCameraToInitial = () => {
    if (!cameraControlsRef.current || !initialCameraState.current) return;
    const { position, target } = initialCameraState.current;
    cameraControlsRef.current.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true);
  };

  const handleZoomLeave = () => {
    if (isFixMode) resetCameraToInitial();
    else if (cameraControlsRef.current && initialCameraState.current) {
      const { target, distance } = initialCameraState.current;
      const currentCamPos = new THREE.Vector3(); cameraControlsRef.current.getPosition(currentCamPos);
      const newCamPos = target.clone().add(new THREE.Vector3().subVectors(currentCamPos, target).normalize().multiplyScalar(distance));
      cameraControlsRef.current.setLookAt(newCamPos.x, newCamPos.y, newCamPos.z, target.x, target.y, target.z, true);
    }
  };

  const warningModels = localModels.map((m, i) => ({ ...m, originalIndex: i })).filter(m => m.warning);

  return (
    <FullScreenWrapper>
      
      {/* 🚨 담당자 선택 모달 (외부 클릭 닫기 & 최상위 Z-Index 적용) */}
      {assignTargetIndex !== null && (
        <SelectionOverlay onClick={() => setAssignTargetIndex(null)}>
          <SelectionBox onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: COLOR_RED_STR, margin: '0 0 15px 0', textAlign: 'center', fontSize: '24px' }}>담당자 선택</h3>
            <p style={{ color: '#aaa', margin: '0 0 20px 0', textAlign: 'center' }}>전달할 담당자를 선택하십시오.</p>
            {STAFF_LIST.map(staff => (
              <StaffButton key={staff.id} onClick={() => handleAssignStaff(staff.name, staff.position)}>
                <span style={{ fontWeight: 'bold' }}>{staff.name}</span>
                <span className="pos">{staff.position}</span>
              </StaffButton>
            ))}
            <button 
              onClick={() => setAssignTargetIndex(null)}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', marginTop: '15px', textDecoration: 'underline' }}
            >
              취소 (ESC)
            </button>
          </SelectionBox>
        </SelectionOverlay>
      )}

      {/* 🚨 알림 모달 (외부 클릭 닫기 & 최상위 Z-Index 적용) */}
      {notification && (
        <ModalOverlay onClick={() => setNotification(null)}>
          <ModalBox key={notification.id} $type={notification.type} onClick={(e) => e.stopPropagation()}>
            <ModalIcon $type={notification.type}>
              {notification.type === 'success' 
                ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              }
            </ModalIcon>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ModalTitle $type={notification.type}>{notification.title}</ModalTitle>
              <ModalMessage>{notification.msg}</ModalMessage>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}

      <WarningSidebar>
        {warningModels.map((item) => {
          const title = item.info?.title || "UNKNOWN DEVICE";
          const cause = item.errorDetails?.cause || DEMO_ERROR_DATA[title]?.cause || DEMO_ERROR_DATA["DEFAULT"].cause;
          const solution = item.errorDetails?.solution || DEMO_ERROR_DATA[title]?.solution || DEMO_ERROR_DATA["DEFAULT"].solution;

          return (
            <WarningBox 
              key={item.originalIndex} 
              $active={hoveredWarningIndex === item.originalIndex}
              $isPending={item.isPending}
              onMouseEnter={() => setHoveredWarningIndex(item.originalIndex)}
              onMouseLeave={() => setHoveredWarningIndex(null)}
            >
              <WarningHeader $isPending={item.isPending}>
                <h4>{title}</h4>
                <WarningBadge $isPending={item.isPending}>
                  {item.isPending ? "PENDING" : "WARNING"}
                </WarningBadge>
              </WarningHeader>
              <WarningContent>
                <DetailRow><DetailLabel $isPending={item.isPending}>ROOT CAUSE</DetailLabel><DetailValue>{cause}</DetailValue></DetailRow>
                <DetailRow><DetailLabel $isPending={item.isPending}>PROTOCOL</DetailLabel><DetailValue>{solution}</DetailValue></DetailRow>
              </WarningContent>
              <WarningActions>
                <ActionButton 
                  $variant="notify" 
                  disabled={item.isPending} 
                  onClick={(e) => { e.stopPropagation(); setAssignTargetIndex(item.originalIndex); }}
                >
                  {item.isPending ? "전달 완료" : "담당자 전달"}
                </ActionButton>
                <ActionButton $variant="resolve" onClick={(e) => { e.stopPropagation(); handleResolve(item.originalIndex); }}>
                  조치 완료
                </ActionButton>
              </WarningActions>
            </WarningBox>
          );
        })}
      </WarningSidebar>

      <ButtonGroup>
        <ButtonContainer onMouseEnter={() => { setIsGlobalActive(true); setHoveredBtn('ALL'); }} onMouseLeave={() => { setIsGlobalActive(false); setHoveredBtn(null); }}>
          <Tooltip $show={hoveredBtn === 'ALL'}><span className="title">GLOBAL VIEW</span><span className="desc">모든 장비 상태 보기</span></Tooltip>
          <CyberButton $active={isGlobalActive}><span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: isGlobalActive ? '#ff003c' : '#ccc', boxShadow: isGlobalActive ? '0 0 5px red' : 'none' }}></span>ALL</CyberButton>
        </ButtonContainer>
        <ButtonContainer onMouseEnter={() => setHoveredBtn('RESET')} onMouseLeave={() => setHoveredBtn(null)}>
          <Tooltip $show={hoveredBtn === 'RESET'}><span className="title">CAMERA RESET</span><span className="desc">시점 즉시 초기화</span></Tooltip>
          <CyberButton onClick={resetCameraToInitial}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>RESET</CyberButton>
        </ButtonContainer>
        <ButtonContainer onMouseEnter={() => setHoveredBtn('FIX')} onMouseLeave={() => setHoveredBtn(null)}>
          <Tooltip $show={hoveredBtn === 'FIX'}><span className="title">AUTO RETURN</span><span className="desc">{isFixMode ? 'ON: 자동 복귀 모드' : 'OFF: 앵글 유지 모드'}</span></Tooltip>
          <CyberButton $active={isFixMode} onClick={() => setIsFixMode(!isFixMode)}>
            {isFixMode 
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
            } FIX
          </CyberButton>
        </ButtonContainer>
      </ButtonGroup>

      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }} dpr={[1, 2]}> 
        <color attach="background" args={['#050505']} />
        <Suspense fallback={<Html center style={{color: '#ff003c', fontFamily: 'monospace'}}>INITIALIZING...</Html>}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <Environment preset="city" />
          
          {localModels.map((model, index) => (
            model.type === 'background' ? <BackgroundGlbModel key={`bg-${index}`} {...model} /> : 
            <InteractiveGlbModel key={`int-${index}`} {...model} isPending={model.isPending} onZoomEnter={handleZoomEnter} onZoomLeave={handleZoomLeave} forceHover={isGlobalActive} portalRef={portalRef} warning={model.warning} isExternalHovered={hoveredWarningIndex === index} />
          ))}
          <CameraControls ref={cameraControlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} dollyToCursor={false} smoothTime={1.2} />
        </Suspense>
      </Canvas>
    </FullScreenWrapper>
  );
}

const DynamicFullScreenGlbViewer = dynamic<ViewerProps>(() => Promise.resolve(FullScreenGlbViewer), { ssr: false });
export default DynamicFullScreenGlbViewer;