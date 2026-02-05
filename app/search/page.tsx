"use client";

import { Suspense } from "react"; // Suspense 추가
import styled, { keyframes } from "styled-components";
import SearchDashboard from "@/components/search-dashboard";
import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";

export default function SearchPanel() {
  return (
    <PageWrapper>
      {/* <AutoLoadingOverlay/> */}
      
      {/* ✅ useSearchParams 에러 방지를 위해 Suspense 적용 */}
      <Suspense fallback={<DashboardSkeleton />}>
        <SearchDashboard />
      </Suspense>
    </PageWrapper>
  );
}

/* ================================
 * Styles
 * ================================ */

const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  color: #dce7f7;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 70px;
`;

// 스켈레톤 애니메이션
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// 대시보드 로딩 시 보여줄 스켈레톤 UI
const DashboardSkeleton = styled.div`
  width: 100%;
  height: 100%;
  margin: 20px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    #172641 25%,
    #2a3e5c 50%,
    #172641 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  opacity: 0.7;
`;