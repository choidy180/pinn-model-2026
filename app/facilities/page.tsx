"use client";

import React, { useState } from "react";
import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";
import InventoryStatusPanel from "@/components/panel/inventory-status-panel";
import styled, { keyframes } from "styled-components";

const Facilities = () => {
  // 비디오 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  // 비디오 데이터 로딩 완료 시 호출
  const handleLoadedData = () => {
    setIsLoading(false);
  };

  return (
    <Container>
      <AutoLoadingOverlay />
      
      <VideoWrapper>
        {/* 로딩 중일 때만 스켈레톤 표시 */}
        {isLoading && <SkeletonFrame />}
        
        <VideoElement
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          $isLoading={isLoading}
          onLoadedData={handleLoadedData}
        >
          {/* ⚠️ 실제 사용할 동영상 경로로 변경해주세요 */}
          <source src="/videos/[SHANA]01(192.168.220.101)_20251107_112537_115536.mp4" type="video/mp4" />
          비디오를 재생할 수 없습니다.
        </VideoElement>
      </VideoWrapper>

      <InventoryStatusPanel type="facilities-type" />
    </Container>
  );
};

export default Facilities;

// ───────────────────── 스타일 정의 ─────────────────────

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 70px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  gap: 30px;
  
  color: white;
`;

const VideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative; /* 스켈레톤(absolute) 배치를 위해 필수 */
  border-radius: 6px;
  overflow: hidden;
  background-color: #000; /* 로딩 전 배경 */
`;

// 스켈레톤 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// 스켈레톤 UI
const SkeletonFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  
  background: linear-gradient(
    90deg,
    #172641 25%,
    #2a3e5c 50%,
    #172641 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

// 비디오 태그
const VideoElement = styled.video<{ $isLoading?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  
  /* 로딩 완료 전까지 숨김 처리 (자연스러운 전환을 위해 opacity 사용) */
  opacity: ${({ $isLoading }) => ($isLoading ? 0 : 1)};
  transition: opacity 0.3s ease-in;
`;