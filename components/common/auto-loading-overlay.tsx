"use client";

import React, { useLayoutEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import IconLogo from "@/public/icon/logo-icon.svg"
import Image from "next/image";

const AutoLoadingOverlay: React.FC = () => {
  // useLayoutEffect를 사용하여 DOM 변경사항을 동기적으로 적용
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    // DOM이 업데이트된 직후에 타이머 설정 -> 1초 후 숨김
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1000); // 1초

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Dimmer>
      <LogoFloatWrapper>
        {/* 로고 아이콘 */}
        <LogoCircle>
          <Image width={32} height={32} src={IconLogo} alt="loading logo" />
        </LogoCircle>
        {/* ✅ 텍스트 추가 */}
        <LoadingText>LOADING...</LoadingText>
      </LogoFloatWrapper>
    </Dimmer>
  );
};

export default AutoLoadingOverlay;

/* =========================
 * styles
 * =======================*/

const float = keyframes`
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const Dimmer = styled.div`
  /* z-index를 최대로 높여 모든 콘텐츠 위에 오도록 합니다. */
  position: fixed;
  inset: 0;
  z-index: 99999; /* ✅ z-index를 9999에서 99999로 더 높여 우선순위 확보 */

  display: flex;
  justify-content: center;
  align-items: center;

  /* #1c3151 + 반투명 */
  background: rgba(28, 49, 81, 0.8);
  backdrop-filter: blur(2px);
  /* ✅ 웹킷 기반 브라우저에서 깜빡임 방지 */
  will-change: opacity;
`;

const LogoFloatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  animation: ${float} 1.6s ease-in-out infinite;
`;

const LogoCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #0b1728;
  display: flex;
  justify-content: center;
  align-items: center;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    margin-left: 2px;
  }
`;


const LoadingText = styled.span`
  font-size: 16px;
  color: #d4deff;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;