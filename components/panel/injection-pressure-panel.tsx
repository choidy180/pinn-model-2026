"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Panel,
  PanelHeader,
  HeaderTitle,
  HeaderArrow,
  PanelBody,
  Row,
  RowLabel,
  // RowValue는 alert-panel-base-dev에 있다면 import, 없으면 아래에서 스타일 정의
} from "./alert-panel-base-dev";
import { IoTriangle } from "react-icons/io5";
import { FaMinus } from "react-icons/fa";
import { GoArrowRight } from "react-icons/go";
import { useRouter } from "next/navigation";

// ✅ 1. API 데이터 타입
interface ApiData {
  machine_id: string;
  temperature: number; 
  collected_at: string;
  updated_at: string;
}

// ✅ 2. 내부 상태 타입
type PressureStatus = "high" | "normal";

interface PressureRowData {
  name: string;
  value: string; // 🔥 수치 데이터 (예: "205.7")
  status: PressureStatus;
  diffPercent?: number;
}

interface InjectionPressurePanelProps {
  title?: string;
  rows?: PressureRowData[];
  alertBgColor?: string;
}

/* --- Styled Components --- */
const RightLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; /* 간격 조정 */
`;

// 🔥 수치 데이터를 보여줄 스타일 (CoolantPanel과 유사하게)
const ValueText = styled.span`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-right: 8px;
`;

const DeltaSymbol = styled.span<{ $status: PressureStatus }>`
  text-align: center;
  font-weight: 700;
  color: ${({ $status }) => ($status === "high" ? "#ff624d" : "#26C951")};
  font-size: 18px;
  display: flex;
  align-items: center;

  svg {
    transform: scale(0.8);
  }
`;

const StatusText = styled.span<{ $status: PressureStatus }>`
  min-width: 50px; /* 너비 고정 */
  text-align: right;
  font-size: 18px;
  font-weight: 700;
  color: ${({ $status }) => ($status === "high" ? "#ff624d" : "#26C951")};
`;

const InjectionPressurePanel: React.FC<InjectionPressurePanelProps> = ({
  title = "사출온도 이상",
  alertBgColor,
}) => {
  const router = useRouter();

  // ✅ 초기 상태
  const [localRows, setLocalRows] = useState<PressureRowData[]>([
    { name: "20호기", value: "-", status: "normal" },
    { name: "11호기", value: "-", status: "normal" },
    { name: "13호기", value: "-", status: "normal" },
    { name: "14호기", value: "-", status: "normal" },
  ]);

  const fetchData = async () => {
    try {
      // Proxy API 호출
      const response = await fetch("/api/proxy/temperature?machine_id=200.1");
      
      if (!response.ok) throw new Error("Network response");

      const data: ApiData = await response.json();
      const currentVal = data.temperature; 

      // 로직: 기준값(200) 대비 3% 이상 높으면 경고
      const SETTING_VALUE = 200.0;
      const deviation = ((currentVal - SETTING_VALUE) / SETTING_VALUE) * 100;
      const isHigh = deviation >= 3.0; 

      setLocalRows(() => {
        // [1] 20호기 (실제 데이터)
        const row20: PressureRowData = {
          name: "20호기",
          value: currentVal.toFixed(1), // 🔥 실제 수치 표시
          status: isHigh ? "high" : "normal",
          diffPercent: isHigh ? Math.floor(deviation) : undefined,
        };

        // [2] 더미 데이터 (항상 정상 범위의 랜덤값 생성)
        // 198.0 ~ 202.0 사이의 안전한 값
        return [
          row20, 
          { name: "11호기", value: "198.5", status: "normal" }, 
          { name: "13호기", value: "201.2", status: "normal" }, 
          { name: "14호기", value: "200.0", status: "normal" }, 
        ];
      });

    } catch (error) {
      console.error("Fetch Error:", error);
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
        <HeaderArrow onClick={() => router.push("/facilities/type?selected=A")}>
          <GoArrowRight />
        </HeaderArrow>
      </PanelHeader>

      <PanelBody>
        {localRows.map((row) => {
          const isAlert = row.status === "high";

          // 상태 텍스트: 경고면 "%", 정상이면 "정상"
          const statusText = isAlert && row.diffPercent !== undefined
            ? `+${row.diffPercent}%` // 공간 절약을 위해 '이상' 글자 생략하고 %만 강조
            : "정상";

          return (
            <Row
              key={row.name}
              variant={isAlert ? "alert" : "neutral"}
              $bgColor={isAlert ? alertBgColor : undefined}
            >
              {/* 왼쪽: 설비 이름 */}
              <RowLabel>{row.name}</RowLabel>

              {/* 오른쪽: [수치] [아이콘] [상태] */}
              <RightLayout>
                {/* 1. 수치 데이터 (예: 205.7) */}
                <ValueText>{row.value}도</ValueText>
                
                {/* 2. 아이콘 */}
                {/* <DeltaSymbol $status={row.status}>
                  {isAlert ? <IoTriangle /> : <FaMinus />}
                </DeltaSymbol> */}
                
                {/* 3. 상태 텍스트 */}
                <StatusText $status={row.status}>
                  {statusText}
                </StatusText>
              </RightLayout>
            </Row>
          );
        })}
      </PanelBody>
    </Panel>
  );
};

export default InjectionPressurePanel;