"use client";

import { useState, Suspense } from "react"; // Suspense 추가
import InventoryStatusPanel from "@/components/panel/inventory-status-panel";
import styled, { keyframes } from "styled-components";
import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";

const AssemblyLineHome = () => {
  // 비디오 로딩 상태 관리
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleVideoLoadComplete = () => {
    setIsVideoLoaded(true);
  };

  return (
    <Container>
      <AutoLoadingOverlay />
      <Wrapper>
        {/* 1. 배경 비디오 */}
        <VideoElement
          autoPlay
          loop
          muted
          playsInline
          onCanPlayThrough={handleVideoLoadComplete}
        >
          <source src="/videos/20251029_152120_162126.mp4" type="video/mp4" />
        </VideoElement>

        {/* 2. 로딩 전까지 보여줄 스켈레톤 */}
        {!isVideoLoaded && <AbsoluteSkeletonUI />}
      </Wrapper>

      {/* ✅ 에러 해결 핵심: useSearchParams를 사용하는 컴포넌트를 Suspense로 감싸기 */}
      <Suspense fallback={<PanelFallback />}>
        <InventoryStatusPanel type={"assembly"} />
      </Suspense>
    </Container>
  );
};

export default AssemblyLineHome;

// ───────────────────── 스타일 정의 ─────────────────────

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  color: white;
  gap: 30px;
  /* 네비게이션 바 높이만큼 여백이 필요한 경우 추가 */
  /* padding-top: 98px; */
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;
  background-color: #051328;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

const skeletonPulse = keyframes`
  0% { background-color: #1b2940; }
  50% { background-color: #2a3b55; }
  100% { background-color: #1b2940; }
`;

const AbsoluteSkeletonUI = styled.div`
  width: 100%;
  height: 100%;
  animation: ${skeletonPulse} 1.5s infinite ease-in-out;
  border-radius: 12px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

// 패널이 로딩 중일 때 보여줄 임시 UI
const PanelFallback = styled.div`
  width: 400px; /* 기존 패널 너비에 맞게 조절 */
  height: 100%;
  background: rgba(5, 19, 40, 0.5);
  border-radius: 12px;
  animation: ${skeletonPulse} 1.5s infinite ease-in-out;
`;