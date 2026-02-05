"use client";

import React, { useEffect, useState } from "react";
import {
  Panel,
  PanelHeader,
  HeaderTitle,
  HeaderArrow,
  PanelBody,
  Row,
  RowLabel,
  RowValue,
  DeltaText,
} from "./alert-panel-base-dev";
import { GoArrowRight } from "react-icons/go";
import { useRouter } from "next/navigation";

// ✅ 1. API 응답 구조 (shot-data)
interface ShotData {
  id: number;
  shot_count: number;
  total_cycle_time: number;
  max_pressure: number;        // 🔥 이걸 메인 데이터로 사용합니다.
  switchover_pressure: number;
  collected_at: string;
}

interface PanelRowData {
  name: string;
  value: string;
  delta: string;
  type: "up" | "down" | "neutral"; 
  variant: "neutral" | "alert"; 
}

interface CoolantTemperaturePanelProps {
  title?: string;
  rows?: any[];
}

const CoolantTemperaturePanel: React.FC<CoolantTemperaturePanelProps> = ({
  title = "최대 사출압력(bar)", // 타이틀을 데이터에 맞게 변경
}) => {
  const router = useRouter();

  // 초기 상태
  const [panelRows, setPanelRows] = useState<PanelRowData[]>([
    { name: "20호기", value: "-", delta: "-", type: "neutral", variant: "neutral" },
    { name: "11호기", value: "-", delta: "-", type: "neutral", variant: "neutral" },
    { name: "13호기", value: "-", delta: "-", type: "neutral", variant: "neutral" },
    { name: "14호기", value: "-", delta: "-", type: "neutral", variant: "neutral" },
  ]);

  const fetchData = async () => {
    try {
      // ✅ Proxy API 호출
      const response = await fetch("/api/proxy/shot-data?machine_id=200.1");
      
      if (!response.ok) throw new Error("Network response was not ok");

      const data: ShotData = await response.json();
      
      // 🔥 20호기 실제 데이터 (최대 사출압력)
      const realValue = data.max_pressure;
      
      // 경고 기준 (예: 660bar 이상)
      const ALERT_THRESHOLD = 660.0;
      const isAlert20 = realValue >= ALERT_THRESHOLD;

      setPanelRows(() => {
        // [1] 20호기 (Real)
        const row20: PanelRowData = {
          name: "20호기",
          value: realValue.toFixed(1),
          delta: "+0.0%", 
          type: isAlert20 ? "up" : "neutral", 
          variant: isAlert20 ? "alert" : "neutral", 
        };

        // [2] 더미 데이터 생성 (나머지 호기)
        // 20호기가 위험하면 안전값(650) 기준으로 생성, 아니면 20호기 근처 값
        const baseVal = isAlert20 ? 650.0 : realValue; 

        // 정상 범위 내에서 약간의 변동을 준 더미 값들
        const val11 = baseVal - 12.5; 
        const val13 = baseVal - 5.2;
        const val14 = baseVal + 3.8; 

        return [
          row20, 
          { 
            name: "11호기", 
            value: val11.toFixed(1), 
            delta: "-1.2%", 
            type: "neutral", // 무조건 정상
            variant: "neutral" 
          },
          { 
            name: "13호기", 
            value: val13.toFixed(1), 
            delta: "-0.5%", 
            type: "neutral", // 무조건 정상
            variant: "neutral" 
          },
          { 
            name: "14호기", 
            value: val14.toFixed(1), 
            delta: "+0.3%", 
            type: "neutral", // 무조건 정상
            variant: "neutral" 
          },
        ];
      });

    } catch (error) {
      console.error("Data Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Panel>
      <PanelHeader>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderArrow onClick={() => router.push('/facilities/type?selected=A')}>
          <GoArrowRight />
        </HeaderArrow>
      </PanelHeader>

      <PanelBody>
        {panelRows.map((row) => (
          <Row key={row.name} variant={row.variant}>
            <RowLabel>{row.name}</RowLabel>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <RowValue>{row.value}</RowValue>
              
              {/* 변동폭 (필요시 표시, type=neutral이면 회색/흰색 처리됨) */}
              <DeltaText style={{width: '64px'}} type={row.type}>
                {row.delta}
              </DeltaText>
            </div>
          </Row>
        ))}
      </PanelBody>
    </Panel>
  );
};

export default CoolantTemperaturePanel;