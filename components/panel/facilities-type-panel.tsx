"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "next/navigation";
import MultiSelectModal, { SelectItem as BaseSelectItem } from "@/components/multi-select-modal"; 
import { MOCK_INJECTION_PROCESS_RECORD } from "@/data/injection-process";

/* =========================
 * Types & Data
 * =======================*/

export type SelectItem = Omit<BaseSelectItem, 'value'> & {
  value: string | null;
}

const INITIAL_ITEMS: SelectItem[] = [
  { id: "m1", label: "사이클시간", value: "-" }, 
  { id: "m2", label: "사출시간", value: "-" },
  { id: "m3", label: "절환위치", value: "-" }, 
  { id: "m4", label: "최대사출압력", value: "-" },
  { id: "m5", label: "절환압력", value: "-" }, 
  { id: "m6", label: "계량시간", value: "-" },
  { id: "m7", label: "쿠션위치", value: "-" }, 
  { id: "m8", label: "형체력", value: "-" },
  { id: "m9", label: "히터온도", value: "-" }, 
  { id: "m10", label: "냉각시간", value: "-" },
];

// ✅ 화면에 표시할 이력 테이블 데이터 타입
interface HistoryItem {
  id: string; // QR코드를 고유 ID로 사용
  datetime: string;
  material: string;
  status: "OK" | "NG"; // 화면 표시용 상태
  code: string;
}

// ✅ [수정됨] 실제 API 응답 구조 (한글 키값 반영)
interface VisionRecord {
  날짜: string;
  생산품: string;
  양불: string; // "양품" | "불량"
  QR코드: string;
}

interface VisionResponse {
  total: number;
  records: VisionRecord[];
}

// 사출 데이터(Shot Data) API 타입
interface ShotData {
  total_cycle_time: number;
  injection_time: number;
  vp_switchover_position: number;
  max_pressure: number;
  switchover_pressure: number;
  metering_time: number;
  min_cushion: number;
}

/* =========================
 * CustomScrollArea
 * =======================*/
const CustomScrollArea: React.FC<{ children: React.ReactNode; contentKey?: any }> = ({
  children,
  contentKey,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const updateScrollData = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      setViewportHeight(containerRef.current.clientHeight);
      setContentHeight(containerRef.current.scrollHeight);
    }
  };

  useEffect(() => {
    updateScrollData();
  }, [children, contentKey]);

  return (
    <ScrollOuter>
      <ScrollInner ref={containerRef} onScroll={updateScrollData}>
        {children}
      </ScrollInner>
    </ScrollOuter>
  );
};


/* =========================
 * Main Component
 * =======================*/

interface FacilitiesTypePanelProps {
  machineId: string;
}

