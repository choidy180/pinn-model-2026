"use client";

import React, { useEffect, useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { DRYER_EVENTS } from "@/data/temp-data";
import { useRouter, useSearchParams } from "next/navigation";
import InventoryStatusPanel from "./panel/inventory-status-panel";
import { FaCircleChevronRight } from "react-icons/fa6";

type TabKey = "warehouse" | "dryer";

// 탭 버튼 너비 (인디케이터와 통일)
const TAB_WIDTH = 150;

// ───────────────────── 건조기 데이터 타입 및 Mock 데이터 ─────────────────────

interface DryerInfo {
  id: string;
  name: string;
  temperature: number;
  unit: string;
}

interface DryerStatusRecord {
  timestamp: string;
  location: string;
  dryers: DryerInfo[];
}

const DRYER_STATUS_RECORD: DryerStatusRecord = {
  timestamp: "2025-12-09 14:30:00",
  location: "건조실",
  dryers: [
    { id: "DRY-001", name: "건조기1", temperature: 85.5, unit: "°C" },
    { id: "DRY-002", name: "건조기2", temperature: 87.2, unit: "°C" },
    { id: "DRY-003", name: "건조기3", temperature: 84.8, unit: "°C" },
    { id: "DRY-004", name: "건조기4", temperature: 86.1, unit: "°C" },
    { id: "DRY-005", name: "건조기5", temperature: 84.7, unit: "°C" },
    { id: "DRY-006", name: "건조기6", temperature: 83.7, unit: "°C" },
    { id: "DRY-007", name: "건조기7", temperature: 86.4, unit: "°C" },
    { id: "DRY-008", name: "건조기8", temperature: 85.3, unit: "°C" },
  ],
};

// ───────────────────── styled-components ─────────────────────

const PageWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 70px);
  background: #051328;
  color: #e6edf7;
  font-family: "Pretendard", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #1b2940;
  position: relative;
`;

// 인디케이터에 들어가는 props 타입 정의
const ActiveIndicator = styled.div<{ $index: number; $width: number }>`
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 3px;
  background-color: #ffffff;
  border-radius: 3px;

  width: ${({ $width }) => $width}px;
  transform: translateX(${({ $index, $width }) => $index * $width}px);
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);

  opacity: ${({ $index }) => ($index < 0 ? 0 : 1)};
`;

// 탭 버튼 커스텀 props 타입 정의
const TabButton = styled.button<{ $active?: boolean }>`
  position: relative;
  background: transparent;
  border: none;
  width: ${TAB_WIDTH}px;
  padding: 8px 0;
  font-size: 18px;
  color: ${({ $active }) => ($active ? "#ffffff" : "#7c8aa4")};
  transition: all 0.15s ease-in-out;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:hover {
    color: #ffffff;
  }
`;

const ContentShell = styled.div`
  flex: 1;
  background: #0e1f38;
  padding: 30px;
  box-sizing: border-box;
  gap: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 30px;
  background-color: #1c3151;
  border-radius: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const SectionTitle = styled.h2`
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 10px;
  color: #d4dbe6;
`;

const TopBottomLayout = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`;

// ───────────────────── 카드 그리드 ─────────────────────

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
`;

// 온도 상태 카드
const StatusCard = styled.div<{ $hot?: boolean }>`
  background: ${({ $hot }) => ($hot ? "#741C1C" : "#21337C")} !important;
  border: 2px solid ${({ $hot }) => ($hot ? "#F46161" : "#586AB1")};
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const CardHeader = styled.div`
  font-size: 24px;
  font-family: "Pretendard";
  font-weight: 700;
`;

const CardRow = styled.div<{ $hot?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  color: #ffffff;
  padding: 4px 0;
  border-bottom: 0.6px solid ${({ $hot }) => ($hot ? "#b76969" : "#5e7597")};

  &:last-child {
    border-bottom: none;
  }
`;

const LeftLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ValueStrong = styled.span`
  font-size: 30px;
  font-weight: 900;
  color: #ffffff;
`;

const MaterialText = styled.span`
  font-size: 30px;
  font-weight: 900;
  color: #ffffff;
`;

// ───────────────────── 테이블 영역 ─────────────────────

const TablePanel = styled.div`
  flex: 1;
  background: #263e62;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TableOuter = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #36527d;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  background: #12243e;
  color: #c0c9dd;
  font-weight: 600;
  border-bottom: 1px solid #1e3557;
  font-size: 16px;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Td = styled.td`
  padding: 8px 10px;
  border-bottom: 1px solid #1b2940;
  color: #e6edf7;
  white-space: nowrap;
  font-size: 16px;
`;

const Tr = styled.tr<{ $odd?: boolean }>`
  background: ${({ $odd }) => ($odd ? "#22375a" : "transparent")};

  &:hover {
    background: #31476b;
  }
`;

// ───────────────────── 영상/창고 영역 스타일 & 스켈레톤 ─────────────────────

// 스켈레톤 애니메이션 정의
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const VideoWrapper = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;

const VideoGrid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const VideoCell = styled.div`
  border-radius: 6px;
  border: 1px solid #172641;
  position: relative; /* 중요: 내부 요소 absolute 배치를 위함 */
  overflow: hidden;
  background-color: #000;
  width: 100%;
  height: 100%;
`;

const VideoElement = styled.video<{ $isLoading?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  /* 로딩 중일 때는 비디오를 숨기거나(opacity 0), 뒤에 둠. 여기선 opacity 활용 */
  opacity: ${({ $isLoading }) => ($isLoading ? 0 : 1)};
  transition: opacity 0.3s ease-in;
`;

