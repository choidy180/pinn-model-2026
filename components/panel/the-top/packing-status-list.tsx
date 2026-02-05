// ZoneStatusList.tsx
"use client";

import { PackingData, PackingStatusListProps } from "@/data/temp-data";
import React from "react";
import { FaCircleChevronRight } from "react-icons/fa6";
import styled from "styled-components";

/* =========================
 * Component
 * =======================*/

const PackingStatusList: React.FC<PackingStatusListProps> = ({ packing }) => {
  const data = packing ?? PackingData;

  return (
    <ListWrapper>
      {data.map((packing) => (
        <ZoneCard key={packing.id}>
          <CardHeader>
            <span>현재 패킹 현황</span>
          </CardHeader>

          <CardBody>
            <Row>
              <RowLeft>
                <FaCircleChevronRight />
                <span>SN</span>
              </RowLeft>
              <RowRight>
                <Completion>{packing.snCode}</Completion>
              </RowRight>
            </Row>

            <Row>
              <RowLeft>
                <FaCircleChevronRight />
                <span>작업시간</span>
              </RowLeft>
              <RowRight>
                <InboundTime>{packing.workTime}</InboundTime>
              </RowRight>
            </Row>

            <Row>
              <RowLeft>
                <FaCircleChevronRight />
                <span>완료시간</span>
              </RowLeft>
              <RowRight>
                <InboundTime>{packing.completionTime}</InboundTime>
              </RowRight>
            </Row>
          </CardBody>
        </ZoneCard>
      ))}
    </ListWrapper>
  );
};

export default PackingStatusList ;

/* =========================
 * Styles
 * =======================*/

const ListWrapper = styled.div`
  width: 100%;
  /* max-width: 530px; */
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ZoneCard = styled.article`
  border-radius: 10px;
  background: #36527D;
  padding: 20px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45); */
  color: #f5f7ff;
  box-sizing: border-box;
`;

const CardHeader = styled.div`
  font-size: 20px;
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
