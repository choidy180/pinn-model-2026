"use client";

import React from "react";
import styled, { css } from "styled-components";
import CctvPlayer from "../cctv-player";

// ───────────────────── 글로벌 레이아웃 & 테마 ─────────────────────

const DashboardContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #0b1221; /* 이미지의 Deep Dark Navy 배경 */
  color: #ffffff;
  font-family: "Pretendard", "Malgun Gothic", sans-serif;
  display: flex;
  padding: 24px; /* 전체 여백 */
  gap: 20px;     /* 좌우 섹션 간격 */
  box-sizing: border-box;
  overflow: hidden;
`;

// ───────────────────── 좌측: 자재 재고 & CCTV ─────────────────────

const LeftSection = styled.div`
  flex: 1.15; /* 좌측이 우측보다 아주 약간 더 넓음 */
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-width: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1C3151;
  border-radius: 15px;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: -0.5px;
`;

/* 1. 재고 배지 */
const BadgeGroup = styled.div`
  display: flex;
  gap: 14px;
`;

const StockBadge = styled.div<{ $bg: string }>`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #294062;

  /* 좌측 라벨 (ABS, PP...) */
  .label {
    color: #ffffff;
    font-size: 2rem;
    font-weight: 800;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2B7FFF;
  }

  /* 우측 값 (24 EA...) */
  .value {
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    border: 1px solid #374151;
    border-left: none;
  }

  .count {
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
  }

  .unit {
    font-size: 1.6rem;
    color: #9ca3af;
    font-weight: 500;
  }
`;

/* 2. CCTV 그리드 */
const CctvGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  min-height: 0;
`;

// ───────────────────── 우측: 건조기 현황 ─────────────────────

const RightSection = styled.div`
  flex: 0.85;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-width: 440px;
  background-color: #1C3151;
  border-radius: 15px;
  padding: 20px;
`;

const LiveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(30, 41, 59, 0.5);
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid #334155;

  .dot {
    width: 10px;
    height: 10px;
    background-color: #ef4444;
    border-radius: 50%;
    box-shadow: 0 0 8px #ef4444;
  }

  span {
    font-size: 1rem;
    color: #cbd5e1;
    font-weight: 500;
  }
`;

const DryerGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2열 */
  grid-template-rows: repeat(4, 1fr); /* 4행 */
  gap: 12px;
  min-height: 0;
`;

/* 3. 건조기 카드 (수정됨: status prop 기반 스타일링) */
// $status: "normal" | "warning" | "danger"
const Card = styled.div<{ $status: string }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 20px;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  ${({ $status }) => {
    switch ($status) {
      case "danger": // 위험 (기존 빨강)
        return css`
          background: linear-gradient(135deg, rgba(69, 10, 10, 0.65) 0%, rgba(30, 15, 15, 0.85) 100%);
          border: 1px solid #ef4444;
          box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.1);
        `;
      case "warning": // 주의 (신규 주황)
        return css`
          /* 주황색 계열의 어두운 그라디언트 */
          background: linear-gradient(135deg, rgba(75, 30, 10, 0.65) 0%, rgba(35, 20, 15, 0.85) 100%);
          border: 1px solid #f97316; /* Orange-500 */
          box-shadow: inset 0 0 20px rgba(249, 115, 22, 0.1);
        `;
      case "normal": // 정상 (기존 네이비)
      default:
        return css`
          background: #253E65;
          border: 1px solid #5A79A8;
        `;
    }
  }}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const MachineName = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
`;

/* 상태 배지 (정상/주의/위험) */
const StatusTag = styled.span<{ $status: string }>`
  font-size: 1rem;
  font-weight: 700;
  padding: 4px 20px;
  border-radius: 15px;
  letter-spacing: -0.3px;

  ${({ $status }) => {
    switch ($status) {
      case "danger":
        return css`
          color: #ef4444; border: 1px solid #ef4444; background-color: rgba(239, 68, 68, 0.1);
        `;
      case "warning":
        return css`
          color: #f97316; border: 1px solid #f97316; background-color: rgba(249, 115, 22, 0.1);
        `;
      case "normal":
      default:
        return css`
          color: #10b981; border: 1px solid #10b981; background-color: rgba(16, 185, 129, 0.1);
        `;
    }
  }}
`;

const CardBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

// $statusType을 받아서 텍스트 색상 결정
const InfoItem = styled.div<{ $align?: string; $statusType?: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  
  align-items: ${({ $align }) => 
    $align === "center" ? "center" : $align === "right" ? "flex-end" : "flex-start"};

  label {
    font-size: 1.4rem;
    color: #94a3b8;
    font-weight: 500;
  }

  span {
    font-size: 1.8rem;
    line-height: 1.8rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    /* 상태에 따른 현재 온도 색상 변경 */
    color: ${({ $statusType }) => {
      if ($statusType === "danger") return "#ef4444"; // 빨강
      if ($statusType === "warning") return "#f97316"; // 주황
      return "#ffffff"; // 흰색 (정상)
    }};
  }
`;

