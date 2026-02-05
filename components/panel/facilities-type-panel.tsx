"use client";

import React, { useEffect, useRef, useState } from "react";
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

// 초기 전체 항목 정의
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

// 호기별 기준값 설정
const MACHINE_BASES: Record<string, any> = {
  "20호기": { cycle: 51.0, inject: 6.0, pos: 61.0, press: 655.4, switch: 32.5, meter: 27.0, cushion: 19.0, force: 65.5, temp: 205.7, cool: 12.0 },
  "11호기": { cycle: 48.5, inject: 5.8, pos: 58.2, press: 642.1, switch: 30.1, meter: 26.5, cushion: 18.5, force: 64.0, temp: 198.5, cool: 11.5 },
  "13호기": { cycle: 52.3, inject: 6.2, pos: 62.5, press: 660.8, switch: 33.2, meter: 27.5, cushion: 19.5, force: 66.2, temp: 201.2, cool: 12.5 },
  "14호기": { cycle: 50.1, inject: 5.9, pos: 60.1, press: 648.5, switch: 31.8, meter: 26.8, cushion: 18.8, force: 65.0, temp: 200.0, cool: 11.8 },
};

const DEFAULT_BASE = { cycle: 50.0, inject: 6.0, pos: 60.0, press: 650.0, switch: 32.0, meter: 27.0, cushion: 19.0, force: 65.0, temp: 200.0, cool: 12.0 };

interface HistoryItem {
  id: string;
  datetime: string;
  material: string;
  status: "OK" | "NG";
  code: string;
}

/* =========================
 * CustomScrollArea
 * =======================*/
const CustomScrollArea: React.FC<{ children: React.ReactNode; contentKey?: any }> = ({
  children,
  contentKey,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setScrollTop] = useState(0);

  const updateScrollData = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
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

  const [allItems, setAllItems] = useState<SelectItem[]>(INITIAL_ITEMS);
  // 초기값: 모든 ID 선택
  const [selectedIds, setSelectedIds] = useState<string[]>(INITIAL_ITEMS.map(i => i.id));
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // ---------------------------
  // 데이터 생성 함수
  // ---------------------------
  const updateDashboardData = () => {
    const base = MACHINE_BASES[machineId] || DEFAULT_BASE;
    const noise = () => (Math.random() - 0.5) * 0.4;

    const cycleTime = base.cycle + noise();
    const injectTime = base.inject + (noise() * 0.1);
    const position = base.pos + noise();
    const pressure = base.press + (noise() * 3);
    const switchPress = base.switch + noise();
    const metering = base.meter + noise();
    const cushion = base.cushion + (noise() * 0.1);
    const moldForce = base.force + noise();
    const temp = base.temp + (noise() * 2);
    const coolTime = base.cool + noise();

    const dataMap: Record<string, string> = {
      m1: `${cycleTime.toFixed(1)} sec`,       
      m2: `${injectTime.toFixed(1)} sec`,      
      m3: `${position.toFixed(1)} mm`,         
      m4: `${pressure.toFixed(1)} bar`,        
      m5: `${switchPress.toFixed(1)} bar`, 
      m6: `${metering.toFixed(1)} sec`,        
      m7: `${cushion.toFixed(1)} mm`,       
      m8: `${moldForce.toFixed(1)} ton`, 
      m9: `${temp.toFixed(1)} °C`,      
      m10: `${coolTime.toFixed(1)} sec`,       
    };

    setAllItems((prev) => prev.map((item) => ({
        ...item,
        value: dataMap[item.id] ?? item.value
    })));

    const now = new Date();
    const idNum = parseInt(machineId.replace(/[^0-9]/g, "")) || 0; 
    
    const newHistory: HistoryItem[] = Array.from({ length: 10 }).map((_, i) => {
      const recordTime = new Date(now.getTime() - i * 65000); 
      const dateStr = recordTime.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).replace(/\./g, '.');

      const baseQR = "MJ63702706KSD5D";
      const seq = 90000 + (idNum * 1000) + (96 - i); 

      return {
        id: `history-${machineId}-${i}`,
        datetime: dateStr,
        material: "Outer",
        status: "OK",
        code: `${baseQR}${seq}`
      };
    });

    setHistoryList(newHistory);
  };

  useEffect(() => {
    updateDashboardData();
    const interval = setInterval(updateDashboardData, 5000);
    return () => clearInterval(interval);
  }, [machineId]);

  // 선택된 아이템 필터링
  const visibleItems = allItems.filter(item => selectedIds.includes(item.id));

  // 스크롤 키
  const settingsKey = JSON.stringify(visibleItems.map(i => i.value));
  const historyKey = JSON.stringify(historyList.map(h => h.id));

  return (
    <Wrapper>
      {/* --- 상단: 설비 세팅값 --- */}
      <SettingPanel>
        <SettingScrollFrame>
          <CustomScrollArea contentKey={settingsKey}>
            <SettingList>
              {visibleItems.map((item) => (
                <SettingRow key={item.id}>
                  <SettingLabel>{item.label}</SettingLabel>
                  <SettingValue>{item.value}</SettingValue>
                </SettingRow>
              ))}
              {visibleItems.length === 0 && (
                <div style={{color: '#666', textAlign: 'center', padding: '20px'}}>
                  선택된 항목이 없습니다.
                </div>
              )}
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
                  <td style={{ letterSpacing: '0.5px' }}>{row.datetime}</td>
                  <td>{row.material}</td>
                  <td style={{ color: '#4ade80', fontWeight: 'bold' }}>양품</td>
                  <td>{row.code}</td>
                </tr>
              ))}
            </tbody>
          </HistoryTable>
        </CustomScrollArea>
      </HistorySection>

      <MultiSelectModal
        isOpen={open}
        items={allItems} 
        onClose={() => setOpen(false)}
        selected={selectedIds.join(',')}
        // ✅ [수정완료] onConfirm 타입 에러 해결 부분
        onConfirm={(selectedItems: any) => { 
          // selectedItems가 SelectItem[] (객체 배열)로 들어옵니다.
          // 여기서 id만 추출하여 string[] 형태로 변환합니다.
          if (Array.isArray(selectedItems)) {
            const ids = selectedItems.map((item: any) => item.id);
            setSelectedIds(ids);
          } else {
            // 만약 다른 타입(문자열 등)으로 들어올 경우에 대비한 예외처리
            setSelectedIds([]);
          }
          
          setOpen(false);
          updateDashboardData();
        }}
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
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const HistorySection = styled.div`
  flex: 1; 
  min-height: 0;
  background: #10203a;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

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
    padding: 12px 10px;
    border-bottom: 1px solid #1f3657;
    color: white;
    white-space: nowrap;
    background-color: transparent;
  }

  tbody tr:hover td {
    background: rgba(98, 140, 255, 0.1);
  }

  td:last-child {
    font-family: 'Courier New', Courier, monospace;
    color: #a0aec0;
    letter-spacing: 0.5px;
  }
`;

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
  transition: background 0.2s;
  &:hover { background: #4063d6; }
`;

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
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }
`;