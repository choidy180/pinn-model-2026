/**
 * 🌡️ 건조실 입/출고 이벤트 관련 TypeScript 타입 정의 파일
 */

/** 작업자 정보 인터페이스 */
export interface WorkerInfo {
  /** 작업자 ID */
  id: string;
  /** 작업자 이름 */
  name: string;
}

/** 제품 정보 인터페이스 */
export interface ProductInfo {
  /** 제품 코드 */
  productCode: string;
  /** 로트 번호 */
  lotNumber: string;
  /** 수량 */
  quantity: number;
}

/**
 * 건조실 입실(Entry) 이벤트 상세 인터페이스
 */
export interface DryRoomEntryEvent {
  /** 이벤트 고유 ID */
  eventId: string;
  /** 이벤트 유형 ("ENTRY") */
  eventType: "ENTRY";
  /** 제품 시리얼 번호 */
  serialNumber: string;
  /** 입실 시간 */
  entryTime: string;
  /** 작업자 정보 */
  worker: WorkerInfo;
  /** 제품 상세 정보 */
  productInfo: ProductInfo;
  /** 목표 건조 시간 (초 단위) */
  targetDryingTime: number;
  /** 목표 온도 (섭씨) */
  targetTemperature: number;
}

/**
 * 건조실 출실(Exit) 이벤트 상세 인터페이스
 */
export interface DryRoomExitEvent {
  /** 이벤트 고유 ID */
  eventId: string;
  /** 이벤트 유형 ("EXIT") */
  eventType: "EXIT";
  /** 제품 시리얼 번호 */
  serialNumber: string;
  /** 출실 시간 */
  exitTime: string;
  /** 작업자 정보 */
  worker: WorkerInfo;
  /** 실제 건조 시간 (초 단위) */
  actualDryingTime: number;
}

/**
 * 건조실 전체 이벤트 기록 데이터 인터페이스
 */
export interface DryRoomEventRecord {
  /** 설비 고유 ID */
  facilityId: string;
  /** 설비 이름 */
  facilityName: string;
  /** 데이터 기록 시간 */
  timestamp: string;
  /** 입실 이벤트 기록 */
  entryEvent: DryRoomEntryEvent;
  /** 출실 이벤트 기록 */
  exitEvent: DryRoomExitEvent;
}