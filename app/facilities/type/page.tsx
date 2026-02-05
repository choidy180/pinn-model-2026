"use client";

import React, { Suspense } from "react"; // ✅ Suspense import
import styled from "styled-components";

// ✅ 컴포넌트 import
import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";
import FacilitiesDashboard from "@/components/facilities-dashboard";

const FacilitiesTypeA = () => {
  return (
    <Container>
      {/* ✅ useSearchParams 에러 해결을 위해 Suspense로 감싸줍니다. */}
      {/* fallback에는 로딩 중에 보여줄 간단한 UI를 넣거나 null을 넣습니다. */}
      <Suspense fallback={<div style={{ color: "white" }}>Loading...</div>}>
        <AutoLoadingOverlay />
        <FacilitiesDashboard />
      </Suspense>
    </Container>
  );
};

export default FacilitiesTypeA;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #051328;
  color: white;
  overflow: hidden;
`;