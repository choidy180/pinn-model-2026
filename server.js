// server.js (프로젝트 루트에 생성)
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket Video Server running on port 8080');

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

/**
 * [시뮬레이션]
 * 실제로는 FFmpeg나 RTSP 스트림에서 프레임 데이터를 받아와야 합니다.
 * 여기서는 테스트를 위해, 외부 스크립트가 이 서버로 바이너리 데이터를 보내면
 * 연결된 모든 프론트엔드 클라이언트에게 뿌려주는 역할을 수행한다고 가정합니다.
 * * (영상 소스 -> 웹소켓 서버 -> Next.js 클라이언트)
 */
wss.on('headers', (headers, req) => {
  // 영상 소스(예: 파이썬, FFmpeg)가 접속하여 데이터를 보낼 때 처리
  // 실제 구현시에는 인증 로직 등을 추가해야 함
});

// 브로드캐스트 함수: 연결된 모든 클라이언트에게 데이터 전송
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === 1) { // OPEN 상태
      client.send(data);
    }
  });
};

// (테스트용) 외부에서 이 소켓 서버로 데이터를 쏘는 것을 가정하는 대신,
// 여기서는 단순히 연결된 소켓끼리 데이터를 릴레이하거나 
// 혹은 별도의 스트림 입력을 받는 로직을 구현해야 합니다.
// 간단한 예제를 위해, "어떤 클라이언트(카메라)가 데이터를 보내면 다른 클라이언트(뷰어)에게 전달"하는 로직 추가:
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // 들어온 메시지(영상 프레임 바이너리)를 다른 모든 클라이언트에게 전송
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });
});