export interface MaterialStockRow {
  name: string;
  quantity: number;
};

export const defaultRows: MaterialStockRow[] = [
  { name: "ABS", quantity: 12 },
  { name: "BSPR", quantity: 9 },
  { name: "PP", quantity: 13 },
  { name: "총합", quantity: 35 },
];

// 상태 타입
export type PressureStatus = "high" | "normal";

export interface PressureRowData {
  name: string;          // 설비명
  status: PressureStatus;
  diffPercent?: number;  // high일 때만 사용 (예: 10 → "10% 이상")
}

// 사출압력 이상 데이터
export const defaultPressureRows: PressureRowData[] = [
  { name: "사출설비 A", status: "normal",},
  { name: "사출설비 B", status: "normal" },
  { name: "사출설비 C", status: "normal" },
  { name: "사출설비 D", status: "normal" },
];

type CoolantRow = {
  name: string;
  temp: string;
  delta: string;
  type: "up" | "down" | "neutral";   // 글자 색 (빨강/초록/중립)
  variant: "alert" | "neutral";      // 배경 색 (빨강/파랑)
};

export interface CoolantTemperaturePanelProps {
  title?: string;
  rows?: CoolantRow[];
}

export const coolantRows: CoolantRow[] = [
  { name: "사출설비 A", temp: "70(bar)", delta: "+25(bar)", type: "up",   variant: "neutral" },
  { name: "사출설비 B", temp: "42(bar)", delta: "-03(bar)",  type: "down", variant: "neutral" },
  { name: "사출설비 C", temp: "65(bar)", delta: "+20(bar)", type: "up",   variant: "neutral" },
  { name: "사출설비 D", temp: "46(bar)", delta: "+01(bar)",  type: "up",   variant: "neutral" },
];

export interface DwellStatus {
  currentDwell: string;
  limit: string;
  dryerId: string;
  alertDwell: string;
}

export const defaultDwellStatus: DwellStatus = {
  currentDwell: "4h 20m",
  limit: "4h",
  dryerId: "SN: QSN00124",
  alertDwell: "4h 20m",
};

export type DwellTimePanelProps = {
  title?: string;
  status: {
    currentDwell: string;
    limit: string;
    dryerId: string;
    alertDwell: string;
  };
  neutralBgColor?: string;
  alertBgColor?: string;
};



export interface RowDataSetType {
  name: string;
  base: string;
  current: string;
  delta: string;
  type: "up" | "down" | "neutral" | "normal";
}

// 건조기 온도 예상
export const defaultDryerRows: RowDataSetType[] = [
  { name: "1번 건조기", base: "90℃", current: "99℃", delta: "+9℃", type: "up" },
  { name: "2번 건조기", base: "90℃", current: "97℃", delta: "+7℃", type: "up" },
  { name: "3번 건조기", base: "90℃", current: "90℃", delta: "0℃", type: "down" },
  { name: "4번 건조기", base: "90℃", current: "93℃", delta: "+3℃", type: "down" },
];

// 금형 온도 불균형
export const MoldTemperatureImbalanceRows: RowDataSetType[] = [
  { name: "사출설비 A", base: "62(bar)", current: "70(bar)", delta: "정상", type: "down" },
  { name: "사출설비 B", base: "62(bar)", current: "60(bar)", delta: "정상", type: "down" },
  { name: "사출설비 C", base: "62(bar)", current: "61(bar)", delta: "정상", type: "down" },
  { name: "사출설비 D", base: "62(bar)", current: "70(bar)", delta: "정상", type: "down" },
]; 


// dryerWarehouseData.ts

// 건조기 카드용 타입
export interface DryerCardData {
  id: number;
  name: string;        // "1번 건조기"
  material: string;    // "PP"
  targetTemp: number;  // 설정온도
  currentTemp: number; // 현재온도
}

// 건조기 이벤트 테이블 타입
export interface DryerEventRow {
  datetime: string;
  dryerName: string;
  location: string;
  job: string;
  idCode: string;
}

