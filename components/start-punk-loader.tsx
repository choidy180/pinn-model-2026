import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// 기존 코드의 CYAN 색상 상수 활용
const COLOR_CYAN_STR = '#5ef6ff';

// =================================================================
// 🎞️ Animations
// =================================================================

// 게이지가 차오르는 애니메이션 (디지털적인 끊김 효과 추가)
const fillProgress = keyframes`
  0% { width: 0%; }
  15% { width: 22%; }
  30% { width: 35%; opacity: 0.8; }
  45% { width: 60%; }
  60% { width: 65%; opacity: 1; }
  75% { width: 85%; }
  90% { width: 92%; }
  100% { width: 100%; }
`;

// 스캔라인이 내려오는 효과
const scanlineMove = keyframes`
  0% { background-position: 0 -100vh; }
  100% { background-position: 0 100vh; }
`;

// 텍스트 글리치 효과
const textGlitch = keyframes`
  0% { text-shadow: 1px 0 0 red, -1px 0 0 blue; }
  5% { text-shadow: 1px 0 0 red, -1px 0 0 blue; }
  6% { text-shadow: -2px 0 0 red, 2px 0 0 blue; transform: translate(-1px, 1px); }
  7% { text-shadow: 1px 0 0 red, -1px 0 0 blue; transform: translate(0, 0); }
  100% { text-shadow: 1px 0 0 red, -1px 0 0 blue; }
`;

// 전체 오버레이가 사라지는 애니메이션
const fadeOut = keyframes`
  to { opacity: 0; visibility: hidden; }
`;

// =================================================================
// 🎨 Styled Components
// =================================================================

const LoaderWrapper = styled.div<{ $finished: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #050505;
  z-index: 9999999; // 최상위 레벨
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
  // 스캔라인 오버레이
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      rgba(94, 246, 255, 0.05) 1px,
      transparent 2px
    );
    pointer-events: none;
    background-size: 100% 4px;
  }

  // 로딩 완료 후 페이드 아웃
  ${props => props.$finished && css`
    animation: ${fadeOut} 0.5s ease-out forwards;
    pointer-events: none;
  `}
`;

const ContentContainer = styled.div`
  position: relative;
  width: 80%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopDeco = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: ${COLOR_CYAN_STR};
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;

  .status-text {
    animation: ${textGlitch} 2s infinite linear alternate-reverse;
  }
`;

// 게이지 바 컨테이너
const ProgressTrack = styled.div`
  width: 100%;
  height: 24px;
  background: rgba(10, 20, 30, 0.8);
  border: 2px solid rgba(94, 246, 255, 0.3);
  box-shadow: 0 0 15px rgba(94, 246, 255, 0.1), inset 0 0 10px rgba(94, 246, 255, 0.05);
  padding: 3px;
  position: relative;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);

  // 회로도 장식 느낌
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    right: -2px;
    width: 10px;
    height: 8px;
    border-right: 2px solid ${COLOR_CYAN_STR};
    border-bottom: 2px solid ${COLOR_CYAN_STR};
  }
`;

// 실제 차오르는 바
const ProgressBar = styled.div<{ $duration: number }>`
  height: 100%;
  background: linear-gradient(90deg, ${COLOR_CYAN_STR}, #a0f9ff);
  width: 0%;
  box-shadow: 0 0 10px ${COLOR_CYAN_STR}, inset 0 0 5px rgba(255, 255, 255, 0.5);
  animation: ${fillProgress} ${props => props.$duration}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  position: relative;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%);

  // 바 내부의 빛나는 효과
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.4), 
      transparent
    );
    transform: translateX(-100%);
    animation: shift 1.5s infinite linear;
  }
`;

const BottomDeco = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: rgba(147, 244, 255, 0.6);
  margin-top: 5px;

  span.blink {
    animation: blink 0.5s infinite alternate;
  }
  
  @keyframes blink { from { opacity: 1; } to { opacity: 0.3; } }
`;


// =================================================================
// 🧩 Component
// =================================================================

interface CyberpunkLoaderProps {
  duration?: number; // 초 단위 (기본 2.5)
  onFinished?: () => void; // 로딩 완료 후 실행할 콜백
}

const CyberpunkLoader: React.FC<CyberpunkLoaderProps> = ({ duration = 2.5, onFinished }) => {
  const [isFinished, setIsFinished] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinished(true);
      if (onFinished) onFinished();

      // 페이드 아웃 애니메이션 시간(0.5s) 후에 컴포넌트를 완전히 숨김
      setTimeout(() => {
        setIsVisible(false);
      }, 500);

    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration, onFinished]);

  if (!isVisible) return null;

  return (
    <LoaderWrapper $finished={isFinished}>
      <ContentContainer>
        <TopDeco>
          <span className="status-text">SYSTEM BOOT SEQUENCE</span>
          <span>VER. PINN</span>
        </TopDeco>
        
        <ProgressTrack>
          <ProgressBar $duration={duration} />
        </ProgressTrack>

        <BottomDeco>
          <span>LOADING ASSETS...</span>
          <span><span className="blink">_</span>WAITING PLEASE...</span>
        </BottomDeco>
      </ContentContainer>
    </LoaderWrapper>
  );
};

export default CyberpunkLoader;