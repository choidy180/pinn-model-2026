// alert-panel-base-dev.tsx
import styled, { css, keyframes } from "styled-components";

// ------------------------------------------------------------------
// 애니메이션 정의
// ------------------------------------------------------------------
const pulseRed = keyframes`
  0% { box-shadow: inset 0 0 0 1px rgba(255, 59, 48, 0.3); }
  50% { box-shadow: inset 0 0 0 1px rgba(255, 59, 48, 0.8), 0 0 10px rgba(255, 59, 48, 0.2); }
  100% { box-shadow: inset 0 0 0 1px rgba(255, 59, 48, 0.3); }
`;

export const PANEL_WIDTH = 300;
export const PANEL_HEIGHT = 266;

// ------------------------------------------------------------------
// 메인 패널 스타일
// ------------------------------------------------------------------
export const Panel = styled.section`
  width: 100%;
  height: ${PANEL_HEIGHT}px;
  padding: 12px 14px;
  box-sizing: border-box;
  margin-top: 60px;

  /* ✨ [수정] 배경: 아주 어두운 네이비지만 투명도를 주어 뒤가 비치게 함 */
  background: rgba(13, 17, 30, 0.75);

  /* ✨ [수정] 글래스모피즘: 블러 강도를 높여서 가독성 확보 + 유리 느낌 */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);

  /* 테두리: 은은한 빛 반사 느낌 */
  border: 1px solid rgba(100, 120, 160, 0.3);
  border-top: 1px solid rgba(140, 170, 220, 0.4); /* 상단 하이라이트 */
  border-radius: 12px;

  /* 그림자: 깊이감 추가 */
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);

  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(13, 17, 30, 0.85); /* 호버 시 조금 더 불투명해져서 잘 보이게 */
    border-color: rgba(100, 150, 255, 0.5);
  }
`;

// ------------------------------------------------------------------
// 헤더 스타일
// ------------------------------------------------------------------
export const PanelHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  /* 텍스트: 완전한 흰색 */
  color: #FFFFFF;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  
  padding-bottom: 10px;
  margin-bottom: 6px;
  
  /* 헤더 구분선: 아주 희미하게 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const HeaderTitle = styled.span`
  /* 타이틀 글로우 효과 */
  text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);
  font-size: 20px;
`;

export const HeaderArrow = styled.span`
  font-size: 18px;
  color: #88C0D0; 
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    text-shadow: 0 0 8px #88C0D0;
    transform: translateX(2px);
  }
`;

export const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px; /* 행 간격 */
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

// ------------------------------------------------------------------
// Row (행) 스타일 - 가시성 핵심
// ------------------------------------------------------------------

type RowProps = {
  variant?: "alert" | "neutral";
  $bgColor?: string;
};

export const Row = styled.div<RowProps>`
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  
  /* 높이 고정 */
  min-height: 42px;

  /* [배경색 로직]
     - Alert: 반투명한 붉은색
     - Neutral: 반투명한 네이비 (패널보다 살짝 밝게)
  */
  background: ${({ variant, $bgColor }) =>
    $bgColor
      ? $bgColor
      : variant === "alert"
      ? "rgba(80, 20, 20, 0.7)" 
      : "rgba(30, 40, 60, 0.5)"};

  /* 테두리: Alert일 때만 붉은색 강조 */
  border: 1px solid ${({ variant }) => 
    variant === "alert" ? "rgba(255, 80, 80, 0.4)" : "rgba(255, 255, 255, 0.05)"};


  /* Alert 애니메이션 */
  ${({ variant }) =>
    variant === "alert" &&
    css`
      animation: ${pulseRed} 2s infinite ease-in-out;
    `}

  transition: transform 0.2s, background 0.2s;

  &:hover {
    background: ${({ variant }) =>
      variant === "alert"
        ? "rgba(100, 30, 30, 0.8)"
        : "rgba(45, 55, 80, 0.7)"};
  }
`;

export const RowLabel = styled.span`
  /* 라벨: 밝은 그레이화이트 */
  color: #E2E8F0;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.01em;
`;

export const RowValue = styled.span`
  /* 값: 완전한 흰색 + 굵게 */
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Segoe UI', sans-serif;
`;

export const DeltaText = styled.span<{ type?: "up" | "down" | "neutral" }>`
  font-size: 18px;
  font-weight: 700;
  margin-left: 8px;
  min-width: 48px;
  text-align: right;
  
  /* 색상: 형광톤으로 눈에 띄게 */
  color: ${({ type }) =>
    type === "up"
      ? "#FF6B6B" /* Bright Red */
      : type === "down"
      ? "#4ADE80" /* Bright Green */
      : "#94A3B8"};
`;

// ------------------------------------------------------------------
// 건조실 / 건조기 전용 컴포넌트
// ------------------------------------------------------------------
export const TwoColumn = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const LabelMuted = styled.span`
  color: #CBD5E1; 
  font-size: 18px;
  font-weight: 500;
`;

export const ValueStrong = styled.span`
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 700;
`;

// 건조기 내부
export const DryerRowInner = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export const DryerRowInnerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px; /* 간격 조정 */

  /* 각 데이터 블록 (기준, 현재) */
  & > div {
    display: flex;
    align-items: center;
    gap: 6px; /* 라벨과 값 사이 간격 */
  }
`;

export const DryerName = styled.span`
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  min-width: 80px;
`;

export const DryerLabel = styled.span`
  color: #94A3B8;
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap; /* 줄바꿈 방지 */
  
  &.none {
    display: none;
  }
`;

export const LineDivision = styled.div`
  width: 1px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  /* margin: 0 6px; -> 불필요하므로 제거하거나 컨테이너 gap으로 대체 */
`;

export const DryerValue = styled.span`
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 700;
  text-align: right;

  &.temp {
    /* min-width: 42px; -> 제거하고 자연스럽게 너비 차지하도록 */
  }
`;

export const DeltaTemp = styled.span<{
  $deltaType?: "up" | "down" | "neutral" | "normal";
}>`
  min-width: 50px;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
  margin-left: 8px; /* 다른 값들과 간격 추가 */

  /* 온도 변화: 확실한 색상 구분 */
  color: ${({ $deltaType }) =>
    $deltaType === "up"
      ? "#FF6B6B"
      : $deltaType === "down"
      ? "#4ADE80"
      : "#94A3B8"};
`;