// src/types/three-examples.d.ts

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  export * from 'three/examples/jsm/loaders/GLTFLoader';
  export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
}

declare module 'three/examples/jsm/loaders/DRACOLoader.js' {
  export * from 'three/examples/jsm/loaders/DRACOLoader';
  export { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
}

// 필요하다면 다른 로더들도 여기에 추가할 수 있습니다.
// declare module 'three/examples/jsm/controls/OrbitControls.js' { ... }