// ✨ 스켈레톤 컴포넌트
const SkeletonFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10; /* 비디오보다 위에 배치 */
  
  /* 어두운 테마에 맞는 스켈레톤 색상 */
  background: linear-gradient(
    90deg,
    #172641 25%,
    #2a3e5c 50%,
    #172641 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

// ───────────────────── 뷰: 건조기 / 창고 ─────────────────────

const DryerView: React.FC = () => {
  const dryers = DRYER_STATUS_RECORD.dryers;

  return (
    <ContentShell>
      <Container>
        <SectionTitle>건조기 현황</SectionTitle>

        <TopBottomLayout>
          <CardGrid>
            {dryers.map((dryer) => {
              // TODO: 실제 온도 기준으로 hot 여부 계산
              const targetTemp = 85.0;
              // 현재온도가 설정온도보다 높으면 hot
              const isHot = dryer.temperature > targetTemp;

              return (
                <StatusCard key={dryer.id} $hot={isHot}>
                  <CardHeader>{dryer.name}</CardHeader>

                  <CardRow $hot={isHot}>
                    <LeftLabel>
                      <FaCircleChevronRight />
                      <span>투입소재</span>
                    </LeftLabel>
                    <MaterialText>PP</MaterialText>
                  </CardRow>

                  <CardRow $hot={isHot}>
                    <LeftLabel>
                      <FaCircleChevronRight />
                      <span>설정온도</span>
                    </LeftLabel>
                    <ValueStrong>85.0℃</ValueStrong>
                  </CardRow>

                  <CardRow $hot={isHot}>
                    <LeftLabel>
                      <FaCircleChevronRight />
                      <span>현재온도</span>
                    </LeftLabel>
                    <ValueStrong>
                      {dryer.temperature}
                      {dryer.unit}
                    </ValueStrong>
                  </CardRow>
                </StatusCard>
              );
            })}
          </CardGrid>

          <TablePanel>
            <TableOuter>
              <Table>
                <thead>
                  <tr>
                    <Th>날짜/시간</Th>
                    <Th>건조기명</Th>
                    <Th>투입 위치</Th>
                    <Th>작업 내용</Th>
                    <Th>ID 코드</Th>
                  </tr>
                </thead>
                <tbody>
                  {DRYER_EVENTS.map((row, idx) => (
                    <Tr key={row.datetime + row.idCode} $odd={idx % 2 === 1}>
                      <Td>{row.datetime}</Td>
                      <Td>{row.dryerName}</Td>
                      <Td>{row.location}</Td>
                      <Td>{row.job}</Td>
                      <Td>{row.idCode}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableOuter>
          </TablePanel>
        </TopBottomLayout>
      </Container>
    </ContentShell>
  );
};

// ✨ [개별 비디오 컴포넌트] 로딩 상태 관리를 위해 분리
const CCTVPlayer: React.FC<{ src: string }> = ({ src }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadedData = () => {
    // 비디오 데이터가 충분히 로드되어 첫 프레임이 준비되면 로딩 해제
    setIsLoading(false);
  };

  return (
    <VideoCell>
      {/* 로딩 중일 때만 스켈레톤 표시 */}
      {isLoading && <SkeletonFrame />}
      
      <VideoElement
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        $isLoading={isLoading}
        onLoadedData={handleLoadedData} // 데이터 로딩 완료 감지
      >
        <source src={src} type="video/mp4" />
        <source src={src.replace(".mp4", ".webm")} type="video/webm" />
        비디오를 재생할 수 없습니다.
      </VideoElement>
    </VideoCell>
  );
};

const WarehouseView: React.FC = () => {
  // ⚠️ [중요] public/videos 폴더 안에 실제 파일명이 있어야 합니다.
  const cctvSources = [
    "/videos/[SHANA]01(192.168.220.101)_20251107_112537_115536.mp4",
    "/videos/[SHANA]02(192.168.220.101)_20251107_102216_105215.mp4",
    "/videos/[SHANA]03(192.168.220.101)_20251123_144410_153113.mp4",
    "/videos/[SHANA]18(192.168.220.101)_20251123_141746_152856.mp4",
  ];

  return (
    <ContentShell>
      <VideoWrapper>
        <VideoGrid>
          {cctvSources.map((src, index) => (
            <CCTVPlayer key={index} src={src} />
          ))}
        </VideoGrid>
      </VideoWrapper>
      <InventoryStatusPanel type="warehouse" />
    </ContentShell>
  );
};

// ───────────────────── 메인 컴포넌트 ─────────────────────

const DryerWarehouseDashboard: React.FC = () => {
  const param = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("warehouse");

  useEffect(() => {
    if (param.get("selected") === "home") {
      setActiveTab("warehouse");
    } else {
      setActiveTab("dryer");
    }
  }, [param]);

  const activeIndex = useMemo(() => {
    switch (activeTab) {
      case "warehouse":
        return 0;
      case "dryer":
        return 1;
      default:
        return -1;
    }
  }, [activeTab]);

  return (
    <PageWrapper>
      <TabBar>
        <TabButton
          $active={activeTab === "warehouse"}
          onClick={() => router.push("/warehouse?selected=home")}
        >
          창고
        </TabButton>
        <TabButton
          $active={activeTab === "dryer"}
          onClick={() => router.push("/warehouse?selected=dryer")}
        >
          건조기
        </TabButton>

        <ActiveIndicator $index={activeIndex} $width={TAB_WIDTH} />
      </TabBar>

      {activeTab === "warehouse" ? <WarehouseView /> : <DryerView />}
    </PageWrapper>
  );
};

export default DryerWarehouseDashboard;