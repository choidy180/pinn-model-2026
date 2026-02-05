'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// ✅ 여기에 허용할 IP를 적어주세요 (API가 죽었을 때 클라이언트에서 비교하기 위함)
const ALLOWED_VPN_IP = '59.19.120.125';

interface VpnCheckResponse {
  allowed: boolean;
  clientIp: string;
}

export default function VpnGuard({ children }: { children: React.ReactNode }) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [currentIp, setCurrentIp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const checkVpn = async () => {
    try {
      setIsLoading(true);
      
      // 1차 시도: 우리 서버 API 호출
      const res = await fetch('/api/vpn-check');
      
      if (res.ok) {
        const data: VpnCheckResponse = await res.json();
        setIsAllowed(data.allowed);
        setCurrentIp(data.clientIp);
      } else {
        throw new Error('Internal API Error'); 
      }

    } catch (error) {
      // 2차 시도: API 실패 시 외부 서비스(ipify)로 확인 (Fallback)
      console.warn('Internal API Failed, trying external service...');
      
      try {
        const externalRes = await fetch('https://api.ipify.org?format=json');
        const data = await externalRes.json();
        const detectedIp = data.ip;
        
        setCurrentIp(detectedIp);
        
        // ✨ [수정됨] 비상 모드에서도 IP가 일치하면 통과시킴!
        if (detectedIp === ALLOWED_VPN_IP) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }

      } catch (e) {
        setCurrentIp('확인 불가');
        setIsAllowed(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkVpn();
  }, []);

  // 1. 로딩 중
  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>🔒 보안 네트워크 확인 중...</LoadingMessage>
      </Container>
    );
  }

  // 2. VPN 미연결 (차단 화면)
  if (!isAllowed) {
    return (
      <Container>
        <Card>
          <IconWrapper>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </IconWrapper>
          <Title>접속 제한됨</Title>
          <Description>
            보안을 위해 <strong>사내망 VPN</strong> 연결이 필요합니다.<br />
            외부 네트워크에서의 접근은 허용되지 않습니다.
          </Description>
          
          <InfoBox>
            <InfoRow>
              <span>현재 감지된 IP</span>
              {/* 일치하면 초록색, 틀리면 빨간색으로 표시 */}
              <span className="ip" style={{ color: currentIp === ALLOWED_VPN_IP ? '#30d158' : '#ff453a' }}>
                {currentIp}
              </span>
            </InfoRow>
            <InfoRow>
              <span>허용된 VPN IP</span>
              <span className="required">{ALLOWED_VPN_IP}</span>
            </InfoRow>
          </InfoBox>

          <RetryButton onClick={checkVpn}>
            다시 시도 (Refresh)
          </RetryButton>
        </Card>
      </Container>
    );
  }

  return <>{children}</>;
}

// --- Styles (기존과 동일) ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #050505;
  color: white;
  z-index: 9999;
  position: relative;
`;

const Card = styled.div`
  background: #111111;
  border: 1px solid #333;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 420px;
  width: 90%;
  animation: ${fadeIn} 0.5s ease-out;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background-color: rgba(255, 59, 48, 0.15);
  color: #ff453a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #a1a1aa;
  line-height: 1.6;
  margin-bottom: 32px;
  
  strong {
    color: #ffffff;
    font-weight: 600;
  }
`;

const InfoBox = styled.div`
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 32px;
  font-size: 14px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }

  span {
    color: #888;
  }
  
  span.ip {
    color: #e5e5e5;
    font-weight: 600;
    font-family: 'Consolas', monospace;
  }
  
  span.required {
    color: #0a84ff;
    font-weight: 600;
    font-family: 'Consolas', monospace;
  }
`;

const RetryButton = styled.button`
  background-color: #0a84ff;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background-color: #0077ed;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(10, 132, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingMessage = styled.div`
  font-size: 16px;
  color: #888;
  font-weight: 500;
  font-family: monospace;
`;