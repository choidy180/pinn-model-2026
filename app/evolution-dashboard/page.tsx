"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { motion, animate, useInView } from "framer-motion";

// --- 1. Global Styles ---
const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", sans-serif;
    color: #ffffff;
    overflow: hidden;
  }
`;

// --- 2. Data Configuration ---
const MAIN_DATA = [
  { id: 1, label: "현장 데이터", value: 10, display: 100, unit: "GB", type: "normal" },
  { id: 2, label: "초거대 AI", value: 25, display: 3, unit: "TB", type: "accent" },
  { id: 3, label: "PINN 모델", value: 85, display: 79, unit: "TB", target: 24, type: "hero" },
  { id: 4, label: "기타 소스", value: 5, display: 50, unit: "GB", type: "normal" },
];

const PROCESS_DATA = [
  {
    id: 1,
    name: "자재창고",
    unit: "입고 정확도",
    target: [20, 35, 45, 60, 70, 80],
    actual: [20, 38, 55, 75, 88, 98],
    currentScore: 98, 
    goalScore: 80,    // 요청하신 수치로 변경 (98 - 80 = 18% 초과)
    scoreUnit: "%",
    color: "#2997ff", // Blue
  },
  {
    id: 2,
    name: "사출설비",
    unit: "생산 효율성",
    target: [30, 40, 50, 60, 75, 85],
    actual: [32, 45, 65, 80, 92, 115],
    currentScore: 115,
    goalScore: 85,
    scoreUnit: "%",
    color: "#bf5af2", // Purple
  },
  {
    id: 3,
    name: "건조실",
    unit: "온도 유지율",
    target: [50, 55, 60, 65, 70, 75],
    actual: [50, 58, 68, 80, 89, 94],
    currentScore: 94,
    goalScore: 84,    // 요청하신 수치로 변경 (94 - 84 = 10% 초과)
    scoreUnit: "%",
    color: "#ff9f0a", // Orange
  },
  {
    id: 4,
    name: "패킹공정",
    unit: "시간당 처리량",
    target: [20, 30, 40, 50, 60, 70],
    actual: [22, 35, 55, 70, 85, 99],
    currentScore: 99,
    goalScore: 70,
    scoreUnit: "ea",
    color: "#30d158", // Green
  },
];

// --- 3. Helper Component: Real-time Counter ---
interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
}

function CountUp({ from = 0, to, duration = 2, delay = 0, suffix = "" }: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!inView) return;
    
    const node = nodeRef.current;
    
    const controls = animate(from, to, {
      duration: duration,
      delay: delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        if (node) {
          node.textContent = Math.round(value).toLocaleString() + suffix;
        }
      },
    });

    return () => controls.stop();
  }, [from, to, duration, delay, inView, suffix]);

  return <span ref={nodeRef} />;
}


// --- 4. Styled Components ---

const Container = styled.main`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000;
  padding: 4vh 5vw;
  gap: 3vh;
