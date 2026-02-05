"use client";

import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { 
  FaArrowRightToBracket, 
  FaArrowRightFromBracket, 
  FaListCheck,
  FaArrowsRotate
} from "react-icons/fa6";

// ==============================
// Types & Helpers
// ==============================

interface LogData {
  id: number;
  time: string;
  type: "in" | "out";
  item: string;
  worker: string;
}

// 입고율 + 출고율 = 100% (예시 데이터)
const INBOUND_RATE = 76;
const OUTBOUND_RATE = 100 - INBOUND_RATE;

const WORKERS = ["김철수", "이영희", "박민수", "최관리", "정담당", "강작업"];
const ITEMS = ["A-Frame #01", "B-Frame #12", "C-Frame #05", "D-Frame #99", "A-Frame #02", "B-Frame #33"];

// ==============================
// Component
// ==============================
const DryingRoomInfoPanel: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [logs, setLogs] = useState<LogData[]>([]);

  // ✅ 데이터 생성 로직 (현재 시간 기준)
  useEffect(() => {
    setLoaded(true);
    generateRealtimeLogs();
  }, []);

  const generateRealtimeLogs = () => {
    const now = new Date();
    const newLogs: LogData[] = [];

    // 과거 15개의 로그 생성
    for (let i = 0; i < 15; i++) {
      // 3분 ~ 15분 사이 랜덤 간격으로 시간 차감
      const randomGap = Math.floor(Math.random() * 12 + 3); 
      now.setMinutes(now.getMinutes() - randomGap);

      // 시간 포맷팅 (HH:mm:ss)
      const timeString = now.toLocaleTimeString('ko-KR', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      const type = Math.random() > 0.4 ? "in" : "out"; // 입고가 조금 더 많게

      newLogs.push({
        id: i,
        time: timeString,
        type: type,
        item: ITEMS[Math.floor(Math.random() * ITEMS.length)],
        worker: WORKERS[Math.floor(Math.random() * WORKERS.length)],
      });
    }

    setLogs(newLogs);
  };

  return (
    <PanelWrapper>
      {/* 헤더 */}
      <HeaderSection>
        <Title>건조실 현황</Title>
        <RefreshButton onClick={generateRealtimeLogs} title="데이터 새로고침">
          <FaArrowsRotate />
        </RefreshButton>
      </HeaderSection>
      
      {/* 1. 상단 통계 카드 (가독성 강화) */}
      <StatsContainer>
        {/* 입고 카드 */}
        <StatCard $color="rgba(59, 130, 246, 0.08)" $borderColor="rgba(59, 130, 246, 0.3)">
          <StatHeader>
            <IconBadge $bg="#3b82f6">
              <FaArrowRightToBracket />
            </IconBadge>
            <StatLabel>금일 입고율</StatLabel>
          </StatHeader>
          <BigNumber $color="#60a5fa">{INBOUND_RATE}%</BigNumber>
        </StatCard>

        {/* 출고 카드 */}
        <StatCard $color="rgba(16, 185, 129, 0.08)" $borderColor="rgba(16, 185, 129, 0.3)">
          <StatHeader>
            <IconBadge $bg="#10b981">
              <FaArrowRightFromBracket />
            </IconBadge>
            <StatLabel>금일 출고율</StatLabel>
          </StatHeader>
          <BigNumber $color="#34d399">{OUTBOUND_RATE}%</BigNumber>
        </StatCard>
      </StatsContainer>

      {/* 통합 그래프 바 */}
      <ChartSection>
        <CombinedBarTrack>
          <BarSegment 
            $width={INBOUND_RATE} 
            $color="#3b82f6" 
            $loaded={loaded}
          >
            {INBOUND_RATE > 10 && <BarLabel>IN ({INBOUND_RATE}%)</BarLabel>}
          </BarSegment>

          <BarSegment 
            $width={OUTBOUND_RATE} 
            $color="#10b981" 
            $loaded={loaded}
          >
            {OUTBOUND_RATE > 10 && <BarLabel>OUT ({OUTBOUND_RATE}%)</BarLabel>}
          </BarSegment>
        </CombinedBarTrack>
      </ChartSection>

      {/* 2. 하단: 로그 테이블 (가독성 대폭 개선) */}
      <LogSection>
        <SectionHeader>
          <HeaderTitle>
            <FaListCheck /> 
            <span>실시간 입/출고 이력</span>
          </HeaderTitle>
          <LiveBadge>
            <span className="dot"></span> Live
          </LiveBadge>
        </SectionHeader>
        
        <TableContainer>
          <LogTable>
            <thead>
              <tr>
                <th style={{ width: "22%" }}>시간</th>
                <th style={{ width: "18%" }}>구분</th>
                <th style={{ width: "40%" }}>품목명</th>
                <th style={{ width: "20%" }}>담당</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="time">{log.time}</td>
                  <td>
                    <StatusBadge $type={log.type}>
                      {log.type === "in" ? "입고" : "출고"}
                    </StatusBadge>
                  </td>
                  <td className="item">{log.item}</td>
                  <td className="worker">{log.worker}</td>
                </tr>
              ))}
            </tbody>
          </LogTable>
        </TableContainer>
      </LogSection>
    </PanelWrapper>
  );
};

