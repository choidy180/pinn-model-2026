"use client";

import React from "react";
import styled from "styled-components";

// ✅ 컴포넌트 import
import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";
import FacilitiesDashboard from "@/components/facilities-dashboard";
import VpnGuard from "@/components/vpn-guard";

const FacilitiesTypeA = () => {
  return (
    // ✅ 1. VPN 보안 가드가 최상위에서 감싸도록 수정
    // (VPN이 연결되지 않으면 내부의 Dashboard나 Overlay는 렌더링되지 않음)
    <VpnGuard>
      <Container>
        {/* 로딩 오버레이 (필요시 유지) */}
        <AutoLoadingOverlay />
        
        {/* 메인 대시보드 (CCTV + API 데이터 패널) */}
        <FacilitiesDashboard />
      </Container>
    </VpnGuard>
  );
};

export default FacilitiesTypeA;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #051328; /* 배경색을 Dashboard와 맞춰주면 더 자연스럽습니다 */
  color: white;
  overflow: hidden; /* 스크롤 방지 */
`;