// 창고 카드용 타입
export interface WarehouseCardData {
  id: number;
  name: string;        // "ABS 창고"
  material: string;    // "ABS"
  targetTemp: number;
  currentTemp: number;
}

// 창고 이벤트 테이블 타입
export interface WarehouseEventRow {
  datetime: string;
  storageName: string;
  location: string;
  job: string;
  idCode: string;
}

// ─────────────────────────────────────────────
// 더미 데이터 (화면에 그대로 들어갈 값들)
// ─────────────────────────────────────────────

export const DRYER_CARDS: DryerCardData[] = [
  { id: 1, name: "1번 건조기", material: "PP", targetTemp: 48, currentTemp: 60 },
  { id: 2, name: "2번 건조기", material: "PP", targetTemp: 48, currentTemp: 48 },
  { id: 3, name: "3번 건조기", material: "PP", targetTemp: 48, currentTemp: 50 },
  { id: 4, name: "4번 건조기", material: "PP", targetTemp: 48, currentTemp: 46 },
  { id: 5, name: "5번 건조기", material: "PP", targetTemp: 48, currentTemp: 48 },
  { id: 6, name: "6번 건조기", material: "PP", targetTemp: 48, currentTemp: 48 },
  { id: 7, name: "7번 건조기", material: "PP", targetTemp: 48, currentTemp: 61 },
  { id: 8, name: "8번 건조기", material: "PP", targetTemp: 48, currentTemp: 60 },
];

export const DRYER_EVENTS: DryerEventRow[] = [
  {
    datetime: "2025/01/07 16:21:22",
    dryerName: "건조기1",
    location: "사출설비 A",
    job: "자재투입",
    idCode: "SN:QSN00124",
  },
  {
    datetime: "2025/01/06 15:14:43",
    dryerName: "건조기2",
    location: "사출설비 B",
    job: "자재투입",
    idCode: "SN:QSN00123",
  },
  {
    datetime: "2025/01/05 11:05:57",
    dryerName: "건조기3",
    location: "사출설비 C",
    job: "자재투입",
    idCode: "SN:QSN00122",
  },
  {
    datetime: "2025/01/04 16:21:22",
    dryerName: "건조기4",
    location: "사출설비 D",
    job: "자재투입",
    idCode: "SN:QSN00121",
  },
  {
    datetime: "2025/01/07 16:21:24",
    dryerName: "건조기1",
    location: "사출설비 A",
    job: "자재투입",
    idCode: "SN:QSN00124",
  },
  {
    datetime: "2025/01/06 15:14:45",
    dryerName: "건조기2",
    location: "사출설비 B",
    job: "자재투입",
    idCode: "SN:QSN00123",
  },
  {
    datetime: "2025/01/05 11:05:59",
    dryerName: "건조기3",
    location: "사출설비 C",
    job: "자재투입",
    idCode: "SN:QSN00122",
  },
  {
    datetime: "2025/01/04 16:21:23",
    dryerName: "건조기4",
    location: "사출설비 D",
    job: "자재투입",
    idCode: "SN:QSN00121",
  },
];

export const WH_CARDS: WarehouseCardData[] = [
  { id: 1, name: "ABS 창고", material: "ABS", targetTemp: 23, currentTemp: 24 },
  { id: 2, name: "PP 창고", material: "PP", targetTemp: 23, currentTemp: 25 },
  { id: 3, name: "BSPR 창고", material: "BSPR", targetTemp: 23, currentTemp: 23 },
  { id: 4, name: "기타 창고", material: "ETC", targetTemp: 23, currentTemp: 22 },
  { id: 5, name: "야적장 1", material: "ABS", targetTemp: 23, currentTemp: 26 },
  { id: 6, name: "야적장 2", material: "PP", targetTemp: 23, currentTemp: 24 },
  { id: 7, name: "야적장 3", material: "BSPR", targetTemp: 23, currentTemp: 23 },
  { id: 8, name: "야적장 4", material: "ETC", targetTemp: 23, currentTemp: 22 },
];

