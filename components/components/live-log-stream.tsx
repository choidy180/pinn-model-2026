"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

/* --- 1. 데이터 정의 (기존 유지) --- */
const CAMERAS = ["카메라-01 (투입구)", "카메라-02 (조립라인)", "카메라-03 (검사구역)", "카메라-04 (포장라인)"];

const LOG_TYPES = {
  DETECT: { label: "객체 인식", color: "#32d74b", desc: "객체 감지" },   // 초록
  POSE:   { label: "자세 추정", color: "#0a84ff", desc: "스켈레톤" },    // 파랑
  TRACK:  { label: "사물 추적", color: "#bf5af2", desc: "ID 추적" },     // 보라
  ACTION: { label: "행동 분석", color: "#ffd60a", desc: "행동 분류" },   // 노랑
  ANOMALY:{ label: "이상 감지", color: "#ff453a", desc: "위험 알림" },   // 빨강
};

const generatePhysicalAILog = () => {
  const typeKeys = Object.keys(LOG_TYPES);
  const isAnomaly = Math.random() < 0.05;
  const typeKey = isAnomaly ? "ANOMALY" : typeKeys[Math.floor(Math.random() * (typeKeys.length - 1))];
  
  const typeInfo = LOG_TYPES[typeKey as keyof typeof LOG_TYPES];
  const cam = CAMERAS[Math.floor(Math.random() * CAMERAS.length)];
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString("ko-KR", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + `.${Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0')}`;

  let content = "";
  const id = Math.floor(Math.random() * 9000) + 1000;
  const conf = (Math.random() * (0.99 - 0.88) + 0.88).toFixed(4);

  switch (typeKey) {
    case "DETECT":
      content = `분류: '작업자_안전모_착용' | 영역:[${Math.floor(Math.random()*640)},${Math.floor(Math.random()*480)},128,256] | 정확도:${conf}`;
      break;
    case "POSE":
      content = `ID:${id} | 관절포인트: 17/17 검출 | 상태: 서있음 | 손_벡터: [0.12, -0.88]`;
      break;
    case "TRACK":
      content = `ID:${id} -> 재식별 일치 (IoU: ${conf}) | 칼만 필터: 갱신됨 | 속도: 0.8m/s`;
      break;
    case "ACTION":
      const acts = ["조립_작업_중", "품질_검사_중", "자재_운반_중", "물류_이동_중"];
      content = `ID:${id} | 행동_유형: ${acts[Math.floor(Math.random()*acts.length)]} | 점수:${conf}`;
      break;
    case "ANOMALY":
      content = `[경고] ID:${id} | 보호구_미착용 (안전모) | 관심_구역: B구역 | 점수:${conf}`;
      break;
  }

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    time: timeStr,
    type: typeKey,
    label: typeInfo.label,
    color: typeInfo.color,
    source: cam,
    content: content,
  };
};

const LiveInfiniteLogStream = () => {
  const MAX_VISIBLE_LOGS = 14; 
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCounts, setTotalCounts] = useState<Record<string, number>>({
    DETECT: 1240, POSE: 890, TRACK: 3421, ACTION: 560, ANOMALY: 12
  });
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      const newLog = generatePhysicalAILog();
      setLogs((prev) => {
        const updated = [newLog, ...prev];
        if (updated.length > MAX_VISIBLE_LOGS) updated.pop();
        return updated;
      });
      setTotalCounts((prev) => ({
        ...prev,
        [newLog.type]: prev[newLog.type] + 1
      }));
    }, 350); 
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    return Object.entries(LOG_TYPES).map(([key, info]) => ({
      key,
      label: info.label,
      desc: info.desc,
      color: info.color,
      count: totalCounts[key] || 0
    }));
  }, [totalCounts]);

  if (!isMounted) return <Container style={{ opacity: 0 }} />;

  return (
    <Container>
      <Header>
        <div className="status">
          <PulseDot />
          <Title>
            엣지 AI 실시간 추론 스트림
            <span className="subtitle">모델: YOLOv8-Pose-L (INT8)</span>
          </Title>
        </div>
        <FPSBadge>
          <span className="label">FPS</span>
          <span className="value">{(Math.random() * 5 + 58).toFixed(1)}</span>
        </FPSBadge>
      </Header>

      <LogWindow ref={scrollRef}>
        <AnimatePresence mode="popLayout" initial={false}>
          {logs.map((log) => (
            <LogCard
              key={log.id}
              layout 
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }} 
              transition={{ duration: 0.25 }} 
            >
              <div className="meta">
                <Badge style={{ color: log.color, background: log.color + "1A" }}>
                  {log.label}
                </Badge>
                <span className="time">{log.time}</span>
              </div>
              <Content>
                <span className="source">[{log.source}]</span> {log.content}
              </Content>
            </LogCard>
          ))}
        </AnimatePresence>
        <FadeOverlay />
      </LogWindow>

      <FooterStats>
        <StatHeader>
          <span className="label">TOTAL EVENTS</span>
          <span className="total-num">
            {Object.values(totalCounts).reduce((a, b) => a + b, 0).toLocaleString()}
          </span>
        </StatHeader>
        <StatGrid>
          {stats.map((item) => (
            <StatItem key={item.key} $color={item.color}>
              <div className="label-row">
                <div className="dot" />
                <span className="name">{item.label}</span>
              </div>
              <div className="value-row">
                {item.count.toLocaleString()}
              </div>
            </StatItem>
          ))}
        </StatGrid>
      </FooterStats>
    </Container>
  );
};