const FacilitiesTypePanel: React.FC<FacilitiesTypePanelProps> = ({ machineId }) => {
  const [open, setOpen] = useState(false);
  const param = useSearchParams();

  // 상단 세팅값 상태
  const [items, setItems] = useState<SelectItem[]>(INITIAL_ITEMS);
  // 하단 이력 테이블 상태
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // ---------------------------
  // 1. 상단 세팅값 Fetch (Shot Data)
  // ---------------------------
  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/proxy/shot-data?machine_id=200.1");
      if (!response.ok) return;
      const data: ShotData = await response.json();

      let cycleTime = data.total_cycle_time;
      let injectTime = data.injection_time;
      let position = data.vp_switchover_position;
      let pressure = data.max_pressure;
      let switchPress = data.switchover_pressure;
      let metering = data.metering_time;
      let cushion = data.min_cushion;
      let temp = 205.7; 
      let moldOpen = 4.56;

      // 20호기가 아니면 더미 데이터 생성
      if (machineId !== "20호기") {
        const noise = () => 0.9 + Math.random() * 0.2; 
        cycleTime *= noise();
        injectTime *= noise();
        position *= noise();
        pressure *= noise();
        switchPress *= noise();
        metering *= noise();
        cushion *= noise();
      }

      const dataMap: Record<string, string> = {
        m1: `${cycleTime.toFixed(1)} sec`,       
        m2: `${injectTime.toFixed(1)} sec`,      
        m3: `${position.toFixed(1)} mm`,         
        m4: `${pressure.toFixed(1)} bar`,        
        m5: `${switchPress.toFixed(1)} bar`, 
        m6: `${metering.toFixed(1)} sec`,        
        m7: `${cushion.toFixed(1)} mm`,       
        m8: `${(pressure * 0.1).toFixed(1)} ton`, 
        m9: `${temp.toFixed(1)} °C`,      
        m10: `${moldOpen.toFixed(1)} sec`,       
      };

      setItems((prev) => prev.map((item) => ({
          ...item,
          value: dataMap[item.id] ?? item.value
      })));

    } catch (error) {
      console.error("Shot Data Error:", error);
    }
  };

  // ---------------------------
  // 2. 하단 이력 테이블 Fetch (Vision Inspect)
  // ---------------------------
  const fetchHistory = async () => {
    try {
      // (1) 실제 API 호출
      const response = await fetch("/api/proxy/vision-inspect?limit=10");
      let records: VisionRecord[] = [];
      
      if (response.ok) {
        // API 응답 구조: { total: 10, records: [...] }
        const data: VisionResponse = await response.json();
        records = data.records || [];
      }

      // (2) 데이터 가공
      if (machineId === "20호기") {
        // ✅ [수정됨] 실제 데이터 매핑 (한글 키값 처리)
        const mapped: HistoryItem[] = records.map((row, index) => ({
          id: row.QR코드 || `record-${index}`, // QR코드를 키로 사용
          // 날짜 포맷팅 (YYYY-MM-DDTHH:mm:ss -> 가독성 좋게)
          datetime: new Date(row.날짜).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
          }),
          material: row.생산품,
          status: row.양불 === "양품" ? "OK" : "NG", // "양품" -> OK, 그 외 NG
          code: row.QR코드
        }));
        setHistoryList(mapped);

      } else {
        // 더미 데이터 생성 (다른 호기용)
        // 20호기 데이터를 참고하지 않고 랜덤 생성
        const dummy: HistoryItem[] = Array.from({ length: 10 }).map((_, i) => {
          const now = new Date();
          now.setMinutes(now.getMinutes() - i * 5); // 5분 간격

          const isPass = Math.random() > 0.05 ? "OK" : "NG"; // 95% 확률로 OK
          return {
            id: `dummy-${machineId}-${i}`,
            datetime: now.toLocaleString('ko-KR', {
               year: 'numeric', month: '2-digit', day: '2-digit', 
               hour: '2-digit', minute: '2-digit', second: '2-digit',
               hour12: false
            }),
            material: "Outer", // 예시 품명
            status: isPass,
            code: `MJT${Math.floor(Math.random()*100000)}KSD5D${90000+i}`
          };
        });
        setHistoryList(dummy);
      }

    } catch (error) {
      console.error("History Data Error:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchHistory();

    const interval = setInterval(() => {
      fetchSettings();
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, [machineId]);

  // 스크롤 키
  const settingsKey = JSON.stringify(items.map(i => i.value));
  const historyKey = JSON.stringify(historyList.map(h => h.id));

  return (
    <Wrapper>
      {/* --- 상단: 설비 세팅값 --- */}
      <SettingPanel>
        <SettingScrollFrame>
          <CustomScrollArea contentKey={settingsKey}>
            <SettingList>
              {items.map((item) => (
                <SettingRow key={item.id}>
                  <SettingLabel>{item.label}</SettingLabel>
                  <SettingValue>{item.value ?? "Loading..."}</SettingValue>
                </SettingRow>
              ))}
            </SettingList>
          </CustomScrollArea>
        </SettingScrollFrame>
        <SettingButton onClick={() => setOpen(true)}>설정</SettingButton>
      </SettingPanel>

      {/* --- 하단: 이력 테이블 --- */}
      <HistorySection>
        <CustomScrollArea contentKey={historyKey}>
          <HistoryTable>
            <thead>
              <tr>
                <th>날짜/시간</th>
                <th>자재 품명</th>
                <th>양불 여부</th>
                <th>QR 코드</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((row) => (
                <tr key={row.id}>
                  <td>{row.datetime}</td>
                  <td>{row.material}</td>
                  <td style={{ 
                      color: row.status === 'OK' ? '#4ade80' : '#f87171', 
                      fontWeight: 'bold' 
                    }}>
                    {row.status === 'OK' ? '양품' : '불량'}
                  </td>
                  <td>{row.code}</td>
                </tr>
              ))}
              {historyList.length === 0 && (
                <tr><td colSpan={4} style={{textAlign:'center', padding:'20px'}}>데이터 없음</td></tr>
              )}
            </tbody>
          </HistoryTable>
        </CustomScrollArea>
      </HistorySection>

      <MultiSelectModal
        isOpen={open}
        items={INITIAL_ITEMS} 
        onClose={() => setOpen(false)}
        selected={param.get("selected") ? param.get("selected") : ""}
        onConfirm={(selected) => { setOpen(false); fetchSettings(); }}
        record={MOCK_INJECTION_PROCESS_RECORD}
      />
    </Wrapper>
  );
};

export default FacilitiesTypePanel;

/* =========================
 * Styles
 * =======================*/

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
`;

const SettingPanel = styled.div`
  height: 250px; 
  padding: 10px;
  border-radius: 12px;
  background: #10203a;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
`;

const HistorySection = styled.div`
  flex: 1; 
  min-height: 0;
  background: #10203a;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

/* 테이블 스타일 */
const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #c0c9dd;

  thead {
    position: sticky;
    top: 0;
    background: #10203a;
    z-index: 1;
    height: 40px;
  }

  th {
    text-align: left;
    font-weight: 600;
    color: #8ea5d0;
    border-bottom: 1px solid rgba(82, 110, 157, 0.8);
    padding: 10px;
    white-space: nowrap;
  }

  tbody td {
    padding: 8px 10px;
    height: 40px;
    border-bottom: 1px solid #1f3657;
    color: white;
    white-space: nowrap;
    background-color: transparent;
  }

  tbody tr:hover td {
    background: rgba(98, 140, 255, 0.1);
  }

  /* 마지막 컬럼 ID 코드 폰트 */
  td:last-child {
    font-family: monospace;
    color: #a0aec0;
  }
`;

// -- 기존 세팅 패널 스타일 --
const SettingScrollFrame = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const SettingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
`;

const SettingRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 8px;
  align-items: center;
`;

const SettingLabel = styled.div`
  font-size: 15px;
  color: #e6edf7;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SettingValue = styled.div`
  height: 34px;
  border-radius: 4px;
  background: #081524;
  padding: 0 10px;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
`;

const SettingButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 8px;
  background: #3151b9;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px;
  flex-shrink: 0;
  &:hover { background: #3354d0; }
`;

// -- 스크롤바 스타일 --
const ScrollOuter = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
`;

const ScrollInner = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  &::-webkit-scrollbar { display: none; }
`;