`;

const AmbientLight = styled.div`
  position: absolute;
  width: 120vh;
  height: 120vh;
  background: radial-gradient(circle, rgba(41, 151, 255, 0.08) 0%, rgba(0, 0, 0, 0) 65%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
`;

// === TOP SECTION ===
const TopSection = styled.section`
  flex: 5;
  display: grid;
  grid-template-columns: 0.8fr 2.5fr;
  align-items: center;
  gap: 4vw;
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  padding-bottom: 2vh;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MainTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 3.5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
  margin-bottom: 1.5vh;
  word-break: keep-all;

  span {
    background: linear-gradient(90deg, #4aacff, #d17aff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Description = styled(motion.p)`
  font-size: clamp(1rem, 1.1vw, 1.25rem);
  line-height: 1.6;
  color: #e0e0e0;
  max-width: 450px;
  word-break: keep-all;
`;

const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2vh;
  width: 100%;
  height: 100%;
`;

const BarRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr 140px;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 6vh;
`;

const BarLabel = styled(motion.div)`
  text-align: right;
  color: #d1d1d6;
  font-weight: 600;
  font-size: 1.1rem;
  white-space: nowrap;
`;

const BarTrack = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
`;

const BarFill = styled(motion.div)<{ $type: string }>`
  height: 100%;
  border-radius: 8px;
  background: ${({ $type }) => 
    $type === "hero" ? "linear-gradient(90deg, #5e5ce6, #bf5af2)" : 
    $type === "accent" ? "#0a84ff" : "#555"};
  box-shadow: ${({ $type }) => $type === "hero" ? "0 0 25px rgba(191, 90, 242, 0.6)" : "none"};
`;

const BarValue = styled(motion.div)<{ $isHero: boolean }>`
  text-align: left;
  font-weight: 800;
  color: #ffffff;
  font-size: ${({ $isHero }) => ($isHero ? "3rem" : "2rem")};
  text-shadow: 0 0 10px rgba(0,0,0,0.5);
  padding-left: 10px;
  display: flex; 
  align-items: baseline;
`;

const TargetLineTop = styled(motion.div)`
  position: absolute;
  top: -20%; bottom: -20%;
  width: 3px;
  background-color: #ff3b30;
  z-index: 5;
  box-shadow: 0 0 15px rgba(255, 59, 48, 1);
  
  &::after {
    content: ''; position: absolute; bottom: 0; left: -5px;
    width: 13px; height: 13px; border-radius: 50%; background: #ff3b30;
    box-shadow: 0 0 10px rgba(255, 59, 48, 1);
  }
`;

const TargetLabelTop = styled.div`
  position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
  background: #ff3b30;
  color: #fff;
  padding: 6px 12px; 
  border-radius: 20px; 
  font-weight: 800; 
  font-size: 1rem;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(255, 59, 48, 0.4);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '';
    position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #ff3b30;
  }
`;


// === BOTTOM SECTION ===
const BottomSection = styled.section`
  flex: 4;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5vw;
  width: 100%;
  min-height: 0;
`;

const Card = styled(motion.div)`
  background: rgba(30, 30, 35, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 2vh 1.5vw;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  height: 100%; 
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5vh;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProcessTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
`;

const ProcessUnit = styled.span`
  font-size: 1.2rem;
  color: #d1d1d6;
`;

const StatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  margin-bottom: 1.5vh;
`;

const MainScoreWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const MainScore = styled.div<{ $color: string }>`
  font-size: 3rem;
  font-weight: 800;
  color: ${({ $color }) => $color};
  line-height: 1;
  text-shadow: 0 0 20px ${({ $color }) => $color}40;
`;

const DetailStatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
`;

const DetailStatBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-size: 1.1rem;
  color: #c7c7ca;
`;

const DetailValue = styled.span<{ $isPositive?: boolean }>`
  font-size: 1.65rem;
  font-weight: 700;
  color: ${({ $isPositive }) => $isPositive ? "#30d158" : "#fff"};
`;

const GraphArea = styled.div`
  flex-grow: 1;
  width: 100%;
  position: relative;
  overflow: visible; 
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 12px;
  display: flex;
  align-items: flex-end;
`;

const StyledSVG = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const getPath = (data: number[], width: number, height: number) => {
  if (data.length === 0) return "";
  const paddingY = height * 0.2; 
  const usableHeight = height - 2 * paddingY;
  const maxValue = 130; 

  const points = data.map((val, i) => [
    (i / (data.length - 1)) * width,
    height - paddingY - (val / maxValue) * usableHeight
  ]);

  return points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point[0]},${point[1]}`;
    const cp1x = a[i - 1][0] + (point[0] - a[i - 1][0]) * 0.5;
    const cp1y = a[i - 1][1];
    const cp2x = point[0] - (point[0] - a[i - 1][0]) * 0.5;
    const cp2y = point[1];
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point[0]},${point[1]}`;
  }, "");
};


export default function RealTimeReportFinal() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <GlobalStyle />
      <Container>
        <AmbientLight />

        {/* 1. 상단: Grid Layout */}
        <TopSection>
          <TextGroup>
            <MainTitle
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              PINN 프로젝트 <br />
              <span>데이터 현황.</span>
            </MainTitle>
            <Description
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              실시간 데이터 수집 및 분석 현황입니다.<br/>
              PINN 모델의 목표 달성 추이를 확인하세요.
            </Description>
          </TextGroup>

          <BarChartContainer>
            {MAIN_DATA.map((item, idx) => (
              <BarRow key={item.id}>
                <BarLabel
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + idx*0.1 }}
                >{item.label}</BarLabel>
                
                <BarTrack>
                  <BarFill 
                    $type={item.type}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.2, delay: 0.4 + idx*0.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {item.target && (
                    <TargetLineTop 
                      style={{ left: `${item.target}%` }}
                      initial={{ height: 0 }} animate={{ height: "130%" }} transition={{ delay: 1.8 }}
                    >
                      <TargetLabelTop>
                        🎯 목표: 24TB
                      </TargetLabelTop>
                    </TargetLineTop>
                  )}
                </BarTrack>

                <BarValue 
                    $isHero={item.type === "hero"}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 + idx*0.1 }}
                >
                    <CountUp to={item.display} duration={2} delay={1.5} />
                    <span style={{ fontSize: '0.6em', marginLeft: '4px', opacity: 0.7 }}>{item.unit}</span>
                </BarValue>
              </BarRow>
            ))}
          </BarChartContainer>
        </TopSection>

        {/* 2. 하단: 리얼타임 카운팅 + 달성률 표시 */}
        <BottomSection>
          {PROCESS_DATA.map((proc, idx) => (
            <ProcessCard key={proc.id} data={proc} index={idx} />
          ))}
        </BottomSection>
      </Container>
    </>
  );
}

function ProcessCard({ data, index }: { data: any; index: number }) {
  const width = 300; 
  const height = 100;
  const targetPath = useMemo(() => getPath(data.target, width, height), [data.target]);
  const actualPath = useMemo(() => getPath(data.actual, width, height), [data.actual]);

  // 로직 변경: 요청하신 대로 목표값은 고정하고, 차이를 계산
  const excessVal = data.currentScore - data.goalScore;

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
    >
      <div>
        <CardHeader>
          <TitleGroup>
            <ProcessTitle>{data.name}</ProcessTitle>
            <ProcessUnit>{data.unit}</ProcessUnit>
          </TitleGroup>
        </CardHeader>
        
        <StatRow>
          {/* 1. 메인 점수 */}
          <MainScoreWrapper>
            <MainScore $color={data.color}>
                <CountUp to={data.currentScore} duration={2.5} delay={1 + index * 0.2} />
            </MainScore>
            <span style={{ fontSize: '1.4rem', fontWeight: 600, color: data.color }}>{data.scoreUnit}</span>
          </MainScoreWrapper>
          
          {/* 2. 상세 지표 (목표, 초과) */}
          <DetailStatsGrid>
            <DetailStatBox>
                <DetailLabel>목표</DetailLabel>
                <DetailValue>
                    {/* 목표값 자체를 표시 (예: 80) */}
                    <CountUp to={data.goalScore} duration={2} delay={1.5} suffix={data.scoreUnit} />
                </DetailValue>
            </DetailStatBox>
            <DetailStatBox>
                <DetailLabel>초과 달성</DetailLabel>
                <DetailValue $isPositive={excessVal > 0}>
                  {excessVal > 0 ? "+" : ""}
                  {/* 현재값 - 목표값 (예: 98 - 80 = 18) */}
                  <CountUp to={excessVal} duration={2} delay={1.8} suffix={data.scoreUnit} />
                </DetailValue>
            </DetailStatBox>
          </DetailStatsGrid>

        </StatRow>
      </div>

      <GraphArea>
        <StyledSVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <line x1="0" y1={height} x2={width} y2={height} stroke="#ffffff" strokeWidth="1" opacity="0.1" />
          
          <motion.path
            d={targetPath} fill="none" stroke="#ff453a" strokeWidth="2" strokeDasharray="4 3" opacity="0.6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.2 }}
          />
          <motion.path
            d={actualPath} fill="none" stroke={data.color} strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            filter={`drop-shadow(0 0 8px ${data.color})`}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 1.4 }}
          />
        </StyledSVG>
      </GraphArea>
    </Card>
  );
}