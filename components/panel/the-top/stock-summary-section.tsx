/* =========================
 * Types & mock data
 * =======================*/

import { FaCircleChevronRight } from "react-icons/fa6";
import styled from "styled-components";
import React from "react";

// --- 1. 타입 정의 (요청하신 내용) ---

/**
 * 개별 원자재의 재고 정보
 */
export interface MaterialStockInfo {
    /** 현재 재고 수량 */
    현재고수량: number;
}

/**
 * 창고 내 모든 원자재의 목록 및 상세 재고 정보
 * (Key는 원자재 이름, Value는 MaterialStockInfo)
 */
export interface MaterialList {
    [key: string]: MaterialStockInfo;
}

/**
 * 🏭 특정 창고의 전체 재고 현황 레코드
 */
export interface WarehouseStockRecord {
    /** 데이터 기록 시간 */
    timestamp: string;
    /** 창고 고유 ID */
    warehouseId: string;
    /** 창고 이름 */
    warehouseName: string;
    /** 총 원자재 종류 수 */
    totalMaterials: number;
    /** 원자재별 재고 상세 정보 */
    materials: MaterialList;
}


// --- 2. Mock 데이터 (요청하신 내용) ---

/**
 * 🧪 원자재 창고 재고 현황 Mock 데이터
 */
export const MOCK_WAREHOUSE_STOCK_RECORD: WarehouseStockRecord = {
    "timestamp": "2024-12-09 14:50:00",
    "warehouseId": "WH-RAW-01",
    "warehouseName": "원자재 창고",
    "totalMaterials": 3,
    
    "materials": {
        "ABS": {
            "현재고수량": 2
        },
        "PP": {
            "현재고수량": 12
        },
        "PMMA": {
            "현재고수량": 24
        }
    }
};

// --- 3. 컴포넌트 및 로직 ---

// NOTE: 기존 StockSummarySectionProps 대신 WarehouseStockRecord를 props로 받도록 변경
interface StockSummarySectionProps {
    /** 창고 재고 현황 레코드 (데이터 로딩 중 undefined일 수 있음) */
    record?: WarehouseStockRecord; // record prop을 선택적으로 변경
}

// 헬퍼 타입: 렌더링에 필요한 단일 아이템 구조
interface StockItem {
    id: string; // 원자재 코드
    label: string; // 원자재 이름
    currentQty: number; // 현재 재고 수량
    unit: string; // 단위 (여기서는 '개'로 통일)
}

/**
 * WarehouseStockRecord를 컴포넌트에서 사용하는 StockItem[] 배열로 변환하는 함수
 */
const transformStockRecordToItems = (record: WarehouseStockRecord | undefined): StockItem[] => {
    // record가 undefined이거나 materials 속성이 없을 경우 빈 배열을 반환 (TypeError 방지)
    if (!record || !record.materials) {
        return [];
    }
    
    return Object.entries(record.materials).map(([materialName, info]) => ({
        id: materialName.toLowerCase(),
        label: materialName,
        currentQty: info.현재고수량,
        unit: '개',
    }));
};


export const StockSummarySection: React.FC<StockSummarySectionProps> = ({ record }) => {
    // 🔥 재고 데이터 사용 로직: prop으로 record가 오지 않으면 Mock 데이터를 사용
    const dataToUse = record || MOCK_WAREHOUSE_STOCK_RECORD;
    const items = transformStockRecordToItems(dataToUse);

    // 데이터 로딩 중이거나 재고가 없을 경우 처리
    if (items.length === 0 && dataToUse) {
        // Mock 데이터를 사용했거나, 실제 데이터가 넘어왔지만 재고가 없는 경우
        const warehouseName = dataToUse.warehouseName || '창고';
        return (
            <SummarySection>
                <Header>재고현황</Header>
                <p style={{ color: '#fff', padding: '10px 0' }}>
                    {`${warehouseName}에 등록된 재고가 없습니다.`}
                </p>
            </SummarySection>
        );
    }
    
    if (items.length === 0 && !record) {
         // record가 undefined이고, Mock 데이터도 없거나 변환 실패 시 (매우 낮은 확률)
        return (
            <SummarySection>
                <Header>재고현황</Header>
                <p style={{ color: '#fff', padding: '10px 0' }}>재고 데이터를 불러오는 중...</p>
            </SummarySection>
        );
    }

    return (
      <>
        <Header>재고현황</Header>
        <SummarySection>
          {items.map((item) => (
            <SummaryCard key={item.id}>
              <SummaryLeft>
                <div className="text">
                  <span className="label">{item.label}</span> 
                  <div className="material">
                    <div>
                      <FaCircleChevronRight />
                      <span>현 재고 수량</span>
                    </div>
                    <SummaryRight>
                      <span className="value">{item.currentQty}</span> 
                      <span className="unit">{item.unit}</span> 
                    </SummaryRight>
                  </div>
                </div>
              </SummaryLeft>
            </SummaryCard>
          ))}
        </SummarySection>
      </>
    );
};

// --- Styled Components (변경 없음) ---

const Header = styled.h2`
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 0px;
  color: white;
  margin-top: 4px;
`;

const SummarySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SummaryCard = styled.div`
  border-radius: 10px;
  background: #36527D;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(113, 161, 255, 0.2);
`;

const SummaryLeft = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;

  .text {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .label {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.4;
  }

  .material {
    width: 100%;
    font-size: 20px;
    font-weight: 500;
    color: #ffffff;
    gap: 6px;
    display: flex;
    justify-content: space-between;
    align-items: end;

    div {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
    }

    svg {
      width: 17px;
      height: 15px;
      color: #BFD2EE;
    }
  }
`;

const SummaryRight = styled.span`
  display: flex;
  align-items: baseline;
  gap: 4px;
  transform: translateY(-2px);

  .value {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: white;
    line-height: 30px;
  }

  .unit {
    font-size: 30px;
    font-weight: 500;
    color: white;
    line-height: 30px;
  }
`;