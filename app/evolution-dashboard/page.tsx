"use client";

import React, { useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { motion, animate, useInView } from "framer-motion";
import { FiDatabase, FiCpu, FiActivity, FiServer, FiLayers, FiZap } from "react-icons/fi";

// --- 1. Global Reset & Fonts ---
const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #000;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: #f5f5f7;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }
`;

// --- 2. Data Constants ---
const BAR_DATA = [
  // 12년 누적 데이터 수치 (1.0, 0.7, 0.6)
  { id: 1, label: "ERP 데이터", value: 1.0, type: "existing", icon: <FiDatabase /> },
  { id: 2, label: "MES 데이터", value: 0.7, type: "existing", icon: <FiCpu /> },
  { id: 3, label: "PRAI 데이터", value: 0.6, type: "existing", icon: <FiActivity /> },
  
  { id: 4, label: "PoC 기업 데이터", value: 1.2, type: "poc", icon: <FiServer /> },
  { id: 5, label: "PoC 공정 데이터", value: 2.5, type: "poc", icon: <FiLayers /> },
  { id: 6, label: "PoC 액션 데이터", value: 75.3, type: "poc", isHero: true, icon: <FiZap /> },
];

const TABLE_DATA = [
  { category: "수집 방식", asIs: "생산 결과만 기록", toBe: "공정 전과정 수집" },
  { category: "활용 방식", asIs: "단순 통계용", toBe: "Physical AI 학습데이터" },
  { category: "저장 구조", asIs: "파편화된 원시데이터", toBe: "전처리 데이터 저장" },
];

const GOAL = 24;
const MAX_VAL = 75.3;

// --- 3. Utilities ---
const CountUp = ({ to, suffix = "", decimals = 1, duration = 2.5 }: any) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true });
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { 
      duration, 
      ease: [0.25, 1, 0.5, 1],
      onUpdate(v) { if (nodeRef.current) nodeRef.current.textContent = v.toFixed(decimals) + suffix; }
    });
    return () => controls.stop();
  }, [to, inView, suffix, decimals, duration]);
  return <span ref={nodeRef} />;
};

// --- 4. Layout Components ---
const Container = styled.div`
  width: 100vw;
  height: calc(100vh - 70px);
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% -20%, #1c1c1e 0%, #000 90%);
  padding: 24px 32px;
  gap: 20px;
`;

// --- Header ---
const HeaderWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  flex: 0 0 auto;
  margin-bottom: 12px;
  text-align: center;
`;

const MainTitle = styled.h1`
  font-size: 64px;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
`;

const SubTitle = styled.div`
  font-size: 32px;
  font-weight: 600;
  color: #a1a1a6;
  display: flex;
  justify-content: center;
  align-items: baseline;
  line-height: 1.2;
  gap: 12px;
  
  strong {
    font-size: 42px;
    font-weight: 800;
    color: #2997ff;
    text-shadow: 0 0 20px rgba(41, 151, 255, 0.5);
  }
`;

// --- Main Grid ---
const MainGrid = styled.div`
  display: grid;
  grid-template-rows: 1.5fr 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
`;

const BentoBox = styled(motion.div)`
  background: #0D0D0D;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
`;

// --- Top Section: Bar Charts ---
const BarContainer = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 60px;
  height: 100%;
  align-items: center;
`;

const BarColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  gap: 24px;
`;

const ColumnHeader = styled.div<{ $color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: ''; width: 4px; height: 20px; background: ${({ $color }) => $color}; border-radius: 2px;
  }
`;

const BarRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr 140px;
  align-items: center;
  gap: 20px;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;

  svg { font-size: 24px; color: #ffffff; }
`;

const Track = styled.div`
  width: 100%;
  height: 40px;
  background: #1C1C1E;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const Fill = styled(motion.div)<{ $color: string; $isHero?: boolean }>`
  height: 100%;
  background: ${({ $color }) => $color};
  border-radius: 8px;
  filter: ${({ $isHero }) => $isHero ? 'brightness(1.1)' : 'none'};
`;

const Value = styled.span<{ $color: string; $isHero?: boolean }>`
  font-size: ${({ $isHero }) => $isHero ? "36px" : "28px"};
  font-weight: ${({ $isHero }) => $isHero ? 800 : 700};
  color: ${({ $color }) => $color};
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

// --- Goal UI ---
const GoalLineContainer = styled.div`
  position: absolute;
  top: 40px;
  bottom: 10px;
  left: 0; right: 0;
  pointer-events: none;
`;

const GoalLine = styled.div`
  position: absolute;
  top: 0; bottom: 0;
  left: ${(GOAL / MAX_VAL) * 100}%;
  width: 2px;
  background: #FF453A;
  z-index: 5;
`;

const GoalBadge = styled.div`
  position: absolute;
  top: -34px;
  left: ${(GOAL / MAX_VAL) * 100}%;
  transform: translateX(-50%);
  background: #FF453A;
  color: white;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  
  &::after {
    content: ''; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
    border-width: 5px 5px 0; border-style: solid; border-color: #FF453A transparent transparent transparent;
  }
`;

// --- Bottom Section ---
const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
  height: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #fff;
  line-height: 1;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 0.6fr 1fr 1fr;
  padding-bottom: 14px;
  border-bottom: 1px solid #333;
  margin-bottom: 8px;
  span { font-size: 20px; font-weight: 600; color: #ffffff; text-align: center; }
  span:first-child { text-align: left; padding-left: 8px; }
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 0.6fr 1fr 1fr;
  padding: 16px 0;
  border-bottom: 1px solid #222;
  align-items: center;
  
  .cat { font-size: 20px; font-weight: 700; color: #fff; padding-left: 8px; }
  .asis { font-size: 20px; font-weight: 500; color: #ffffff; text-align: center; }
  .tobe { font-size: 20px; font-weight: 700; color: #2997ff; text-align: center; }
`;

// --- Elastic J-Curve Chart (Label Position Fixed) ---
function RocketChart() {
  const width = 800; const height = 200; const p = 10;
  
  const startX = p;
  const endX = width - p;
  const startY = height - p;
  const endY = 40; 

  // --- 12년 (점차적으로 올라가는 그래프) ---
  const existingPath = `
    M ${startX},${startY}
    C ${width * 0.3},${height - 15} ${width * 0.6},${height - 25} ${endX},${height - 30}
  `;

  // --- PoC (바닥을 기다가 급등하는 그래프) ---
  const climbStart = width * 0.85;
  const rocketPath = `
    M ${startX},${startY} 
    L ${climbStart},${startY}
    C ${width * 0.92},${startY} ${width * 0.96},${endY + 40} ${endX},${endY}
  `;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{width:'100%', height:'100%', overflow:'visible'}}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2997ff" stopOpacity="0.3"/>
          <stop offset="1" stopColor="#2997ff" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      
      {/* 12년 (Gradual Rise Line) */}
      <path d={existingPath} stroke="#ff9f0a" strokeWidth="4" fill="none" opacity="0.8"/>
      <circle cx={endX} cy={height - 30} r="5" fill="#ff9f0a"/>
      {/* 12년 라벨: 그래프 가려지지 않게 좌측 상단으로 이동 */}
      <text x={width * 0.6} y={height - 50} fill="#ff9f0a" fontSize="26" fontWeight="700" textAnchor="middle">12년 (2.3TB)</text>

      {/* PoC (Flat then Surge) */}
      <path d={rocketPath} stroke="#2997ff" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d={`${rocketPath} L ${endX},${height} L ${startX},${height} Z`} fill="url(#chartFill)"/>
      
      <circle cx={endX} cy={endY} r="8" fill="#2997ff" stroke="#fff" strokeWidth="2"/>
      <text x={endX} y={endY - 20} fill="#2997ff" fontSize="28" fontWeight="800" textAnchor="end">PoC 4개월 (75.3TB)</text>
    </svg>
  );
}

export default function PremiumDashboard() {
  const orange = "#ff9f0a";
  const blue = "#2997ff";

  return (
    <Container>
      <GlobalStyle />
      
      <HeaderWrapper initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <MainTitle>신성델타테크 데이터 수집 현황</MainTitle>
        <SubTitle>
          지난 12년 대비 PoC 4개월간 <strong>34배</strong> 더 많이 수집했습니다.
        </SubTitle>
      </HeaderWrapper>

      <MainGrid>
        {/* Top: Bar Charts */}
        <BentoBox initial={{opacity:0}} animate={{opacity:1}}>
          <BarContainer>
            {/* Left: Existing */}
            <BarColumn>
              <ColumnHeader $color={orange}>기존 (12년 누적)</ColumnHeader>
              {BAR_DATA.filter(d => d.type === 'existing').map((d) => (
                <BarRow key={d.id}>
                  <Label>{d.icon}{d.label}</Label>
                  <Track>
                    {/* 12년 데이터 시각적 보정 (최소값 보장 및 8배 증폭) */}
                    <Fill 
                      $color={orange} 
                      initial={{width:0}} 
                      animate={{width:`${Math.min(Math.max((d.value/MAX_VAL)*100 * 8, 5), 100)}%`}} 
                      transition={{duration:1}}
                    />
                  </Track>
                  <Value $color={orange}><CountUp to={d.value} suffix=" TB"/></Value>
                </BarRow>
              ))}
            </BarColumn>
            
            {/* Right: PoC */}
            <BarColumn style={{position: 'relative'}}>
               <GoalLineContainer>
                 <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <GoalLine />
                    <GoalBadge>목표 24TB</GoalBadge>
                 </div>
               </GoalLineContainer>

              <ColumnHeader $color={blue}>도입 후 (PoC 4개월)</ColumnHeader>
              {BAR_DATA.filter(d => d.type === 'poc').map((d) => (
                <BarRow key={d.id}>
                  <Label>{d.icon}{d.label}</Label>
                  <Track>
                    {/* PoC 데이터 시각적 보정: 보정치 절반으로 축소 (8배 -> 4배) */}
                    <Fill 
                      $color={blue} 
                      $isHero={d.isHero}
                      initial={{width:0}} 
                      animate={{width:`${Math.min(Math.max((d.value/MAX_VAL)*100 * (d.isHero ? 1 : 4), 5), 100)}%`}} 
                      transition={{duration:1.5}}
                    />
                  </Track>
                  <Value $color={blue} $isHero={d.isHero}><CountUp to={d.value} suffix=" TB"/></Value>
                </BarRow>
              ))}
            </BarColumn>
          </BarContainer>
        </BentoBox>

        {/* Bottom Section */}
        <BottomGrid>
          <BentoBox initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
            <SectionTitle>누적 속도 시각화</SectionTitle>
            <div style={{flex:1, width:'100%', display:'flex', alignItems:'flex-end', paddingBottom:'10px'}}>
              <RocketChart />
            </div>
          </BentoBox>

          <BentoBox initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}>
            <SectionTitle>수집 체계 혁신</SectionTitle>
            <div style={{display:'flex', flexDirection:'column', justifyContent:'center', height:'100%'}}>
              <TableHeader>
                <span>구분</span><span>기존 (AS-IS)</span><span>혁신 (TO-BE)</span>
              </TableHeader>
              {TABLE_DATA.map((row, i) => (
                <TableRow key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4+i*0.1}}>
                  <span className="cat">{row.category}</span>
                  <span className="asis">{row.asIs}</span>
                  <span className="tobe">{row.toBe}</span>
                </TableRow>
              ))}
            </div>
          </BentoBox>
        </BottomGrid>
      </MainGrid>
    </Container>
  );
}