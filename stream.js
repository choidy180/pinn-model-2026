// stream.js
const Stream = require('node-rtsp-stream');
const ffmpegPath = require('ffmpeg-static'); // ffmpeg 자동 설치 경로

// 표에 있는 카메라 정보 (IP주소 및 포트 매핑)
const cameras = [
  {
    name: 'Camera 1 (166)',
    url: 'rtsp://192.168.220.166:554/profile/media.smp',
    port: 8081
  },
  {
    name: 'Camera 2 (104)',
    url: 'rtsp://192.168.220.104:554/profile/media.smp',
    port: 8082
  },
  {
    name: 'Camera 3 (126)',
    url: 'rtsp://192.168.220.126:554/profile/media.smp',
    port: 8083
  },
  {
    name: 'Camera 4 (105)',
    url: 'rtsp://192.168.220.105:554/profile/media.smp',
    port: 8084
  }
];

// 4개의 카메라 스트림 동시 실행
cameras.forEach((cam) => {
  new Stream({
    name: cam.name,
    streamUrl: cam.url,
    wsPort: cam.port,
    ffmpegOptions: {
      '-stats': '',        // 로그 줄임
      '-r': 20,            // 프레임 레이트 (성능 최적화를 위해 20fps로 조정)
      '-q:v': 10,          // 화질 (숫자가 클수록 화질 낮음/성능 높음, 4개 동시 송출이라 조정 필요)
      '-bf': 0,            // 지연 시간 최소화
      '-rtsp_transport': 'tcp', // 영상 깨짐 방지
      '-s': '640x480'      // 해상도 고정 (부하 감소)
    },
    ffmpegPath: ffmpegPath // 시스템 설치 없이 실행
  });
  
  console.log(`📡 [${cam.name}] Streaming on ws://localhost:${cam.port}`);
});