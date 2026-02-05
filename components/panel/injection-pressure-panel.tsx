"use client";

import React, { useState } from "react";
import styled from "styled-components";
import {
  Panel,
  PanelHeader,
  HeaderTitle,
  HeaderArrow,
  PanelBody,
  Row,
  RowLabel,
} from "./alert-panel-base-dev";
import { GoArrowRight } from "react-icons/go";
import { useRouter } from "next/navigation";

// ✅ 내부 상태 타입 정의
type PressureStatus = "high" | "normal";

interface PressureRowData {
  name: string;
  value: string; // 수치 데이터 (예: "200.0")
  status: PressureStatus;
}

interface InjectionPressurePanelProps {
  title?: string;
  alertBgColor?: string;
}

/* --- Styled Components --- */
const RightLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 12px; /* 수치와 상태 텍스트 사이 간격 */
`;

const ValueText = styled.span`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  text-align: right;
  min-width: 80px; /* 수치 정렬을 위해 최소 너비 확보 */
`;

const StatusText = styled.span<{ $status: PressureStatus }>`
  min-width: 40px;
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

  // ✅ API 로직 제거 후, 이미지와 동일한 정적 데이터(모두 정상)로 초기화
  const [localRows] = useState<PressureRowData[]>([
    { name: "20호기", value: "200.0", status: "normal" },
    { name: "11호기", value: "198.5", status: "normal" },
    { name: "13호기", value: "201.2", status: "normal" },
    { name: "14호기", value: "200.0", status: "normal" },
  ]);

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

          return (
            <Row
              key={row.name}
              variant={isAlert ? "alert" : "neutral"}
              $bgColor={isAlert ? alertBgColor : undefined}
            >
              {/* 왼쪽: 설비 이름 */}
              <RowLabel>{row.name}</RowLabel>

              {/* 오른쪽: [수치] [상태] */}
              <RightLayout>
                {/* 1. 수치 데이터 */}
                <ValueText>{row.value}도</ValueText>
                
                {/* 2. 상태 텍스트 (모두 정상) */}
                <StatusText $status={row.status}>
                  정상
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