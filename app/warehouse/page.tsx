"use client";

import AutoLoadingOverlay from "@/components/common/auto-loading-overlay";
import IntegratedDashboard from "@/components/components/integrate-dashboard";
import DryerWarehouseDashboard from "@/components/dryer-warehouse-dashboard";
import styled from "styled-components";

const WareHouseHome = () => {
  return (
    <Container>
      <AutoLoadingOverlay />
      <IntegratedDashboard/>
    </Container>
  )
}

export default WareHouseHome;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
`