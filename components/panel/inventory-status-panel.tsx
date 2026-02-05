// InventoryStatusPanel.tsx
"use client";

import { MOCK_STOCK_HISTORY, MOCK_STOCK_SUMMARIES } from "@/data/temp-data";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { StockSummarySection } from "./the-top/stock-summary-section";
import MoldingSettingPanel from "./the-top/molding-setting-panel";
import ZoneStatusList from "./the-top/zone-status-list";
import PackingStatusList from "./the-top/packing-status-list";
import AssemblyLine from "./the-top/assembly-line";
import MultiSelectModal, { SelectItem as BaseSelectItem } from "../multi-select-modal";
import { useParams, useSearchParams } from "next/navigation";
import { MOCK_INJECTION_PROCESS_RECORD } from "@/data/injection-process";
import WarehouseStore from "./the-top/warehouse-store";

/* =========================
 * Types & mock data
 * =======================*/

export type SelectItem = Omit<BaseSelectItem, 'value'> & {
  value: string | null;
}

const MOCK_ITEMS: SelectItem[] = [
  { id: "m1", label: "형폐시간", value: "123sec" }, { id: "m2", label: "형개시간", value: "456sec" },
  { id: "m3", label: "형개완료위치", value: "1.9mm" }, { id: "m4", label: "형체력", value: "2kgf" },
  { id: "m5", label: "히터온도", value: "40C" }, { id: "m6", label: "노즐후진시간", value: "234sec" },
  { id: "m7", label: "형폐시간2", value: "1.9mm" }, { id: "m8", label: "형체력2", value: "2kgf" },
  { id: "m9", label: "히터온도2", value: "40C" }, { id: "m10", label: "노즐후진시간2", value: "234sec" },

  { id: "m11", label: "형폐시간3", value: "123sec" }, { id: "m12", label: "형개시간3", value: "456sec" },
  { id: "m13", label: "형개완료위치3", value: "1.9mm" }, { id: "m14", label: "형체력3", value: "2kgf" },
  { id: "m15", label: "히터온도3", value: "40C" }, { id: "m16", label: "노즐후진시간3", value: "234sec" },

  { id: "m17", label: "형폐시간4", value: "123sec" }, { id: "m18", label: "형개시간4", value: "456sec" },
  { id: "m19", label: "형개완료위치4", value: "1.9mm" }, { id: "m20", label: "형체력4", value: "2kgf" },
  { id: "m21", label: "히터온도4", value: "40C" }, { id: "m22", label: "노즐후진시간4", value: "234sec" },

  { id: "m23", label: "형폐시간5", value: "123sec" }, { id: "m24", label: "형개시간5", value: "456sec" },
  { id: "m25", label: "형개완료위치5", value: "1.9mm" }, { id: "m26", label: "형체력5", value: "2kgf" },
  { id: "m27", label: "히터온도5", value: "40C" }, { id: "m28", label: "노즐후진시간5", value: "234sec" },

  { id: "m29", label: "형폐시간6", value: "123sec" }, { id: "m30", label: "형개시간6", value: "456sec" },
];


/* =========================
 * Custom Scroll Component
 * =======================*/

const CustomScrollArea: React.FC<{ children: React.ReactNode; contentKey?: any }> = ({
  children,
  contentKey,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  const updateScrollData = () => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);
    setContentHeight(el.scrollHeight);
  };

  const handleScroll = () => {
    updateScrollData();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollData();

    const resizeObserver = new ResizeObserver(updateScrollData);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      updateScrollData();
    }
  }, [contentKey]);

  const thumbHeightPercent = useMemo(() => {
    if (!viewportHeight || !contentHeight) return 100;
    const ratio = viewportHeight / contentHeight;
    return Math.max(ratio * 100, 10);
  }, [viewportHeight, contentHeight]);

  const thumbTopPercent = useMemo(() => {
    if (!viewportHeight || !contentHeight) return 0;
    const maxScroll = contentHeight - viewportHeight;
    if (maxScroll <= 0) return 0;

    const maxTravel = 100 - thumbHeightPercent;
    return (scrollTop / maxScroll) * maxTravel;
  }, [scrollTop, viewportHeight, contentHeight, thumbHeightPercent]);

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const el = containerRef.current;
    const trackHeight = el.clientHeight - 8;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (trackHeight <= 0 || maxScroll <= 0) return;

    const deltaY = e.clientY - dragStartYRef.current;
    const thumbTravelScroll = (deltaY / trackHeight) * maxScroll;

    el.scrollTop = dragStartScrollTopRef.current + thumbTravelScroll;
  };

  const handleWindowMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  };

  const handleThumbMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;

    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartScrollTopRef.current = el.scrollTop;

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  const hasScroll = contentHeight > viewportHeight + 1;

  return (
    <ScrollOuter>
      <ScrollInner ref={containerRef} onScroll={handleScroll}>
        {children}
      </ScrollInner>

      {hasScroll && (
        <ScrollTrack>
          <ScrollThumb
            $top={thumbTopPercent}
            $height={thumbHeightPercent}
            onMouseDown={handleThumbMouseDown}
          />
        </ScrollTrack>
      )}
    </ScrollOuter>
  );
};

/* =========================
 * Component
 * =======================*/

type InventoryStatusPanelProps = {
  type?:
    | "assembly"
    | "packing"
    | "molding"
    | "warehouse"
    | "situation"
    | "test"
    | "facilities"
    | "facilities-type";
};

