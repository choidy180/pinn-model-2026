"use client";

import React, { useState } from "react";
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

// ✅ 내부 상태 타입 정의
interface PanelRowData {
  name: string;
  value: string;
  delta: string;
  type: "up" | "down" | "neutral"; 
  variant: "neutral" | "alert"; 
}

interface CoolantTemperaturePanelProps {
  title?: string;
}

const CoolantTemperaturePanel: React.FC<CoolantTemperaturePanelProps> = ({
  title = "최대 사출압력(bar)", // ✅ 이미지 타이틀과 일치
}) => {
  const router = useRouter();

  // ✅ API 로직 제거 후, 이미지와 동일한 정적 데이터로 초기화
  const [panelRows] = useState<PanelRowData[]>([
    { 
      name: "20호기", 
      value: "655.4", 
      delta: "+0.0%", 
      type: "neutral", // +0.0%는 색상 변화가 없으므로 neutral (또는 회색)
      variant: "neutral" 
    },
    { 
      name: "11호기", 
      value: "642.9", 
      delta: "-1.2%", 
      type: "neutral", // 이미지상 색상 강조가 없으므로 neutral 유지
      variant: "neutral" 
    },
    { 
      name: "13호기", 
      value: "650.2", 
      delta: "-0.5%", 
      type: "neutral", 
      variant: "neutral" 
    },
    { 
      name: "14호기", 
      value: "659.2", 
      delta: "+0.3%", 
      type: "neutral", 
      variant: "neutral" 
    },
  ]);

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
              
              {/* 변동폭 */}
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