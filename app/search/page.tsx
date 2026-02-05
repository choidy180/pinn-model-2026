"use client";

import styled from "styled-components";
import SearchDashboard from "@/components/search-dashboard";
import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";

export default function SearchPanel() {
  return (
    <PageWrapper>
      {/* <AutoLoadingOverlay/> */}
      <SearchDashboard/>
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