export const WH_EVENTS: WarehouseEventRow[] = [
  {
    datetime: "2025/01/07 09:11:00",
    storageName: "ABS 창고",
    location: "사출설비 A",
    job: "자재 출고",
    idCode: "ST:ABS001",
  },
  {
    datetime: "2025/01/06 13:44:12",
    storageName: "PP 창고",
    location: "사출설비 B",
    job: "자재 출고",
    idCode: "ST:PP002",
  },
  {
    datetime: "2025/01/05 10:01:30",
    storageName: "BSPR 창고",
    location: "사출설비 C",
    job: "자재 출고",
    idCode: "ST:BSPR003",
  },
  {
    datetime: "2025/01/04 08:55:20",
    storageName: "기타 창고",
    location: "사출설비 D",
    job: "자재 출고",
    idCode: "ST:ETC004",
  },
  {
    datetime: "2025/01/07 09:11:01",
    storageName: "ABS 창고",
    location: "사출설비 A",
    job: "자재 출고",
    idCode: "ST:ABS001",
  },
  {
    datetime: "2025/01/06 13:44:13",
    storageName: "PP 창고",
    location: "사출설비 B",
    job: "자재 출고",
    idCode: "ST:PP002",
  },
  {
    datetime: "2025/01/05 10:01:31",
    storageName: "BSPR 창고",
    location: "사출설비 C",
    job: "자재 출고",
    idCode: "ST:BSPR003",
  },
  {
    datetime: "2025/01/04 08:55:22",
    storageName: "기타 창고",
    location: "사출설비 D",
    job: "자재 출고",
    idCode: "ST:ETC004",
  },
];

export type StockHistoryRow = {
  id: string;
  datetime: string;       // 화면에 바로 쓸 포맷된 문자열
  materialLabel: string;  // 예: "ABS +1번 조치"
  workDescription: string;// 예: "재작업팀"
  workIdCode: string;     // 예: "SNQ84900124"
};

