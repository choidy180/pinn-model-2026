// src/components/SkeletonImage.tsx

"use client";
import React, { useState } from "react";
// ImageProps는 next/image에서 가져오고, CSS Properties를 위해 React.CSSProperties를 import 합니다.
import Image, { ImageProps } from "next/image";
import styled, { keyframes } from "styled-components";

// 1. 스켈레톤 애니메이션 정의
const shimmer = keyframes`
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
`;

// 2. 스켈레톤 스타일 컴포넌트
const SkeletonWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #313d52; /* 스켈레톤 배경색 */
  overflow: hidden;
  z-index: 10;
  border-radius: inherit; 

  /* 그라데이션 쉬머 효과 */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      #313d52 0%,
      #465775 20%,
      #313d52 40%
    );
    animation: ${shimmer} 1.5s infinite linear;
    background-size: 800px 100%;
  }
`;

// 3. Next.js Image를 감싸는 컨테이너
const ImageContainer = styled.div<{ $isLoaded: boolean }>`
    width: 100%;
    height: 100%;
    position: relative;
    /* ✅ 개선: 이미지가 로드되면 opacity를 1로 부드럽게 전환 
      이미지 로드 전에는 visibility: hidden을 사용하여 완전히 숨기고,
      스켈레톤이 겹쳐 보이도록 합니다.
    */
    & > img {
        opacity: ${(props) => (props.$isLoaded ? 1 : 0)};
        transition: opacity 0.5s ease-in-out;
        /* 로딩 전에는 스켈레톤만 보이도록 visibility를 조정 */
        visibility: ${(props) => (props.$isLoaded ? 'visible' : 'hidden')};
    }
`;

// 4. 컴포넌트 정의 (Next.js ImageProps를 확장)
// style prop의 타입을 명시적으로 추가하여 타입 안전성을 높입니다.
interface SkeletonImageProps extends ImageProps {
    style?: React.CSSProperties; 
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({ style, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <ImageContainer $isLoaded={isLoaded}>
      {/* ✅ 개선: 스켈레톤도 로딩 상태에 따라 사라지도록 transition을 추가할 수 있지만, 
        여기서는 Image의 opacity가 1이 될 때까지 유지하는 전략을 사용합니다.
      */}
      {!isLoaded && <SkeletonWrapper />}

      {/* 기본 Image 컴포넌트 렌더링 */}
      <Image
        {...props}
        // Image 컴포넌트의 style prop을 그대로 사용합니다.
        style={{ ...style }} 
        onLoadingComplete={() => {
          setIsLoaded(true);
        }}
      />
    </ImageContainer>
  );
};

export default SkeletonImage;