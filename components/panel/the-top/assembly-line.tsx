// ZoneStatusList.tsx
"use client";

import { AssemblyLineData, AssemblyLineStatusProps } from "@/data/temp-data";
import React from "react";
import { FaCircleChevronRight } from "react-icons/fa6";
import styled from "styled-components";

/* =========================
 * Component
 * =======================*/

const AssemblyLine: React.FC<AssemblyLineStatusProps> = ({ assembly }) => {
  const data = assembly ?? AssemblyLineData;

  return (
    <ListWrapper>
      {data.map((assembly) => (
        <ZoneCard key={assembly.id}>
          <CardHeader>
            <span>현재 사출품</span>
          </CardHeader>

          <CardBody>
            <Row>
              <RowLeft>
                <FaCircleChevronRight />
                <span>SN</span>
              </RowLeft>
              <RowRight>
                <Completion>{assembly.snCode}</Completion>
              </RowRight>
            </Row>

            <Row>
              <RowLeft>
                <FaCircleChevronRight />
                <span>작업시간</span>
              </RowLeft>
              <RowRight>
                <InboundTime>{assembly.releasedTime}</InboundTime>
              </RowRight>
            </Row>
          </CardBody>
        </ZoneCard>
      ))}
    </ListWrapper>
  );
};

export default AssemblyLine ;

/* =========================
 * Styles
 * =======================*/

const ListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ZoneCard = styled.article`
  border-radius: 10px;
  background: #36527D;
  padding: 30px 20px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45); */
  color: #f5f7ff;
  box-sizing: border-box;
`;

const CardHeader = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #ffffff;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  color: #ffffff;

  svg {
    width: 15px;
    height: 15px;
    color: #BFD2EE;
  }
`;

const RowRight = styled.div`
  display: flex;
  align-items: center;
`;

const Completion = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
`;

const InboundTime = styled.span`
  font-size: 16px;
  color: #ffffff;
`;
