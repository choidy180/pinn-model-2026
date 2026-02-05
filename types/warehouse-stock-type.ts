/**
 * 🏢 창고 재고 현황 관련 TypeScript 타입 정의 파일
 */

/**
 * 개별 자재의 재고 수량 정보 인터페이스
 * (향후 확장성을 위해 객체로 정의)
 */
export interface MaterialStockDetail {
  /** 현재 재고 수량 */
  현재고수량: number;
}

/**
 * 창고 내 모든 자재 재고 정보를 담는 객체 인터페이스
 * 키(key)는 자재 코드 (예: "ABS", "PP", "PMMA")입니다.
 */
export interface MaterialsStock {
  [materialCode: string]: MaterialStockDetail;
}

/**
 * 전체 창고 재고 현황 데이터 인터페이스
 */
export interface WarehouseStockData {
  /** 데이터 기록 시간 (ISO 8601 또는 기타 표준 시간 포맷 문자열) */
  timestamp: string;
  /** 창고 고유 식별자 */
  warehouseId: string;
  /** 창고 이름 */
  warehouseName: string;
  /** 현재 창고에 보관된 총 자재 종류 수 */
  totalMaterials: number;
  /** 자재별 상세 재고 정보 */
  materials: MaterialsStock;
}