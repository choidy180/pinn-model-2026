"use client";

import React from "react";
import styled from "styled-components";
import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";
import LiveInfiniteLogStream from "@/components/components/live-log-stream";
import CctvPlayer from "@/components/cctv-player";

// ───────────────────── 데이터 정의 ─────────────────────

// 포장 공정용 CCTV 4개 데이터 (포트 번호는 실제 환경에 맞춰 수정하세요)
const PACKING_CCTV_LIST = [
  { id: "Packing-1", url: "ws://1.254.24.170:8131" },
  { id: "Packing-2", url: "ws://1.254.24.170:8132" },
  { id: "Packing-3", url: "ws://1.254.24.170:8133" },
  { id: "Packing-4", url: "ws://1.254.24.170:8134" },
];

const PackingHome = () => {
  return (
    <Container>
      <AutoLoadingOverlay />
      
      {/* 좌측: 4분할 CCTV 영역 */}
      <Wrapper>
        <CctvGrid>
          {PACKING_CCTV_LIST.map((cam) => (
            <CctvBox key={cam.id}>
              <CctvPlayer 
                url={cam.url} 
                label={cam.id} 
              />
            </CctvBox>
          ))}
        </CctvGrid>
      </Wrapper>

      {/* 우측: 로그 스트림 (기존 유지) */}
      <LiveInfiniteLogStream />
    </Container>
  )
}

export default PackingHome;

// ───────────────────── 스타일 정의 ─────────────────────

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding-top: 70px; /* 헤더 높이 */
  color: white;
  padding: 30px;
  box-sizing: border-box;
`;

const Wrapper = styled.div`
  flex: 1; /* 남은 공간 차지 */
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background-color: #051328;
  border: 1px solid #1b2940;
`;

/* 4분할 그리드 레이아웃 */
const CctvGrid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2열 */
  grid-template-rows: 1fr 1fr;    /* 2행 */
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
`;

/* 개별 CCTV 박스 (비율 유지 및 검은 배경) */
const CctvBox = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  border-radius: 8px;
  border: 1px solid #334;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
`;