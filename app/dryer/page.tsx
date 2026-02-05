"use client";

import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";
import DryerDashboard from "@/components/dryer-dashboard";
import styled from "styled-components";

const DryerCurrent = () => {
  return (
    <Container>
      <AutoLoadingOverlay/>
      <DryerDashboard/>
    </Container>
  )
}

export default DryerCurrent;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  
  color: white;
`