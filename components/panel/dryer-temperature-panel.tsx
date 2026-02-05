"use client";

import React, { useState } from "react";
import styled, { css } from "styled-components";
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

// ✅ 패널 내부 상태 타입 정의
interface SwitchoverRowData {
  name: string;
  base: string;    // 기준값
  current: string; // 현재값
  delta: string;   // 차이
  type: "up" | "down" | "neutral";
  variant: "neutral" | "alert";
}

interface SwitchoverPressurePanelProps {
  title?: string;
  alertBgColor?: string;
}

// ✅ '주의' 상태일 때 적용할 주황색 스타일 정의
const alertStyles = css`
  color: #FF6B35;
`;

const alertRowStyles = css`
  border: 1px solid #FF6B35;
  background: rgba(255, 107, 53, 0.1);
`;

// ✅ Transient Prop($) 적용
const StyledRow = styled(Row)<{ $isAlert?: boolean }>`
  ${({ $isAlert }) => $isAlert && alertRowStyles}
  position: relative; 
`;

const StyledDryerName = styled(DryerName)<{ $isAlert?: boolean }>`
  ${({ $isAlert }) => $isAlert && alertStyles}
`;

const StyledDryerLabel = styled(DryerLabel)<{ $isAlert?: boolean }>`
  ${({ $isAlert }) => $isAlert && alertStyles}
  opacity: 0.8; 
`;

const StyledDryerValue = styled(DryerValue)<{ $isAlert?: boolean }>`
  ${({ $isAlert }) => $isAlert && alertStyles}
`;

const StyledDeltaTemp = styled(DeltaTemp)<{ $isAlert?: boolean }>`
  ${({ $isAlert }) => $isAlert && css`color: #FF6B35 !important;`}
`;

// ✅ '주의' 뱃지 컴포넌트
const AlertBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  border: 1px solid #FF6B35;
  border-radius: 16px;
  color: #FF6B35;
  font-size: 14px;
  font-weight: 500;
`;

const SwitchoverPressurePanel: React.FC<SwitchoverPressurePanelProps> = ({
  title = "절합압력(bar)",
  alertBgColor,
}) => {
  const router = useRouter();

  const [panelRows] = useState<SwitchoverRowData[]>([
    {
      name: "20호기",
      base: "30.0",
      current: "32.5",
      delta: "+2.5",
      type: "neutral",
      variant: "neutral"
    },
    {
      name: "11호기",
      base: "30.0",
      current: "29.5",
      delta: "-0.5",
      type: "neutral",
      variant: "neutral"
    },
    {
      name: "13호기",
      base: "30.0",
      current: "30.2",
      delta: "+0.2",
      type: "neutral",
      variant: "neutral"
    },
    {
      name: "14호기",
      base: "30.0",
      current: "29.8",
      delta: "-0.2",
      type: "neutral",
      variant: "neutral"
    },
    // ✅ '주의' 박스 데이터
    {
      name: "03호기",
      base: "80°C",      
      current: "85.3°C",  
      delta: "",          
      type: "neutral",
      variant: "alert"    
    },
  ]);

  // ✅ [수정] 조건에 따라 데이터 필터링
  const filteredRows = panelRows.filter((row) => {
    if (title === "절합압력(bar)") {
      // 1. "절합압력(bar)"일 때 -> 주의 패널(alert) 숨김, 14호기는 보임
      return row.variant !== "alert";
    } else {
      // 2. 그 외(주의 상황)일 때 -> "14호기" 숨김, 주의 패널은 보임
      return row.name !== "14호기";
    }
  });

  return (
    <Panel className="large">
      <PanelHeader>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderArrow onClick={() => router.push('/facilities/type?selected=A')}>
          <GoArrowRight />
        </HeaderArrow>
      </PanelHeader>

      <PanelBody>
        {filteredRows.map((row, index) => {
          const isAlert = row.variant === "alert";

          return (
            <StyledRow
              key={row.name + index}
              variant={row.variant}
              $bgColor={isAlert ? alertBgColor : undefined}
              $isAlert={isAlert} 
            >
              <DryerRowInner>

                <StyledDryerName $isAlert={isAlert}>{row.name}</StyledDryerName>
                
                <DryerRowInnerContainer>
                  {/* 기준값 */}
                  <div>
                    <StyledDryerLabel $isAlert={isAlert}>
                      {isAlert ? "설정온도" : "기준"}
                    </StyledDryerLabel>
                    <br />
                    <StyledDryerValue style={{ fontSize: '16px' }} className="temp" $isAlert={isAlert}>
                      {row.base}
                    </StyledDryerValue>
                  </div>

                  <LineDivision />

                  {/* 현재값 */}
                  <div>
                    <StyledDryerLabel $isAlert={isAlert}>
                      {isAlert ? "현재온도" : "현재"}
                    </StyledDryerLabel>
                    <br />
                    <StyledDryerValue $isAlert={isAlert}>
                      {row.current}
                    </StyledDryerValue>
                  </div>

                  {/* 차이값 (Delta) - 주의 상태가 아닐 때만 표시 */}
                  {!isAlert && (
                    <div>
                      <StyledDeltaTemp
                        $deltaType={row.type}
                        style={{ color: '#26C951' }}
                        $isAlert={isAlert}
                      >
                        {row.delta}
                      </StyledDeltaTemp>
                    </div>
                  )}
                </DryerRowInnerContainer>
              </DryerRowInner>
            </StyledRow>
          );
        })}
      </PanelBody>
    </Panel>
  );
};

export default SwitchoverPressurePanel;