"use client";

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import DynamicFullScreenGlbViewer, { ModelProp } from "@/components/components/full-screen-glb-viewer";

// ✅ 패널 컴포넌트 및 데이터 import
import MaterialStockPanel from "@/components/panel/material-stock-panel";
import InjectionPressurePanel from "@/components/panel/injection-pressure-panel";
import CoolantTemperaturePanel from "@/components/panel/coolant-temperature-panel";
import DwellTimePanel from "@/components/panel/dwell-time-panel";
import DryerTemperaturePanel from "@/components/panel/dryer-temperature-panel";
// import AutoLoadingOverlay from "@/components/common/auto-loading-overlay"; // 사용하지 않는다면 주석 처리
import { 
  coolantRows, 
  defaultDryerRows, 
  defaultDwellStatus, 
  defaultPressureRows, 
  MoldTemperatureImbalanceRows 
} from "@/data/temp-data";
import CyberpunkLoader from "@/components/start-punk-loader";
import VpnGuard from "@/components/vpn-guard";

// ✅ VPN 체크 컴포넌트 import (경로는 실제 파일 위치에 맞춰주세요)

// ✅ 시간 포맷 함수
const formatTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}. ${month}. ${day}. ${hours}:${minutes} 기준`;
};

const DevSvgPage = () => {
  // --- 1. 시계 상태 관리 ---
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- 2. 포탈(Portal) 참조 생성 ---
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 갱신
    return () => clearInterval(timerId);
  }, []);

  const timeString = formatTime(currentTime);

  // --- 3. 3D 모델 데이터 설정 ---
  const backgroundPath = "/base.glb";
  const itemPath = "/dryzone.glb"; 
  const item2Path = "/drumtube.glb"; 
  const item3Path = "/machine_all.glb"; 
  const item4Path = "/material.glb"; 

  const myModels: ModelProp[] = [
    { 
      url: backgroundPath, 
      position: [0, 0, 0], 
      type: 'background',
      scale: 11
    }, 
    // ✅ 기기 1: 드라이 존
    { 
      url: itemPath, 
      position: [-0.4, 0.575, -0.55], 
      type: 'interactive',
      scale: 2.5,
      warning: true,
      info: {
        title: "건조기",
        description: "원자재를 건조시키는 공정",
        details: [
          { label: "TEMP", value: "85°C" },
          { label: "HUMIDITY", value: "12%" },
          { label: "STATUS", value: "OPERATIONAL" },
          { label: "POWER", value: "2400W" },
        ]
      }
    },
    // ✅ 기기 2: 드럼 튜브
    { 
      url: item2Path, 
      position: [2.7, .539, -2.77], 
      type: 'interactive',
      scale: 2.1,
      warning: false,
      info: {
        title: "건조실",
        description: "사출품 형성을 위해 건조하는 공정",
        details: [
          { label: "RPM", value: "1200" },
          { label: "LOAD", value: "45%" },
        ]
      }
    },
    // ✅ 기기 3: 통합 머신
    { 
      url: item3Path, 
      position: [-0.8, 0, 1.4], 
      type: 'interactive',
      scale: 5.4,
      warning: false,
      info: {
        title: "사출설비",
        description: "사출품 출력 공정",
        details: [
          { label: "UPTIME", value: "99.9%" },
          { label: "ERRORS", value: "0" },
        ]
      }
    },
    // ✅ 기기 4: 자재 관리
    { 
      url: item4Path, 
      position: [4.52, 0.52, -0.05], 
      type: 'interactive',
      scale: 1,
      warning: true,
      info: {
        title: "원자재 창고",
        description: "사출품 출력을 위한 원자재 보관창고",
        details: [
          { label: "CAPACITY", value: "500kg" },
          { label: "FLOW", value: "NORMAL" },
        ]
      }
    },
  ];

  return (
    // ✨ [수정됨] VpnGuard로 전체 컨테이너를 감싸주어 보안 체크 수행
    <VpnGuard>
      <Container>
        <ContentShell>
          
          {/* ✅ Layer 1: 3D 배경 */}
          <BackgroundLayer>
            <DynamicFullScreenGlbViewer 
              models={myModels} 
              portalRef={overlayRef} 
            />
          </BackgroundLayer>

          {/* ✅ Layer 2: UI 패널 */}
          <UiLayer>
            <Wrapper>
              <MaterialStockPanel/> 
              <DryerTemperaturePanel title={"건조기 온도 이상"} rows={defaultDryerRows}/>
              <InjectionPressurePanel/>
              <CoolantTemperaturePanel rows={coolantRows}/>
              <DryerTemperaturePanel title={"절합압력(bar)"} rows={MoldTemperatureImbalanceRows}/>
              <DwellTimePanel status={defaultDwellStatus}/>
            </Wrapper>
            <BaseLineDate>{timeString}</BaseLineDate>
          </UiLayer>

          {/* ✅ Layer 3: 포탈 레이어 & 로더 */}
          <PortalLayer ref={overlayRef} />
          <CyberpunkLoader duration={2}/>
        </ContentShell>
      </Container>
    </VpnGuard>
  );
};

export default DevSvgPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100vh; 
  background-color: #101828;
  position: relative;
  overflow: hidden;
`;

const ContentShell = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #050505;
`;

// 3D 뷰어 레이어
const BackgroundLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

// UI 패널 레이어
const UiLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none; /* 빈 공간 클릭 투과 */
`;

const Wrapper = styled.div`
  width: 100%;
  gap: 10px;
  display: grid;
  grid-template-columns: .6fr 1fr 1fr 1fr 1fr 1fr;
  align-items: flex-start;
  color: white;
  pointer-events: auto; /* 패널 조작 허용 */
  margin-top: 20px;
`;

const BaseLineDate = styled.p`
  width: 100%;
  text-align: right;
  color: #8898B1;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  margin-top: 10px;
  pointer-events: auto;
`;

// ✨ 최상위 포탈 레이어
const PortalLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100; /* UI 패널보다 높게 설정 */
  pointer-events: none;
  overflow: hidden;
`;