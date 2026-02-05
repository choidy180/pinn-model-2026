"use client";

import React, { useEffect, useState } from "react";
import {
  Panel,
  PanelHeader,
  HeaderTitle,
  HeaderArrow,
  PanelBody,
  Row,
  DryerRowInner,
  DryerName,
  DryerLabel,
  DryerValue,
  DeltaTemp,
  DryerRowInnerContainer,
  LineDivision,
} from "./alert-panel-base-dev";
import { GoArrowRight } from "react-icons/go";
import { useRouter } from "next/navigation";

// ✅ 1. API 응답 데이터 구조 (shot-data)
interface ShotData {
  id: number;
  max_pressure: number;
  switchover_pressure: number; // 🔥 이미지에 있는 타겟 데이터
  collected_at: string;
}

// ✅ 2. 패널 내부 상태 타입
interface DryerRowData {
  name: string;
  base: string;    // 기준값 (설정값)
  current: string; // 현재값 (API 값)
  delta: string;   // 차이
  type: "up" | "down" | "neutral"; 
  variant: "neutral" | "alert"; 
}

interface DryerTemperaturePanelProps {
  title?: string;
  rows?: any[]; // 부모 props는 무시하고 내부 state 사용
  alertBgColor?: string;
}

const DryerTemperaturePanel: React.FC<DryerTemperaturePanelProps> = ({
  title = "보압 절환압력", // 타이틀 기본값 변경 (데이터 성격에 맞게)
  alertBgColor,
}) => {
  const router = useRouter();

  // 초기 상태
  const [panelRows, setPanelRows] = useState<DryerRowData[]>([
    { name: "20호기", base: "-", current: "-", delta: "-", type: "neutral", variant: "neutral" },
    { name: "11호기", base: "-", current: "-", delta: "-", type: "neutral", variant: "neutral" },
    { name: "13호기", base: "-", current: "-", delta: "-", type: "neutral", variant: "neutral" },
    { name: "14호기", base: "-", current: "-", delta: "-", type: "neutral", variant: "neutral" },
  ]);

  const fetchData = async () => {
    try {
      // ✅ Proxy API 호출 (shot-data)
      const response = await fetch("/api/proxy/shot-data?machine_id=200.1");
      
      if (!response.ok) throw new Error("Network response was not ok");

      const data: ShotData = await response.json();
      
      // 🔥 20호기 실제 데이터: switchover_pressure 사용
      const currentVal = data.switchover_pressure; 
      
      // 기준값 설정 (예: 30.0 bar를 표준 설정값으로 가정)
      const BASE_SETTING = 30.0;
      
      // 차이 계산
      const diff = currentVal - BASE_SETTING;
      const diffPercent = (diff / BASE_SETTING) * 100;
      
      // 경고 로직: 기준값 대비 10% 이상 차이나면 경고
      const isAlert20 = Math.abs(diffPercent) >= 10.0;
      const deltaString = diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

      setPanelRows(() => {
        // [1] 20호기 (Real Data)
        const row20: DryerRowData = {
          name: "20호기",
          base: BASE_SETTING.toFixed(1),      // 기준
          current: currentVal.toFixed(1),     // 현재 (API값)
          delta: deltaString,                 // 차이
          type: isAlert20 ? "up" : "neutral", // 위험 시 빨간 글씨
          variant: isAlert20 ? "alert" : "neutral", // 위험 시 빨간 배경
        };

        // [2] 더미 데이터 생성 (11, 13, 14호기)
        // 20호기가 위험하면 안전한 값(30.0 근처)으로 고정, 아니면 20호기와 비슷하게
        const dummyBase = isAlert20 ? 30.0 : currentVal;

        // 정상 범위 내 난수 생성
        const val11 = 29.5; 
        const val13 = 30.2;
        const val14 = 29.8;

        return [
          row20, 
          { 
            name: "11호기", 
            base: "30.0", 
            current: val11.toFixed(1), 
            delta: "-0.5", 
            type: "neutral", // 무조건 정상
            variant: "neutral" 
          },
          { 
            name: "13호기", 
            base: "30.0", 
            current: val13.toFixed(1), 
            delta: "+0.2", 
            type: "neutral", // 무조건 정상
            variant: "neutral" 
          },
          { 
            name: "14호기", 
            base: "30.0", 
            current: val14.toFixed(1), 
            delta: "-0.2", 
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
    <Panel className="large">
      <PanelHeader>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderArrow onClick={() => router.push('/facilities/type?selected=A')}>
          <GoArrowRight />
        </HeaderArrow>
      </PanelHeader>

      <PanelBody>
        {panelRows.map((row) => {
          // alert 상태일 때만 배경색 변경
          const isAlert = row.variant === "alert";

          return (
            <Row
              key={row.name}
              variant={row.variant}
              $bgColor={isAlert ? alertBgColor : undefined}
            >
              <DryerRowInner>
                <DryerName>{row.name}</DryerName>
                <DryerRowInnerContainer>
                  {/* 기준값 (Base/Setting) */}
                  <div>
                    <DryerLabel>
                       기준
                    </DryerLabel>
                    <br />
                    <DryerValue style={{ fontSize: '16px' }} className="temp">
                      {row.base}
                    </DryerValue>
                  </div>
                  
                  <LineDivision />
                  
                  {/* 현재값 (Current/API Data) */}
                  <div>
                    <DryerLabel>
                      현재
                    </DryerLabel>
                    <br />
                    <DryerValue>
                      {row.current}
                    </DryerValue>
                  </div>

                  {/* 차이값 (Delta) */}
                  <div>
                    <DeltaTemp $deltaType={row.type}>
                      {row.delta}
                    </DeltaTemp>
                  </div>
                </DryerRowInnerContainer>
              </DryerRowInner>
            </Row>
          );
        })}
      </PanelBody>
    </Panel>
  );
};

export default DryerTemperaturePanel;