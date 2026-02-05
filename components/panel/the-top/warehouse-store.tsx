// ZoneStatusList.tsx
"use client";

import { MOCK_STORE, MOCK_ZONES, StoreListProps, ZoneStatusListProps } from "@/data/temp-data";
import React from "react";
import { FaCircleChevronRight } from "react-icons/fa6";
import styled from "styled-components";

/* =========================
 * Component
 * =======================*/

const WarehouseStore: React.FC<StoreListProps> = ({ store }) => {
  const data = store ?? MOCK_STORE;

  return (
    <ListWrapper>
      {data.map((store) => (
        <ZoneCard key={store.id}>
          <CardHeader>
            <span>{store.storeName}</span>
          </CardHeader>

          <CardBody>
            <Row>
              <RowLeft>
                <FaCircleChevronRight />
                <span>현 재고 수량</span>
              </RowLeft>
              <RowRight>
                <Completion>{store.inventoryQuantity}개</Completion>
              </RowRight>
            </Row>
          </CardBody>
        </ZoneCard>
      ))}
    </ListWrapper>
  );
};

export default WarehouseStore;

/* =========================
 * Styles
 * =======================*/

const ListWrapper = styled.div`
  width: 100%;
  max-width: 530px;
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
  gap: 4px;
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
  font-size: 2rem;
  height: 2rem;
  font-weight: 800;
  color: #ffffff;
  transform: translateY(-10px);
`;

const InboundTime = styled.span`
  font-size: 16px;
  color: #ffffff;
`;
