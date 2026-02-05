// lib/registry.tsx
// 이 파일 상단에 'use client'를 반드시 포함해야 합니다.
'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

/**
 * Next.js App Router 환경에서 Styled Components의 스타일을 SSR 중에 수집하고 주입하는 컴포넌트
 */
export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // 클라이언트 측에서만 실행되도록 스타일 시트 인스턴스를 한 번만 생성
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  // 서버 컴포넌트가 렌더링될 때 스타일 태그를 <head>에 주입
  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // 클라이언트 측에서 개발 모드 스타일 누락을 방지하고 스타일을 적용
  if (typeof window !== 'undefined') {
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}