export default DryingRoomInfoPanel;

// ==============================
// Animations
// ==============================
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==============================
// Styles
// ==============================

const PanelWrapper = styled.div`
  width: 100%;
  height: 100%;
  /* 눈이 편안한 딥 다크 블루 배경 */
  background: #111827; 
  border-radius: 16px;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid #1f2937;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: #f9fafb;
  letter-spacing: -0.5px;
`;

const RefreshButton = styled.button`
  background: #1f2937;
  border: 1px solid #374151;
  color: #9ca3af;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    background: #374151;
    color: #fff;
    transform: rotate(90deg);
  }
`;

/* --- Stats Grid --- */
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const StatCard = styled.div<{ $color: string; $borderColor: string }>`
  background: ${props => props.$color};
  border: 1px solid ${props => props.$borderColor};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBadge = styled.div<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: ${props => props.$bg};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const StatLabel = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #e5e7eb;
  white-space: nowrap;
`;

const BigNumber = styled.div<{ $color: string }>`
  font-size: 46px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  text-align: right;
  text-shadow: 0 0 20px ${props => props.$color}40; /* 네온 글로우 효과 */
`;

/* --- Chart Section --- */
const ChartSection = styled.div`
  width: 100%;
`;

const CombinedBarTrack = styled.div`
  width: 100%;
  height: 50px; /* 바 두께 확대 */
  background: #1f2937;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
  border: 1px solid #374151;
`;

const BarSegment = styled.div<{ $width: number; $color: string; $loaded: boolean }>`
  height: 100%;
  width: ${props => (props.$loaded ? props.$width : 0)}%;
  background: ${props => props.$color};
  background: linear-gradient(180deg, ${props => props.$color} 0%, ${props => props.$color}cc 100%);
  transition: width 1.5s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:not(:last-child) {
    border-right: 2px solid rgba(0,0,0,0.2);
  }
`;

const BarLabel = styled.span`
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  white-space: nowrap;
`;

/* --- Log Section --- */
const LogSection = styled.div`
  flex: 1;
  min-height: 0;
  background: #1f2937;
  border-radius: 16px;
  border: 1px solid #374151;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideUp} 0.6s ease-out;
`;

const SectionHeader = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #252f3f; 
  border-bottom: 1px solid #374151;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #f3f4f6;

  svg {
    color: #9ca3af;
  }
`;

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(239, 68, 68, 0.3);

  .dot {
    width: 8px;
    height: 8px;
    background-color: #ef4444;
    border-radius: 50%;
    animation: ${pulse} 2s infinite;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 4px;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const LogTable = styled.table`
  width: 100%;
  border-collapse: separate; /* border-collapse: separate로 변경하여 border-spacing 적용 가능하게 함 */
  border-spacing: 0; /* 셀 간격 제거 */
  font-size: 16px;
  text-align: left;

  thead {
    position: sticky;
    top: 0;
    background: #111827; 
    z-index: 10;
  }

  th {
    padding: 16px 20px; /* 패딩 확대 */
    color: #9ca3af;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    border-bottom: 2px solid #374151;
  }

  td {
    padding: 16px 20px; /* 패딩 확대 */
    border-bottom: 1px solid #374151;
    color: #e5e7eb;
    white-space: nowrap; 
  }

  /* 홀수/짝수 행 배경 구분 (가독성 향상) */
  tbody tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.02);
  }

  tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.05); /* 호버 시 밝게 */
  }

  .time {
    font-family: 'Consolas', 'Monaco', monospace; /* 등폭 폰트 사용 */
    color: #d1d5db;
    font-weight: 500;
    font-size: 15px;
  }

  .item {
    font-weight: 700;
    color: #fff;
  }

  .worker {
    color: #9ca3af;
  }
`;

const StatusBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  min-width: 50px;
  
  /* 입고 스타일 */
  ${props => props.$type === 'in' && css`
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.1);
  `}

  /* 출고 스타일 */
  ${props => props.$type === 'out' && css`
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.1);
  `}
`;