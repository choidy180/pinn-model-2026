import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { useRouter, useSearchParams } from "next/navigation";
import SearchPanelBasic from "./panel/search-panel-basic";
import SearchClipPanel from "./panel/search-clip-panel";

type TabKey = "inquiry" | "clip" | "";

// ───────────────────── 스타일 정의 ─────────────────────

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

// position: relative 추가 (내부 Indicator 배치를 위해)
const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #1b2940;
  position: relative;
  z-index: 9999;
`;

// ✅ 움직이는 하얀색 막대
const ActiveIndicator = styled.div<{ $index: number; $width: number }>`
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 3px;
  background-color: #ffffff;
  border-radius: 3px;
  
  width: ${({ $width }) => $width}px;
  
  /* 위치 이동 애니메이션 */
  transform: translateX(${({ $index, $width }) => $index * $width}px);
  
  /* 부드러운 전환 효과 */
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  
  /* 탭 선택 안됨(-1)일 경우 숨김 */
  opacity: ${({ $index }) => ($index < 0 ? 0 : 1)};
`;

const TabButton = styled.button<{ $active?: boolean }>`
  position: relative;
  background: transparent;
  border: none;
  width: 150px; /* 고정 너비 */
  padding: 8px 0;
  font-size: 18px;
  color: ${({ $active }) => ($active ? "#ffffff" : "#7c8aa4")};
  cursor: pointer;
  transition: all ease-in-out .15s;

  &:focus {
    outline: none;
  }

  &:hover {
    color: #ffffff;
  }

  /* ❌ 기존 ::after (고정 밑줄) 제거함 */
`;

const Wrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  box-sizing: border-box;
  overflow: hidden;
`;

// ───────────────────── 메인 컴포넌트 ─────────────────────

const SearchDashboard: React.FC = () => {
  const param = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("");
  const TAB_WIDTH = 150; // 탭 버튼 너비

  useEffect(() => {
    if (param.get('selected') === "inquiry") {
      setActiveTab("inquiry");
    } else {
      // 기본값은 clip (혹은 파라미터 없을 때 처리)
      setActiveTab("clip");
    }
  }, [param]);

  // ✅ 현재 탭의 인덱스 계산 (0, 1)
  const activeIndex = useMemo(() => {
    switch (activeTab) {
      case "inquiry": return 0;
      case "clip": return 1;
      default: return -1;
    }
  }, [activeTab]);

  return (
    <PageWrapper>
      <TabBar>
        <TabButton
          $active={activeTab === "inquiry"}
          onClick={() => router.push('/search?selected=inquiry')}
        >
          조회
        </TabButton>
        <TabButton
          $active={activeTab === "clip"}
          onClick={() => router.push('/search?selected=clip')}
        >
          클립
        </TabButton>

        {/* ✅ 슬라이딩 애니메이션 막대 */}
        <ActiveIndicator $index={activeIndex} $width={TAB_WIDTH} />
      </TabBar>
      <Wrapper>
        {activeTab === "inquiry" && <SearchPanelBasic />}
        {activeTab === "clip" && <SearchClipPanel />}
      </Wrapper>
    </PageWrapper>
  );
};

export default SearchDashboard;