// ───────────────────── 데이터 (수정됨) ─────────────────────

const DRYER_DATA = [
  { id: 1, name: "#01 건조기", material: "PC+ABS", setTemp: 100, curTemp: 100, status: "normal" },
  { id: 2, name: "#02 건조기", material: "TPE", setTemp: 75, curTemp: 75, status: "normal" },
  // 기존 danger를 warning으로 변경
  { id: 3, name: "#03 건조기", material: "ABS", setTemp: 80, curTemp: 85, status: "warning" },
  { id: 4, name: "#04 건조기", material: "PMMA", setTemp: 75, curTemp: 75, status: "normal" },
  // 기존 normal을 danger로 변경 (예시)
  { id: 5, name: "#05 건조기", material: "PC+ABS", setTemp: 100, curTemp: 115, status: "danger" },
  { id: 6, name: "#06 건조기", material: "ABS", setTemp: 80, curTemp: 80, status: "normal" },
  { id: 7, name: "#07 건조기", material: "복합 PP", setTemp: 75, curTemp: 75, status: "normal" },
  { id: 8, name: "#08 건조기", material: "PC+ABS", setTemp: 100, curTemp: 100, status: "normal" },
];

export default function PerfectDashboard() {
  return (
    <DashboardContainer>
      
      {/* 1. 좌측 영역 */}
      <LeftSection>
        <HeaderRow style={{padding: "20px"}}>
          <Title>실시간 자재 재고</Title>
          <BadgeGroup>
            <StockBadge $bg="#3b82f6"> {/* Blue */}
              <div className="label">M540</div>
              <div className="value">
                <span className="count">24</span>
                <span className="unit">EA</span>
              </div>
            </StockBadge>
            <StockBadge $bg="#3b82f6"> {/* Blue */}
              <div className="label">TRC2010-9975</div>
              <div className="value">
                <span className="count">12</span>
                <span className="unit">EA</span>
              </div>
            </StockBadge>
            <StockBadge $bg="#60a5fa"> {/* Light Blue */}
              <div className="label">1161-HV</div>
              <div className="value">
                <span className="count">25</span>
                <span className="unit">EA</span>
              </div>
            </StockBadge>
          </BadgeGroup>
        </HeaderRow>

        {/* 빈 박스 그리드 */}
        <CctvGrid>
          <CctvPlayer 
            url="ws://1.254.24.170:8121" 
            label="CAM 01 (외부망)" 
          />
          <CctvPlayer 
            url="ws://1.254.24.170:8122" 
            label="CAM 02" 
          />
          <CctvPlayer 
            url="ws://1.254.24.170:8123" 
            label="CAM 03" 
          />
          <CctvPlayer 
            url="ws://1.254.24.170:8124" 
            label="CAM 04" 
          />
        </CctvGrid>
      </LeftSection>

      {/* 2. 우측 영역 */}
      <RightSection>
        <HeaderRow>
          <Title>건조기 가동 현황</Title>
          <LiveStatus>
            <div className="dot" />
            <span>실시간</span>
          </LiveStatus>
        </HeaderRow>

        <DryerGrid>
          {DRYER_DATA.map((item) => {
            // 상태에 따른 라벨 텍스트 결정
            let statusLabel = "정상";
            if (item.status === "danger") statusLabel = "위험";
            else if (item.status === "warning") statusLabel = "주의";

            return (
              // $isDanger boolean 대신 $status string 전달
              <Card key={item.id} $status={item.status}>
                <CardHeader>
                  <MachineName>{item.name}</MachineName>
                  <StatusTag $status={item.status}>
                    {statusLabel}
                  </StatusTag>
                </CardHeader>

                <CardBody>
                  <InfoItem>
                    <label>투입소재</label>
                    <span>{item.material}</span>
                  </InfoItem>
                  <InfoItem $align="center">
                    <label>설정온도</label>
                    <span>{item.setTemp}℃</span>
                  </InfoItem>
                  {/* 현재온도 색상 변경을 위해 status 전달 */}
                  <InfoItem $align="right" $statusType={item.status}>
                    <label>현재온도</label>
                    <span>{item.curTemp}℃</span>
                  </InfoItem>
                </CardBody>
              </Card>
            );
          })}
        </DryerGrid>
      </RightSection>

    </DashboardContainer>
  );
}