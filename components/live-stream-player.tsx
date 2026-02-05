// app/components/LiveStreamPlayer.tsx (또는 적절한 위치)
"use client";

import React, { useEffect, useRef, useState } from "react";

export default function LiveStreamPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 웹소켓 서버 연결
    const ws = new WebSocket("ws://localhost:8080");
    ws.binaryType = "arraybuffer"; // 바이너리 데이터로 받기 설정

    ws.onopen = () => {
      console.log("Connected to Video Stream Server");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      // 1. 수신된 데이터를 Blob으로 변환 (이미지 포맷에 따라 type 설정, 예: image/jpeg)
      const blob = new Blob([event.data], { type: "image/jpeg" });
      
      // 2. Blob URL 생성
      const url = URL.createObjectURL(blob);

      // 3. 이미지를 로드하여 Canvas에 그리기
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // 캔버스 크기를 이미지 크기에 맞추거나, 고정 크기로 그림
            // canvas.width = img.width;
            // canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
        // 메모리 누수 방지를 위해 URL 해제
        URL.revokeObjectURL(url);
      };
    };

    ws.onclose = () => {
      console.log("Disconnected");
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-900 text-white">
      <h2 className="text-xl font-bold">
        실시간 CCTV {isConnected ? "🟢 (Live)" : "🔴 (Disconnected)"}
      </h2>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="bg-black rounded border border-gray-700 shadow-lg"
      />
    </div>
  );
}