export const MOCK_STOCK_HISTORY = [
  {
    id: "H-1",
    datetime: "2025/10/07 16:21:22",
    materialLabel: "ABS 3단 적재",
    qualityStatus: "불량",
    workIdCode: "SNQ84900124",
  },
  {
    id: "H-2",
    datetime: "2025/10/07 15:41:23",
    materialLabel: "ABS +1번 조치",
    qualityStatus: "합격",
    workIdCode: "SNQ84900123",
  },
  {
    id: "H-3",
    datetime: "2025/10/05 10:55:37",
    materialLabel: "ABS 박스 교체",
    qualityStatus: "불량",
    workIdCode: "SNQ84900122",
  },
  {
    id: "H-4",
    datetime: "2025/10/03 09:15:27",
    materialLabel: "BSPR 작업 전환",
    qualityStatus: "합격",
    workIdCode: "SNQ84900121",
  },
  {
    id: "H-5",
    datetime: "2025/10/01 07:49:22",
    materialLabel: "ABS -2단 재배치",
    qualityStatus: "합격",
    workIdCode: "SNQ84900120",
  },
  {
    id: "H-6",
    datetime: "2025/09/30 18:11:03",
    materialLabel: "PP 팔레트 적재",
    qualityStatus: "합격",
    workIdCode: "SNQ84900119",
  },
  {
    id: "H-7",
    datetime: "2025/09/30 16:42:58",
    materialLabel: "ABS 라인 투입",
    qualityStatus: "합격",
    workIdCode: "SNQ84900118",
  },
  {
    id: "H-8",
    datetime: "2025/09/29 14:21:44",
    materialLabel: "PP 재고 실사",
    qualityStatus: "합격",
    workIdCode: "SNQ84900117",
  },
  {
    id: "H-9",
    datetime: "2025/09/29 09:07:12",
    materialLabel: "ABS 공정 반출",
    qualityStatus: "불량",
    workIdCode: "SNQ84900116",
  },
  {
    id: "H-10",
    datetime: "2025/09/28 20:15:39",
    materialLabel: "BSPR 라인 복귀",
    qualityStatus: "합격",
    workIdCode: "SNQ84900115",
  },
  {
    id: "H-11",
    datetime: "2025/09/28 18:22:10",
    materialLabel: "ABS 파손 박스 교체",
    qualityStatus: "불량",
    workIdCode: "SNQ84900114",
  },
  {
    id: "H-12",
    datetime: "2025/09/27 13:45:55",
    materialLabel: "PP 랙 위치 이동",
    qualityStatus: "합격",
    workIdCode: "SNQ84900113",
  },
  {
    id: "H-13",
    datetime: "2025/09/27 10:11:33",
    materialLabel: "ABS 재포장 작업",
    qualityStatus: "합격",
    workIdCode: "SNQ84900112",
  },
  {
    id: "H-14",
    datetime: "2025/09/26 21:05:02",
    materialLabel: "ABS 불량 반출",
    qualityStatus: "불량",
    workIdCode: "SNQ84900111",
  },
  {
    id: "H-15",
    datetime: "2025/09/26 17:28:47",
    materialLabel: "BSPR 자재 교체",
    qualityStatus: "합격",
    workIdCode: "SNQ84900110",
  },
  {
    id: "H-16",
    datetime: "2025/09/25 15:40:19",
    materialLabel: "ABS 라벨 재부착",
    qualityStatus: "불량",
    workIdCode: "SNQ84900109",
  },
  {
    id: "H-17",
    datetime: "2025/09/25 11:18:02",
    materialLabel: "PP 신규 입고",
    qualityStatus: "합격",
    workIdCode: "SNQ84900108",
  },
  {
    id: "H-18",
    datetime: "2025/09/24 19:55:41",
    materialLabel: "ABS 수량 조정",
    qualityStatus: "합격",
    workIdCode: "SNQ84900107",
  },
  {
    id: "H-19",
    datetime: "2025/09/24 16:09:26",
    materialLabel: "ABS 박스 위치 변경",
    qualityStatus: "합격",
    workIdCode: "SNQ84900106",
  },
  {
    id: "H-20",
    datetime: "2025/09/23 09:33:10",
    materialLabel: "PP 출고 준비",
    qualityStatus: "합격",
    workIdCode: "SNQ84900105",
  },
  {
    id: "H-21",
    datetime: "2025/09/22 22:11:52",
    materialLabel: "ABS 재고 재검수",
    qualityStatus: "불량",
    workIdCode: "SNQ84900104",
  },
  {
    id: "H-22",
    datetime: "2025/09/22 18:47:39",
    materialLabel: "BSPR 라인 시험 투입",
    qualityStatus: "합격",
    workIdCode: "SNQ84900103",
  },
  {
    id: "H-23",
    datetime: "2025/09/21 14:29:21",
    materialLabel: "ABS 자재 회수",
    qualityStatus: "합격",
    workIdCode: "SNQ84900102",
  },
  {
    id: "H-24",
    datetime: "2025/09/21 10:02:11",
    materialLabel: "PP 포장 교체",
    qualityStatus: "합격",
    workIdCode: "SNQ84900101",
  },
  {
    id: "H-25",
    datetime: "2025/09/20 19:33:45",
    materialLabel: "ABS 재고 이동",
    qualityStatus: "합격",
    workIdCode: "SNQ84900100",
  },
  {
    id: "H-26",
    datetime: "2025/09/20 15:20:18",
    materialLabel: "BSPR 반제품 보관",
    qualityStatus: "합격",
    workIdCode: "SNQ84900099",
  },
  {
    id: "H-27",
    datetime: "2025/09/19 13:58:09",
    materialLabel: "ABS 샘플 채취",
    qualityStatus: "합격",
    workIdCode: "SNQ84900098",
  },
  {
    id: "H-28",
    datetime: "2025/09/19 09:42:30",
    materialLabel: "PP 팔레트 라벨 교체",
    qualityStatus: "불량",
    workIdCode: "SNQ84900097",
  },
  {
    id: "H-29",
    datetime: "2025/09/18 18:05:55",
    materialLabel: "ABS 라인 긴급 투입",
    qualityStatus: "합격",
    workIdCode: "SNQ84900096",
  },
  {
    id: "H-30",
    datetime: "2025/09/18 08:21:12",
    materialLabel: "PP 재고 정리",
    qualityStatus: "합격",
    workIdCode: "SNQ84900095",
  },
];


