// AlertPanelBase.tsx
import styled from "styled-components";

export const PANEL_WIDTH = 300;
export const PANEL_HEIGHT = 250;

export const Panel = styled.section`
  width: 100%;
  height: ${PANEL_HEIGHT}px;
  padding: 12px 12px;
  box-sizing: border-box;

  /* 1. 배경: 단색 대신 반투명 그라디언트 적용 */
  /* 기존: background: #263E62; */
  background: #263E62;

  /* 2. 글래스모피즘 핵심: 뒤에 있는 3D 뷰가 흐릿하게 비침 */
  /* backdrop-filter: blur(12px); */
  /* -webkit-backdrop-filter: blur(12px); 사파리 호환 */

  /* 3. 테두리: 단순 선이 아니라 빛을 받는 유리 모서리처럼 표현 (흰색 투명도 조절) */
  /* 기존: border: 1px solid #1e3557; */
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.2); /* 상단 하이라이트 */
  border-radius: 12px; /* 모서리를 조금 더 둥글게 해서 유리 느낌 강조 */

  /* 4. 그림자 & 글로우: 깊이감(검정 그림자) + 네온 느낌(파란 광채) */
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.37), /* 묵직한 그림자로 3D 위에 떠있는 느낌 */
    inset 0 0 0 1px rgba(255, 255, 255, 0.05); /* 내부 미세한 광택 */

  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;

`;

export const PanelHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #e6edf7;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

export const HeaderTitle = styled.span``;

export const HeaderArrow = styled.span`
  font-size: 22px;
  opacity: 0.9;
  cursor: pointer;
`;

export const PanelBody = styled.div`
  margin-top: 7px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

/** Row용 커스텀 props */
type RowProps = {
  variant?: "alert" | "neutral";
  /** 개별 행 배경색 (없으면 variant 기본색 사용) */
  $bgColor?: string;
};

export const Row = styled.div<RowProps>`
  border-radius: 4px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  background: ${({ variant, $bgColor }) =>
    $bgColor
      ? $bgColor
      : variant === "alert"
      ? "#3f0606"
      : "#10203A"};
`;

export const RowLabel = styled.span`
  color: #f2f6ff;
  font-size: 16px;
  font-weight: 500;
`;

export const RowValue = styled.span`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
`;

export const DeltaText = styled.span<{ type?: "up" | "down" | "neutral" }>`
  font-size: 14px;
  font-weight: 700;
  margin-left: 8px;

  color: ${({ type }) => type === "up" ? "#ff624d" : type === "down" ? "#26C951" : "#c0c9dd"};
  width: 50px;
  text-align: right;
`;

// 건조실 / 건조기 전용 공통
export const TwoColumn = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const LabelMuted = styled.span`
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
`;

export const ValueStrong = styled.span`
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
`;

// 건조기 전용
export const DryerRowInner = styled.div`
  display: flex;
  column-gap: 8px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  div {
    display: flex;
    align-items: center;
    gap: 0px;

    span {
      width: 35px;
      height: 20px;
      line-height: 20px;
    }
  }
`;

export const DryerRowInnerContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 4px;
`

export const DryerName = styled.span`
  color: #f2f6ff;
  font-size: 16px;
`;

export const DryerLabel = styled.span`
  color: #c0c9dd;
  font-size: 13px;
  &.none {
    display: none;
  }
`;

export const LineDivision = styled.div`
  width: 0.6px;
  height: 20px;
  background-color: #c0c9dd;
  opacity: 0.35;
  margin: 0 8px;
`

export const DryerValue = styled.span`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: right;

  &.temp {
    width: 35px;
  }
`;

export const DeltaTemp = styled.span<{
  $deltaType?: "up" | "down" | "neutral" | "normal";
}>`
  width: 56px !important;
  font-size: 14px;
  font-weight: 700;
  text-align: right;

  color: ${({ $deltaType }) =>
    $deltaType === "up"
      ? "#ff624d"
      : $deltaType === "down"
      ? "#26C951"
      : "#c0c9dd"};
`;
