"use client";

import React, { useState, Suspense } from "react"; // Suspense 추가
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
          <source src="/videos/[SHANA]01(192.168.220.101)_20251107_112537_115536.mp4" type="video/mp4" />
          비디오를 재생할 수 없습니다.
        </VideoElement>
      </VideoWrapper>

      {/* ✅ useSearchParams 에러 해결을 위한 Suspense 적용 */}
      <Suspense fallback={<PanelFallback />}>
        <InventoryStatusPanel type="facilities-type" />
      </Suspense>
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
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background-color: #000;
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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

const VideoElement = styled.video<{ $isLoading?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: ${({ $isLoading }) => ($isLoading ? 0 : 1)};
  transition: opacity 0.3s ease-in;
`;

// ✅ 패널 로딩 중에 보여줄 Fallback 스타일
const PanelFallback = styled.div`
  width: 450px; /* InventoryStatusPanel의 기본 너비에 맞춰 조정 */
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    #172641 25%,
    #2a3e5c 50%,
    #172641 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;