export type StockSummary = {
  id: string;
  materialCode: string;   // 예: "ABS"
  label: string;          // 카드에 보여줄 이름 (예: "ABS")
  currentQty: number;     // 현재 재고 수량
  unit: string;           // "개", "roll" 등
};

// 상단 카드용 임시 데이터
export const MOCK_STOCK_SUMMARIES: StockSummary[] = [
  {
    id: "ABS-1",
    materialCode: "ABS",
    label: "ABS",
    currentQty: 12,
    unit: "개",
  },
  {
    id: "ABS-2",
    materialCode: "ABS",
    label: "ABS",
    currentQty: 12,
    unit: "개",
  },
  {
    id: "PP-1",
    materialCode: "PP",
    label: "PP",
    currentQty: 12,
    unit: "개",
  },
];

export type StockSummarySectionProps = {
  items: StockSummary[];
};


export type MoldingParam = {
  id: string;
  label: string;
  value: string;
};

export const MOCK_MOLDING_PARAMS: MoldingParam[] = [
  { id: "p1", label: "형폐시간", value: "123sec" },
  { id: "p2", label: "형개시간", value: "456sec" },
  { id: "p3", label: "형개완료위치", value: "1.9mm" },
  { id: "p4", label: "형체력", value: "2kgf" },
  { id: "p5", label: "히터온도", value: "40C" },
  { id: "p6", label: "노즐후진시간", value: "234sec" },
  { id: "p7", label: "형폐시간", value: "123sec" },
];


/* =========================
 * Types & mock data
 * =======================*/

export type WareHouseStore = {
  id: string;
  storeName :string;
  inventoryQuantity: number;
}

export const MOCK_STORE: WareHouseStore[] = [
  {
    id: "15ec8d42-eeea-4b6c-bfb6-89b2b84dbe89",
    storeName: "ABS",
    inventoryQuantity: 2
  },
  {
    id: "17d19221-21d3-4e0f-8a6e-b02cbe12f073",
    storeName: "PP",
    inventoryQuantity: 12
  },
  {
    id: "5cb8a72e-2833-4026-b7b2-a3dd68356b6c",
    storeName: "PMMA",
    inventoryQuantity: 24
  }
]

export type StoreListProps = {
  store?: WareHouseStore[]; // props 안 주면 MOCK_ZONES 사용
};

export type ZoneStatus = {
  id: string;
  zoneName: string;        // A구역, B구역...
  completionRate: number;  // 0~100 (percent)
  inboundTime: string;     // "20250926/16:21:22" 같은 표시용 문자열
};

export const MOCK_ZONES: ZoneStatus[] = [
  {
    id: "A",
    zoneName: "A구역",
    completionRate: 14,
    inboundTime: "20250926/16:21:22",
  },
  {
    id: "B",
    zoneName: "B구역",
    completionRate: 42,
    inboundTime: "20250926/16:21:22",
  },
  {
    id: "C",
    zoneName: "C구역",
    completionRate: 20,
    inboundTime: "20250926/16:21:22",
  },
  {
    id: "D",
    zoneName: "D구역",
    completionRate: 80,
    inboundTime: "20250926/16:21:22",
  },
];

