"use client";

import { useState } from "react";
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
      <AutoLoadingOverlay/>
      <Wrapper>
        {/* 1. 배경 비디오 */}
        <VideoElement
          autoPlay
          loop
          muted
          playsInline
          onCanPlayThrough={handleVideoLoadComplete}
        >
          {/* 실제 비디오 경로로 수정 필요 */}
          <source src="/videos/20251029_152120_162126.mp4" type="video/mp4" />
        </VideoElement>

        {/* 2. 로딩 전까지 보여줄 스켈레톤 (비디오 로딩 완료 시 제거) */}
        {!isVideoLoaded && <AbsoluteSkeletonUI />}
      </Wrapper>
      <InventoryStatusPanel type={"assembly"}/>
    </Container>
  )
}

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
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative; /* 자식 요소 absolute 배치의 기준 */

  display: flex;
  justify-content: center;
  align-items: center;
  
  overflow: hidden;
  border-radius: 12px;
  background-color: #051328;
`

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

// ✅ 스켈레톤 애니메이션
const skeletonPulse = keyframes`
  0% { background-color: #1b2940; }
  50% { background-color: #2a3b55; }
  100% { background-color: #1b2940; }
`;

// ✅ 기존 SkeletonUI에 위치 속성(absolute) 추가
const AbsoluteSkeletonUI = styled.div`
  width: 100%;
  height: 100%;
  animation: ${skeletonPulse} 1.5s infinite ease-in-out;
  border-radius: 12px;
  
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2; /* 비디오보다 위에 위치 */
`;