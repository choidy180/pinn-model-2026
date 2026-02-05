// three/examples/jsm/loaders/FBXLoader 에 대한 모듈 선언
declare module 'three/examples/jsm/loaders/FBXLoader' {
  import { Loader, LoadingManager, Group } from 'three';
  
  // FBXLoader 클래스 정의
  export class FBXLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (group: Group) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: Error | ErrorEvent) => void
    ): void;
    
    parse(data: ArrayBuffer, path: string): Group;
  }
}