export type ZoneStatusListProps = {
  zones?: ZoneStatus[]; // props 안 주면 MOCK_ZONES 사용
};



export type PackingStatus = {
  id: string;
  snNumber: string; 
  snCode: string; 
  workTime: string;     // "20250926/16:21:22" 같은 표시용 문자열
  completionTime: string;

};

export const PackingData: PackingStatus[] = [
  {
    id: "ba0d6361-8641-4607-a739-3613785493d8",
    snNumber: "A구역",
    snCode: "QSN00120",
    workTime: "20250926/16:21:22",
    completionTime: "20250926/20:21:22"
  }
];

export type PackingStatusListProps = {
  packing?: PackingStatus[]; // props 안 주면 MOCK_ZONES 사용
};


export type AssemblyLineStatus = {
  id: string;
  snNumber: string; 
  snCode: string; 
  releasedTime: string;     // "20250926/16:21:22" 같은 표시용 문자열

};

export const AssemblyLineData: AssemblyLineStatus[] = [
  {
    id: "ba0d6361-8641-4607-a739-3613785493d8",
    snNumber: "A구역",
    snCode: "QSN00120",
    releasedTime: "20250926/16:21:22",
  }
];

export type AssemblyLineStatusProps = {
  assembly?: AssemblyLineStatus[]; // props 안 주면 MOCK_ZONES 사용
};


export type ProcessId = "raw" | "injectionA" | "dry" | "packing" | "assembly";

type DetailRow = {
  item: string;
  value: string;
  note?: string;
};

type ProcessData = {
  id: ProcessId;
  label: string;
  lastTime: string; // 250926/16:21:22
  video: {
    src: string;
    timeRange: string; // 250926 / 16:19:22 ~ 16:23:22
  };
  details: DetailRow[];
};

