/**
 * 📦 warehouse-stock-record-type.ts
 * * 특정 창고의 재고 현황 레코드와 관련 타입 정의를 포함합니다.
 */

// --- 1. 타입 정의 ---

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
  // 예시: "ABS": { "현재고수량": 2 }
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


// --- 2. Mock 데이터 ---

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