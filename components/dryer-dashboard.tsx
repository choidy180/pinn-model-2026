"use client";

import React from "react";
import styled from "styled-components";
import InventoryStatusPanel from "./panel/inventory-status-panel";
import CctvPlayer from "./cctv-player";
import SituationStatusPanel from "./panel/situation-status-panel";

// ───────────────────── 데이터 정의 ─────────────────────

/* [체크 포인트] 
  PerfectDashboard(작동하는 코드)에서는 포트가 8121~8124였습니다.
  만약 아래 포트(8125~8128)에서 영상이 안 나온다면, 
  실제 송출 중인 포트 번호(예: 8121 등)로 변경해야 합니다.
*/
const CCTV_LIST = [
  { id: "20호기", url: "ws://1.254.24.170:8129" },
  { id: "11호기", url: "ws://1.254.24.170:8135" },
  { id: "13호기", url: "ws://1.254.24.170:8136" },
  { id: "14호기", url: "ws://1.254.24.170:8130" },
];

// ───────────────────── 스타일 정의 ─────────────────────

const PageWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 70px); /* 헤더 제외 높이 */
  background: #051328;
  color: #e6edf7;
  font-family: "Pretendard";
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-top: 70px;
`;

const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  gap: 30px;
  box-sizing: border-box;
  min-height: 0; /* Flex 자식 요소 오버플로우 방지 */
`;

/* 좌측 CCTV 영역 스타일 (PerfectDashboard 구조 차용) */
const LeftSection = styled.div`
  flex: 1; 
  height: 100%;
  background-color: #051328;
  border-radius: 12px;
  border: 1px solid #1b2940;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

/* 2x2 그리드 */
const CctvGrid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
`;

/* 개별 CCTV 감싸는 박스 (비율 유지 및 배경) */
const CctvBox = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  border-radius: 6px;
  border: 1px solid #334;
  overflow: hidden;
`;

// ───────────────────── 메인 컴포넌트 ─────────────────────

const DryerDashboard: React.FC = () => {
  return (
    <PageWrapper>
      <ContentContainer>
        
        {/* 1. 좌측: CCTV 4분할 화면 */}
        <LeftSection>
          <CctvGrid>
            {CCTV_LIST.map((cam) => (
              <CctvBox key={cam.id}>
                <CctvPlayer 
                  url={cam.url} 
                  label={cam.id} 
                />
              </CctvBox>
            ))}
          </CctvGrid>
        </LeftSection>

        {/* 2. 우측: 재고 현황 패널 (고정) */}
        <SituationStatusPanel />

      </ContentContainer>
    </PageWrapper>
  );
};

export default DryerDashboard;