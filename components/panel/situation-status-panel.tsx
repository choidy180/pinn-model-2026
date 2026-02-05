// SituationStatusPanel.tsx
"use client";

import React from "react";
import styled from "styled-components";
import ZoneStatusList from "./the-top/zone-status-list"; 

const SituationStatusPanel: React.FC = () => {
  return (
    <Wrapper>
      <ZoneStatusList />
    </Wrapper>
  );
};

export default SituationStatusPanel;

/* =========================
 * Styles
 * =======================*/

const Wrapper = styled.section`
  width: 100%;
  max-width: 30vw; /* 기존 레이아웃 유지 */
  height: 100%;
  padding: 20px;
  border-radius: 10px;
  background: #1c3151;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #f5f7ff;
  box-sizing: border-box;
  overflow: hidden;

  h1 {
    font-weight: 600;
    color: #FFFFFF;
    font-size: 30px;
    margin-bottom: 0px;
  }
`;