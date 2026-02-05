"use client";

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// 전역 객체 타입 우회
declare global {
  interface Window {
    JSMpeg: any;
  }
}

// 스타일
const PlayerBox = styled.div`
  width: 100%;
  height: 100%;
  background: #020617;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  border: 1px solid #1e293b;

  canvas {
    width: 100%;
    height: 100%;
    object-fit: fill;
    display: block;
  }
`;

const Label = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.99);
  color: #fff;
  font-size: 18px;
  padding: 5px 14px;
  border-radius: 10px;
  font-weight: 600;
  z-index: 10;
`;

const StatusMsg = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #94a3b8;
  font-size: 12px;
`;

interface Props {
  url: string;   // 웹소켓 주소 (예: ws://1.254.24.170:8122)
  label: string;
}

export default function CctvPlayer({ url, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("라이브러리 로딩 중...");

  useEffect(() => {
    // 1. 제공해주신 HTML에 있는 CDN 주소 그대로 사용
    const scriptUrl = "https://cdn.jsdelivr.net/gh/phoboslab/jsmpeg@master/jsmpeg.min.js";
    
    // 스크립트 중복 로드 방지
    let script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    let player: any = null;

    const initPlayer = () => {
      if (!canvasRef.current || !window.JSMpeg) {
        setStatus("라이브러리 로드 실패");
        return;
      }

      setStatus(""); // 연결 성공 시 메시지 제거

      // 2. 제공해주신 코드의 JSMpeg 생성 옵션 그대로 적용
      try {
        player = new window.JSMpeg.Player(url, {
          canvas: canvasRef.current,
          autoplay: true,
          audio: false,
          // 디버깅용 콜백 (콘솔 확인용)
          onVideoDecode: function(decoder: any, time: any) {
            console.log(`[${label}] Video Decoding Started:`, time);
          }
        });
      } catch (e) {
        console.error("Player Init Error:", e);
        setStatus("연결 오류");
      }
    };

    // 스크립트가 로드되었는지 확인 후 실행
    if (window.JSMpeg) {
      initPlayer();
    } else {
      script.addEventListener("load", initPlayer);
    }

    // cleanup
    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {}
      }
      script.removeEventListener("load", initPlayer);
    };
  }, [url, label]);

  return (
    <PlayerBox>
      {/* <Label>{label}</Label> */}
      {status && <StatusMsg>{status}</StatusMsg>}
      <canvas ref={canvasRef} />
    </PlayerBox>
  );
}