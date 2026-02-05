"use client";

import React from "react";
import styled from "styled-components";
import { MOCK_STOCK_SUMMARIES, MOCK_STOCK_HISTORY } from "@/data/temp-data";

/* =========================
 * Explicit Types
 * =======================*/

interface StockSummary {
  id: string;
  label: string;
  value?: number;
  stock?: number;
  count?: number;
  unit: string;
}

// 시안 이미지의 테이블 컬럼 구조에 맞춘 타입 정의
interface StockHistory {
  id: string;
  datetime: string;      // 날짜/시간
  materialLabel: string;  // 자재 투입 (예: ABS -> 1번 호퍼)
  workDescription: string; // 작업 내용
  workIdCode: string;     // ID 코드
}

/* =========================
 * Styled Components (QHD 최적화)
 * =======================*/

const PanelWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* 1. 상단 재고 현황 카드 그리드 */
const StockCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 15px;
`;

const StockCard = styled.div`
  background: #36527D;
  border: 1px solid #36527d;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 130px;
`;

const MaterialName = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Label = styled.span`
  font-size: 24px;
  color: #ccd3db;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-size: 27px;
  font-weight: 600;
  letter-spacing: -2px;
`;

/* 2. 하단 작업 이력 테이블 영역 */
const HistoryTableWrapper = styled.div`
  flex: 1;
  background: #0e1f38;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TableScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #36527d; border-radius: 3px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  color: #e6edf7;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  background: #12243e;
  padding: 12px 15px;
  text-align: left;
  color: #adb4bd;
  font-weight: 600;
  border-bottom: 1px solid #1e293b;
  z-index: 10;
`;

const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #1b2940;
  white-space: nowrap;
  
  &:last-child {
    /* font-family: "SF Mono", monospace; */
    /* color: #94a3b8; */
    width: 260px;
  }
`;

const Tr = styled.tr`
  &:hover { background: rgba(98, 140, 255, 0.1); }
`;

/* =========================
 * Component
 * =======================*/

const WarehouseStockPanel: React.FC = () => {
  const stockData = MOCK_STOCK_SUMMARIES as StockSummary[];
  const historyData = MOCK_STOCK_HISTORY as StockHistory[];

  return (
    <PanelWrapper>
      {/* 상단: 재고 현황 카드 */}
      <StockCardGrid>
        {stockData.map((item) => (
          <StockCard key={item.id}>
            <MaterialName>{item.label}</MaterialName>
            <InfoRow>
              <Label>현 재고 수량</Label>
              <QuantityValue>
                <span className="num">{(item.value ?? item.stock ?? 0).toLocaleString()}</span>
                <span className="unit">{item.unit}</span>
              </QuantityValue>
            </InfoRow>
          </StockCard>
        ))}
      </StockCardGrid>
    </PanelWrapper>
  );
};

export default WarehouseStockPanel;