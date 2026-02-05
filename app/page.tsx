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
  defaultDwellStatus, 
} from "@/data/temp-data";
import CyberpunkLoader from "@/components/start-punk-loader";

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
    // ✅ 기기 1: 드라이 존 (기존 에러 유지)
    { 
      url: itemPath, 
      position: [-0.4, 0.575, -0.55], 
      type: 'interactive',
      scale: 2.5,
      warning: true, // 경고 상태 ON
      info: {
        title: "건조기", // DEMO_ERROR_DATA에 '건조기' 키가 없으면 DEFAULT 에러가 뜰 수 있음 (원하시면 errorDetails 직접 추가 가능)
        description: "원자재를 건조시키는 공정",
        details: [
          { label: "TEMP", value: "85°C" },
          { label: "HUMIDITY", value: "12%" },
          { label: "STATUS", value: "CHECK" }, // 상태 텍스트 변경
          { label: "POWER", value: "2400W" },
        ]
      }
    },
    // ✅ 기기 2: 드럼 튜브 (정상)
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
    // ✅ [수정됨] 기기 3: 통합 머신 (여기에 두 번째 에러 적용!)
    { 
      url: item3Path, 
      position: [-0.8, 0, 1.4], 
      type: 'interactive',
      scale: 5.4,
      warning: false, // 🚨 경고 활성화
      // 👇 여기에 아까 만든 구체적인 에러 내용을 직접 주입합니다.
      errorDetails: {
        cause: "사출 보압 공정 중 스크류 역류 및 유압 펌프 압력 저하 (Backflow & Pressure Loss)", 
        solution: "스크류 체크 링(Check Ring) 마모 점검 및 유압 솔레노이드 밸브 교체 필요" 
      },
      info: {
        title: "사출설비",
        description: "사출품 출력 공정",
        details: [
          { label: "UPTIME", value: "89.2%" }, // 에러 상황 반영하여 수치 조정
          { label: "ERRORS", value: "1" },      // 에러 카운트 1
        ]
      }
    },
    // ✅ 기기 4: 자재 관리 (기존 warning: true였으나, 에러가 너무 많으면 산만하므로 false로 끄는 것을 추천)
    { 
      url: item4Path, 
      position: [4.52, 0.52, -0.05], 
      type: 'interactive',
      scale: 1,
      warning: false, // 🚨 집중을 위해 여기는 정상으로 변경 (원하시면 true 유지)
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
            <DryerTemperaturePanel title={"건조기 온도 이상"}/>
            <InjectionPressurePanel/>
            <CoolantTemperaturePanel/>
            <DryerTemperaturePanel title={"절합압력(bar)"}/>
            <DwellTimePanel status={defaultDwellStatus}/>
          </Wrapper>
          <BaseLineDate>{timeString}</BaseLineDate>
        </UiLayer>

        {/* ✅ Layer 3: 포탈 레이어 & 로더 */}
        <PortalLayer ref={overlayRef} />
        <CyberpunkLoader duration={2}/>
      </ContentShell>
    </Container>
  );
};

export default DevSvgPage;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: calc(100vh); 
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
  grid-template-columns: .65fr 1fr 1fr 1fr 1fr 1fr;
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