const InventoryStatusPanel: React.FC<InventoryStatusPanelProps> = (props) => {
  const [open, setOpen] = useState(false);
  const param = useSearchParams();

  const [selectedItems, setSelectedItems] = useState<SelectItem[]>(
    MOCK_ITEMS.slice(0, 7)
  );

  const selectedItemsContentKey = useMemo(() => {
    return JSON.stringify(selectedItems.map(item => item.id));
  }, [selectedItems]);


  return (
    <Wrapper>
      {props.type === "warehouse" && <WarehouseStore />}
      {props.type === "facilities" && <MoldingSettingPanel />}
      {props.type === "situation" && <ZoneStatusList />}
      {props.type === "packing" && <PackingStatusList />}
      {props.type === "assembly" && <AssemblyLine />}
      
      {props.type === "facilities-type" && (
        <>
          {props.type === "facilities-type" && (
            <h1>사출설비 {!!param.get('selected') ? param.get('selected') + " 현황" : ""}</h1>
          )}

          <SettingPanel>
            <SettingScrollFrame>
              <CustomScrollArea contentKey={selectedItemsContentKey}>
                <SettingList>
                  {selectedItems.map((item) => (
                    <SettingRow key={item.id}>
                      <SettingLabel>{item.label}</SettingLabel>
                      <SettingValue>{item.value ?? 'N/A'}</SettingValue>
                    </SettingRow>
                  ))}
                </SettingList>
              </CustomScrollArea>
            </SettingScrollFrame>

            <SettingButton onClick={() => setOpen(true)}>설정</SettingButton>
          </SettingPanel>

          <MultiSelectModal
            isOpen={open}
            items={MOCK_ITEMS}
            onClose={() => setOpen(false)}
            selected={param.get('selected') ? param.get('selected') : ''}
            onConfirm={(selected) => {
              setSelectedItems(selected);
              setOpen(false);
            }}
            record={MOCK_INJECTION_PROCESS_RECORD}
          />
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ▼ History Table Section: 양불판정(qualityStatus) 적용됨
         ───────────────────────────────────────────────────────────── */}
      <HistorySection>
        <CustomScrollArea>
          <HistoryTable>
            <thead>
              <tr>
                <th>날짜/시간</th>
                <th>자재 품명</th>
                {/* 1. 헤더 변경: 작업 내용 -> 양불판정 */}
                <th>양불판정</th>
                <th>ID 코드</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STOCK_HISTORY.map((row: any) => (
                <tr key={row.id}>
                  <td>{row.datetime}</td>
                  <td>{row.materialLabel}</td>
                  {/* 2. 조건부 스타일링: 합격(초록) / 불량(빨강) */}
                  <td
                    style={{
                      color: row.qualityStatus === "합격" ? "#4ade80" : "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    {row.qualityStatus}
                  </td>
                  <td>{row.workIdCode}</td>
                </tr>
              ))}
            </tbody>
          </HistoryTable>
        </CustomScrollArea>
      </HistorySection>
    </Wrapper>
  );
};

export default InventoryStatusPanel;

/* =========================
 * Styles
 * =======================*/

const Wrapper = styled.section`
  width: 100%;
  max-width: 25vw;
  height: 100%;
  padding: 20px;
  border-radius: 10px;
  background: #1c3151;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #f5f7ff;
  box-sizing: border-box;
  overflow: hidden;

  h1 {
    font-weight: 600;
    color: #FFFFFF;
    font-size: 30px;
    margin-bottom: 0px;
  }
`;

const HistorySection = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
`;

const ScrollOuter = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const ScrollInner = styled.div`
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-right: 12px;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ScrollTrack = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  bottom: 2px;
  width: 8px;
  border-radius: 999px;
  pointer-events: none;
`;

const ScrollThumb = styled.div<{ $top: number; $height: number }>`
  position: absolute;
  left: 0;
  width: 100%;
  border-radius: 999px;
  background: #5a749a;
  cursor: pointer;

  top: ${({ $top }) => $top}%;
  height: ${({ $height }) => $height}%;

  pointer-events: auto;

  &:hover {
    background: linear-gradient(180deg, #6f8dff, #9fe4ff);
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #c0c9dd;

  thead {
    background: #10203a;
    height: 40px;
  }

  th,
  td {
    text-align: left;
    white-space: nowrap;
  }
  td {
    background-color: #263e62;
  }

  th {
    font-weight: 600;
    color: #8ea5d0;
    border-bottom: 1px solid rgba(82, 110, 157, 0.8);
    font-size: 14px;
    padding: 10px;
  }

  tbody td {
    padding: 7px 10px;
    height: 50px;
    border-bottom: 1px solid #465b79;
    color: white;
  }

  tbody tr:hover {
    background: rgba(98, 140, 255, 0.25);
    cursor: pointer;
  }

  td:last-child {
    font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    font-size: 14px;
  }
`;

const SettingPanel = styled.div`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background: #0b2135;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SettingScrollFrame = styled.div`
  height: 340px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.15);
`;

const SettingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
`;

const SettingRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 8px;
  align-items: center;
`;

const SettingLabel = styled.div`
  font-size: 18px;
  color: #e6edf7;
  font-weight: 600;
`;

const SettingValue = styled.div`
  height: 40px;
  border-radius: 4px;
  background: #081524;
  padding: 0 10px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  box-sizing: border-box;
`;

const SettingButton = styled.button`
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 10px;
  background: #3151B9;
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  padding: 10px;

  &:hover {
    background: #3354d0;
  }
`;