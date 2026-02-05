"use client"; // Next.js 클라이언트 컴포넌트 명시

import React from "react";
import styled from "styled-components";
// ✅ 방금 수정한 패널 컴포넌트 import (경로 확인!)
import FacilitiesTypePanel from "./panel/facilities-type-panel"; 
import CctvPlayer from "./cctv-player";

// ───────────────────── 스타일 정의 ─────────────────────

const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  background: #051328;
  color: #e6edf7;
  font-family: "Pretendard";
  padding: 20px;
  box-sizing: border-box;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2열 */
  grid-template-rows: 1fr 1fr;    /* 2행 */
  gap: 20px;
  width: 100%;
  height: 100%;
`;

const FacilityCard = styled.div`
  background: #1C3151;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #1b2940;
  padding: 14px;
`;

const CardHeader = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: white;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 15px;
`;

const VideoContainer = styled.div`
  flex: 1.2;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
`;

// ───────────────────── 개별 설비 아이템 컴포넌트 ─────────────────────

const FacilityItem = ({ title, wsUrl }: { title: string; wsUrl: string }) => {
  return (
    <FacilityCard>
      <CardHeader>{title}</CardHeader>
      <ContentWrapper>
        {/* CCTV 플레이어 영역 */}
        <VideoContainer>
          <CctvPlayer url={wsUrl} label={title} />
        </VideoContainer>
        
        {/* ✅ 우측 데이터 패널 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* 🔥 여기에 machineId로 title("20호기", "11호기" 등)을 전달합니다. */}
          <FacilitiesTypePanel machineId={title} />
        </div>
      </ContentWrapper>
    </FacilityCard>
  );
};

// ───────────────────── 메인 대시보드 ─────────────────────

const FacilitiesDashboard: React.FC = () => {
  const facilities = [
    { id: "20호기", src: "ws://1.254.24.170:8128" },
    { id: "11호기", src: "ws://1.254.24.170:8125" },
    { id: "13호기", src: "ws://1.254.24.170:8126" },
    { id: "14호기", src: "ws://1.254.24.170:8127" },
  ];

  return (
    <PageWrapper>
      <VideoGrid>
        {facilities.map((f) => (
          <FacilityItem key={f.id} title={f.id} wsUrl={f.src} />
        ))}
      </VideoGrid>
    </PageWrapper>
  );
};

export default FacilitiesDashboard;