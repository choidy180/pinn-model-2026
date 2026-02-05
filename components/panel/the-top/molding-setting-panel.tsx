// MoldingSettingPanel.tsx
"use client";

import { MOCK_MOLDING_PARAMS } from "@/data/temp-data";
import React from "react";
import styled from "styled-components";

const MoldingSettingPanel: React.FC = () => {
  return (
    <>
      <Header>재고현황</Header>
      <Wrapper>
        <Fields>
          {MOCK_MOLDING_PARAMS.map((item) => (
            <Row key={item.id}>
              <LabelCell>{item.label}</LabelCell>
              <ValueCell>{item.value}</ValueCell>
            </Row>
          ))}
        </Fields>

        <SubmitButton type="button">설정</SubmitButton>
      </Wrapper>
    </>
  );
};

export default MoldingSettingPanel;

/* =========================
 * Styles
 * =======================*/

const Header = styled.h2`
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 0px;
  color: white;
  margin-top: 4px;
`;

const Wrapper = styled.section`
  width: 100%;
  /* max-width: 530px; */
  padding: 18px 20px 22px;
  border-radius: 16px;
  background: #10203A;
  /* box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55); */
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
`;

const LabelCell = styled.div`
  font-size: 18px;
  color: #ffffff;
  font-weight: 600;
`;

const ValueCell = styled.div`
  background: #08152B ;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 16px;
  color: #f5f7ff;
  font-weight: 600;
  border: .6px solid rgba(72, 85, 116, 0.6);

  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: none;
  outline: none;
  cursor: pointer;

  background: #4867ff;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: background 0.16s ease, transform 0.08s ease;

  &:hover {
    background: #5b78ff;
  }

  &:active {
    transform: translateY(1px);
    background: #3b57dd;
  }
`;