export default LiveInfiniteLogStream;

/* --- CSS Styles --- */

const Container = styled.div`
  width: 520px;
  height: 100%;
  background: rgba(9, 11, 16, 0.95); 
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(56, 139, 253, 0.2); 
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(13, 17, 23, 0.9);
  border-bottom: 1px solid rgba(48, 54, 61, 0.8);
  flex-shrink: 0;

  .status { display: flex; align-items: center; gap: 12px; }
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
  line-height: 1.2;

  .subtitle {
    font-size: 18px;
    color: #8b949e;
    font-weight: 400;
  }
`;

const FPSBadge = styled.div`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  .label { font-size: 10px; color: #8b949e; font-weight: 700; }
  .value { font-size: 14px; color: #32d74b; font-weight: 700; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(50, 215, 75, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(50, 215, 75, 0); }
  100% { box-shadow: 0 0 0 0 rgba(50, 215, 75, 0); }
`;

const PulseDot = styled.div`
  width: 8px;
  height: 8px;
  background: #32d74b;
  border-radius: 50%;
  animation: ${pulse} 1.5s infinite;
`;

const LogWindow = styled.div`
  flex: 1;
  position: relative;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden; 
  background: #050505;
`;

const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #050505);
  pointer-events: none;
  z-index: 10;
`;

const LogCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(22, 27, 34, 0.6);
  border: 1px solid rgba(48, 54, 61, 0.5);
  border-radius: 6px;
  
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .time {
    font-size: 13px;
    color: #6e7681;
    font-family: monospace;
  }
`;

const Badge = styled.span`
  font-size: 13px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
`;

const Content = styled.div`
  font-size: 15px;
  color: #c9d1d9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .source {
    color: #8b949e;
    margin-right: 6px;
    font-size: 13px;
  }
`;

/* --- 개선된 Footer 스타일 (가독성 UP, 줄장식 제거) --- */

const FooterStats = styled.div`
  padding: 16px 20px 24px;
  background: #0d1117;
  border-top: 1px solid #30363d;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(48, 54, 61, 0.5);
  
  .label {
    font-size: 18px; /* 글자 크기 증가 */
    font-weight: 700;
    color: #8b949e;
    letter-spacing: 1px;
  }

  .total-num {
    font-size: 20px; /* 글자 크기 증가 */
    color: #fff;
    font-weight: 800;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 12px;
`;

const StatItem = styled.div<{ $color: string }>`
  background: linear-gradient(145deg, rgba(22, 27, 34, 0.8), rgba(13, 17, 23, 0.9));
  padding: 14px; /* 패딩 증가 */
  border-radius: 8px;
  /* border-left 삭제됨 */
  border: 1px solid ${props => props.$color}33; /* 전체적으로 얇은 테두리 추가하여 구분감 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8px; /* 간격 증가 */
  transition: transform 0.1s;

  &:hover {
    background: rgba(30, 35, 45, 0.9);
  }

  .label-row {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .dot { 
      width: 8px; /* 점 크기 증가 */ 
      height: 8px; 
      border-radius: 50%; 
      background: ${props => props.$color};
      box-shadow: 0 0 5px ${props => props.$color};
    }
    
    .name { 
      font-size: 18px; /* 라벨 폰트 크기 증가 */
      font-weight: 600; 
      color: #8b949e; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .value-row {
    font-size: 24px; /* 숫자 폰트 크기 대폭 증가 */
    font-weight: 800;
    color: #fff; 
    text-align: right;
    text-shadow: 0 0 10px ${props => props.$color}40;
  }
`;