export const MOCK_PROCESSES: ProcessData[] = [
  {
    id: "raw",
    label: "원소재",
    lastTime: "250926/16:21:22",
    video: {
      src: "videos/[SHANA]01(192.168.220.101)_20251107_112537_115536.mp4", // 실제 스냅샷 경로로 교체
      timeRange: "250926 / 16:19:22 ~ 16:23:22",
    },
    details: [
      { item: "(사출공정) QR코드 / SN", value: "QSN00124" },
      { item: "(사출공정) 샷카운트", value: "4" },
      { item: "(사출공정) 전체공정시간", value: "10분" },
      { item: "(사출공정) 사출시간", value: "8분" },
      { item: "(사출공정) 냉각시간", value: "4분" },
      { item: "(사출공정) 계량시간", value: "12분" },
      { item: "(사출공정) 절환위치", value: "2, 34, 200" },
      { item: "(사출공정) 최소쿠션", value: "1분" },
      { item: "(사출공정) 계량완료위치", value: "34, 18, 200" },
      { item: "(사출공정) 최대압력", value: "10pak" },
      { item: "(사출공정) 최대압력", value: "10pak", note: "" },
      { item: "(사출공정) 최대압력", value: "10pak", note: "" },

      // 아래부터 더미 데이터 (스크롤 테스트용)
      { item: "(사출공정) 센서01 값", value: "1단계" },
      { item: "(사출공정) 센서02 값", value: "2단계" },
      { item: "(사출공정) 센서03 값", value: "3단계" },
      { item: "(사출공정) 센서04 값", value: "4단계" },
      { item: "(사출공정) 센서05 값", value: "5단계" },
      { item: "(사출공정) 센서06 값", value: "6단계" },
      { item: "(사출공정) 센서07 값", value: "7단계" },
      { item: "(사출공정) 센서08 값", value: "8단계" },
      { item: "(사출공정) 센서09 값", value: "9단계" },
      { item: "(사출공정) 센서10 값", value: "10단계" },
      { item: "(사출공정) 센서11 값", value: "11단계" },
      { item: "(사출공정) 센서12 값", value: "12단계" },
      { item: "(사출공정) 센서13 값", value: "13단계" },
      { item: "(사출공정) 센서14 값", value: "14단계" },
      { item: "(사출공정) 센서15 값", value: "15단계" },
      { item: "(사출공정) 센서16 값", value: "16단계" },
      { item: "(사출공정) 센서17 값", value: "17단계" },
      { item: "(사출공정) 센서18 값", value: "18단계" },
      { item: "(사출공정) 센서19 값", value: "19단계" },
      { item: "(사출공정) 센서20 값", value: "20단계" },
      { item: "(사출공정) 센서21 값", value: "21단계" },
      { item: "(사출공정) 센서22 값", value: "22단계" },
      { item: "(사출공정) 센서23 값", value: "23단계" },
      { item: "(사출공정) 센서24 값", value: "24단계" },
      { item: "(사출공정) 센서25 값", value: "25단계" },
      { item: "(사출공정) 센서26 값", value: "26단계" },
      { item: "(사출공정) 센서27 값", value: "27단계" },
      { item: "(사출공정) 센서28 값", value: "28단계" },
      { item: "(사출공정) 센서29 값", value: "29단계" },
      { item: "(사출공정) 센서30 값", value: "30단계" },
      { item: "(사출공정) 센서31 값", value: "31단계" },
      { item: "(사출공정) 센서32 값", value: "32단계" },
      { item: "(사출공정) 센서33 값", value: "33단계" },
      { item: "(사출공정) 센서34 값", value: "34단계" },
      { item: "(사출공정) 센서35 값", value: "35단계" },
      { item: "(사출공정) 센서36 값", value: "36단계" },
      { item: "(사출공정) 센서37 값", value: "37단계" },
      { item: "(사출공정) 센서38 값", value: "38단계" },
      { item: "(사출공정) 센서39 값", value: "39단계" },
      { item: "(사출공정) 센서40 값", value: "40단계" },
      { item: "(사출공정) 센서41 값", value: "41단계" },
      { item: "(사출공정) 센서42 값", value: "42단계" },
      { item: "(사출공정) 센서43 값", value: "43단계" },
      { item: "(사출공정) 센서44 값", value: "44단계" },
      { item: "(사출공정) 센서45 값", value: "45단계" },
      { item: "(사출공정) 센서46 값", value: "46단계" },
      { item: "(사출공정) 센서47 값", value: "47단계" },
      { item: "(사출공정) 센서48 값", value: "48단계" },
      { item: "(사출공정) 센서49 값", value: "49단계" },
      { item: "(사출공정) 센서50 값", value: "50단계" },
      { item: "(사출공정) 센서51 값", value: "51단계" },
      { item: "(사출공정) 센서52 값", value: "52단계" },
      { item: "(사출공정) 센서53 값", value: "53단계" },
      { item: "(사출공정) 센서54 값", value: "54단계" },
      { item: "(사출공정) 센서55 값", value: "55단계" },
      { item: "(사출공정) 센서56 값", value: "56단계" },
      { item: "(사출공정) 센서57 값", value: "57단계" },
      { item: "(사출공정) 센서58 값", value: "58단계" },
      { item: "(사출공정) 센서59 값", value: "59단계" },
      { item: "(사출공정) 센서60 값", value: "60단계" },
      { item: "(사출공정) 센서61 값", value: "61단계" },
      { item: "(사출공정) 센서62 값", value: "62단계" },
      { item: "(사출공정) 센서63 값", value: "63단계" },
      { item: "(사출공정) 센서64 값", value: "64단계" },
      { item: "(사출공정) 센서65 값", value: "65단계" },
      { item: "(사출공정) 센서66 값", value: "66단계" },
      { item: "(사출공정) 센서67 값", value: "67단계" },
      { item: "(사출공정) 센서68 값", value: "68단계" },
      { item: "(사출공정) 센서69 값", value: "69단계" },
      { item: "(사출공정) 센서70 값", value: "70단계" },
      { item: "(사출공정) 센서71 값", value: "71단계" },
      { item: "(사출공정) 센서72 값", value: "72단계" },
      { item: "(사출공정) 센서73 값", value: "73단계" },
      { item: "(사출공정) 센서74 값", value: "74단계" },
      { item: "(사출공정) 센서75 값", value: "75단계" },
      { item: "(사출공정) 센서76 값", value: "76단계" },
      { item: "(사출공정) 센서77 값", value: "77단계" },
      { item: "(사출공정) 센서78 값", value: "78단계" },
      { item: "(사출공정) 센서79 값", value: "79단계" },
      { item: "(사출공정) 센서80 값", value: "80단계" },
      { item: "(사출공정) 센서81 값", value: "81단계" },
      { item: "(사출공정) 센서82 값", value: "82단계" },
      { item: "(사출공정) 센서83 값", value: "83단계" },
      { item: "(사출공정) 센서84 값", value: "84단계" },
      { item: "(사출공정) 센서85 값", value: "85단계" },
      { item: "(사출공정) 센서86 값", value: "86단계" },
      { item: "(사출공정) 센서87 값", value: "87단계" },
      { item: "(사출공정) 센서88 값", value: "88단계" },
      { item: "(사출공정) 센서89 값", value: "89단계" },
      { item: "(사출공정) 센서90 값", value: "90단계" },
      { item: "(사출공정) 센서91 값", value: "91단계" },
      { item: "(사출공정) 센서92 값", value: "92단계" },
      { item: "(사출공정) 센서93 값", value: "93단계" },
      { item: "(사출공정) 센서94 값", value: "94단계" },
      { item: "(사출공정) 센서95 값", value: "95단계" },
      { item: "(사출공정) 센서96 값", value: "96단계" },
      { item: "(사출공정) 센서97 값", value: "97단계" },
      { item: "(사출공정) 센서98 값", value: "98단계" },
      { item: "(사출공정) 센서99 값", value: "99단계" },
      { item: "(사출공정) 센서100 값", value: "100단계" },
    ],

  },
  {
    id: "injectionA",
    label: "사출설비A",
    lastTime: "250926/16:21:22",
    video: {
      src: "videos/[SHANA]02(192.168.220.101)_20251107_102216_105215.mp4",
      timeRange: "250926 / 16:19:22 ~ 16:23:22",
    },
    details: [
      { item: "(사출공정) QR코드 / SN", value: "QSN00124" },
      { item: "(사출공정) 샷카운트", value: "6" },
      { item: "(사출공정) 전체공정시간", value: "11분" },
      { item: "(사출공정) 사출시간", value: "9분" },
    ],
  },
  {
    id: "dry",
    label: "건조실",
    lastTime: "250926/16:21:22",
    video: {
      src: "videos/[SHANA]03(192.168.220.101)_20251123_144410_153113.mp4",
      timeRange: "250926 / 16:19:22 ~ 16:23:22",
    },
    details: [
      { item: "(건조공정) 건조온도", value: "80℃" },
      { item: "(건조공정) 건조시간", value: "6시간" },
    ],
  },
  {
    id: "packing",
    label: "패킹",
    lastTime: "250926/16:21:22",
    video: {
      src: "videos/[SHANA]18(192.168.220.101)_20251123_141746_152856.mp4",
      timeRange: "250926 / 16:19:22 ~ 16:23:22",
    },
    details: [
      { item: "(패킹공정) 포장수량", value: "10ea/box" },
      { item: "(패킹공정) 라벨상태", value: "정상" },
    ],
  },
  {
    id: "assembly",
    label: "조립라인",
    lastTime: "250926/16:21:22",
    video: {
      src: "videos/[SHANA]A_05_20251030_145453_150542.mp4",
      timeRange: "250926 / 16:19:22 ~ 16:23:22",
    },
    details: [
      { item: "(조립공정) 조립스텝수", value: "12 step" },
      { item: "(조립공정) 불량수량", value: "0" },
    ],
  },
];