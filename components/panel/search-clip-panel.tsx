"use client";

import styled, { keyframes } from "styled-components";
import { FiSearch } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { useState, useRef, useEffect } from "react";

/* =======================================
 * 데이터 타입 & 샘플 데이터
 * ======================================= */

type CameraInfo = {
  id: string;
  videoUrl: string;
  date: string;
  startTime: string;
  endTime: string;
};

type ProcessRow = {
  id: string;
  label: string;
  cameras: CameraInfo[];
};

const PROCESS_ROWS: ProcessRow[] = [
  {
    id: "p1",
    label: "자재창고",
    cameras: [
      { id: "QSN00120", videoUrl: "/videos/selected/warehouse/warehouse_1.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00121", videoUrl: "/videos/selected/warehouse/warehouse_2.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
    ],
  },
  {
    id: "p2",
    label: "사출설비",
    cameras: [
      { id: "QSN00123", videoUrl: "/videos/selected/facilities/facilities_1.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00124", videoUrl: "/videos/selected/facilities/facilities_2.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00125", videoUrl: "/videos/selected/facilities/facilities_3.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00126", videoUrl: "/videos/selected/facilities/facilities_4.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
    ],
  },
  {
    id: "p3",
    label: "건조공정",
    cameras: [
      { id: "QSN00127", videoUrl: "/videos/selected/process/process_1.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00128", videoUrl: "/videos/selected/process/process_2.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00129", videoUrl: "/videos/selected/process/process_3.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
    ],
  },
  {
    id: "p4",
    label: "패킹, 조립",
    cameras: [
      { id: "QSN00130", videoUrl: "/videos/selected/pakking/pakking_1.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00131", videoUrl: "/videos/selected/pakking/pakking_2.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00132", videoUrl: "/videos/selected/pakking/pakking_3.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
      { id: "QSN00133", videoUrl: "/videos/selected/pakking/pakking_4.mp4", date: "250926", startTime: "16:19:22", endTime: "16:23:22" },
    ],
  },
];

type SelectedState = {
  process: ProcessRow;
  camera: CameraInfo;
} | null;

/* =======================================
 * [초고성능/안전장치 포함] 비디오 썸네일 컴포넌트
 * ======================================= */
const VideoThumbnail = ({ src }: { src: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [useFallbackVideo, setUseFallbackVideo] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLoadedData = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1.0;
    }
  };

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth / 2;
          canvas.height = video.videoHeight / 2;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL("image/jpeg", 0.6);
            if (imageUrl.length > 100) { 
               setThumbnailImage(imageUrl);
            } else {
               throw new Error("Empty image");
            }
          }
        } catch (e) {
          console.warn("썸네일 생성 실패 (Fallback 전환):", src, e);
          setUseFallbackVideo(true);
        }
      });
    });
  };

  const handleError = () => {
    setUseFallbackVideo(true);
  };

  return (
    <ThumbnailContainer ref={containerRef}>
      {thumbnailImage ? (
        <StyledImage src={thumbnailImage} alt="thumbnail" />
      ) : (
        <>
          {!useFallbackVideo && (
             <SkeletonOverlay>
                <SkeletonUI />
             </SkeletonOverlay>
          )}

          {isIntersecting && (
            <HiddenOrVisibleVideo
              ref={videoRef}
              src={src}
              preload="metadata"
              muted
              playsInline
              onLoadedData={handleLoadedData}
              onSeeked={handleSeeked}
              onError={handleError}
              crossOrigin="anonymous"
              $isVisible={useFallbackVideo}
            />
          )}
        </>
      )}
    </ThumbnailContainer>
  );
};

/* =======================================
 * 메인 컴포넌트
 * ======================================= */
export default function SearchPanelCctv() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedState>(null);

  const handleThumbClick = (process: ProcessRow, camera: CameraInfo) => {
    setSelected({ process, camera });
  };

  const handleClose = () => setSelected(null);

  return (
    <PageWrapper>
      <SearchBar>
        <SearchIconWrapper>
          <FiSearch />
        </SearchIconWrapper>
        <SearchInput
          placeholder="QSN00124"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      <RowsWrapper>
        {PROCESS_ROWS.map((row) => (
          <ProcessCard key={row.id}>
            <ProcessLabel>{row.label}</ProcessLabel>

            <CamerasWrapper>
              {row.cameras.map((cam) => (
                <CameraThumb
                  key={cam.id}
                  onClick={() => handleThumbClick(row, cam)}
                >
                  <VideoThumbnail src={cam.videoUrl} />
                </CameraThumb>
              ))}
            </CamerasWrapper>
          </ProcessCard>
        ))}
      </RowsWrapper>

      {/* 모달 */}
      {selected && (
        <ModalOverlay onClick={handleClose}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <span className="process">{selected.process.label}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </ModalTitle>
              <CloseButton onClick={handleClose}>
                <IoMdClose />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {/* 비디오 래퍼 */}
              <VideoWrapper>
                <StyledModalVideo 
                  src={selected.camera.videoUrl} 
                  controls 
                  controlsList="nofullscreen" /* [핵심] 전체화면 버튼 비활성화 속성 */
                  autoPlay 
                  muted 
                  playsInline
                />
                
                {/* 오버레이 UI */}
                <StatusOverlay>
                  <RecDot />
                  <span>ID [ {selected.camera.id} ] Physical AI Vision Analysis : Active</span>
                </StatusOverlay>
              </VideoWrapper>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}


/* =======================================
 * 스타일
 * ======================================= */

const PageWrapper = styled.div`
  width: 100%; height: 100%; box-sizing: border-box; background-color: #0b1e39; padding: 20px;
  display: flex; flex-direction: column; gap: 18px;
`;
const SearchBar = styled.div`
  width: 100%; max-width: 470px; height: 46px; background-color: #041025; border-radius: 4px;
  display: flex; align-items: center; padding: 0 16px; color: #c2cedf;
`;
const SearchIconWrapper = styled.div` display: flex; align-items: center; margin-right: 10px; font-size: 18px; `;
const SearchInput = styled.input`
  border: none; outline: none; background: transparent; width: 100%; height: 100%; color: #ffffff; font-size: 17px;
  &::placeholder { color: #6d7c93; }
`;
const RowsWrapper = styled.div` display: flex; flex-direction: column; gap: 18px; `;
const ProcessCard = styled.div`
  width: 100%; background-color: #1f3559; border-radius: 6px; padding: 16px 24px;
  display: flex; justify-content: start; align-items: center; gap: 30px;
`;
const ProcessLabel = styled.div` font-size: 22px; color: #ffffff; white-space: nowrap; font-weight: 600; width: 200px; `;
const CamerasWrapper = styled.div` flex: 1; display: flex; gap: 16px; `;

const CameraThumb = styled.div`
  width: 260px; height: 150px; border-radius: 4px; overflow: hidden; background-color: #000;
  position: relative; cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover { transform: scale(1.02); z-index: 5; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
`;

/* ========== 썸네일 스타일 ========== */

const ThumbnailContainer = styled.div`
  width: 100%; height: 100%; position: relative;
`;
const skeletonPulse = keyframes`
  0% { background-color: #1b2940; }
  50% { background-color: #2a3b55; }
  100% { background-color: #1b2940; }
`;
const SkeletonOverlay = styled.div`
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
`;
const SkeletonUI = styled.div`
  width: 100%; height: 100%; background-color: #1b2940;
  animation: ${skeletonPulse} 1.7s infinite ease-in-out;
`;
const imageFadeIn = keyframes`
  from { opacity: 0; } to { opacity: 1; }
`;
const StyledImage = styled.img`
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; inset: 0; z-index: 2;
  animation: ${imageFadeIn} 0.5s ease-in-out;
  background-color: #000;
`;
const HiddenOrVisibleVideo = styled.video<{ $isVisible: boolean }>`
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; inset: 0;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)}; 
  pointer-events: none;
  transition: opacity 0.3s ease;
`;

/* ========== 모달 스타일 ========== */

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(3, 10, 24, 0.7);
  display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(2px);
`;
const ModalContainer = styled.div`
  width: 70%; max-width: 1100px; max-height: 80vh; background-color: #1c3557;
  border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
`;
const ModalHeader = styled.div`
  padding: 14px 24px; background-color: #10203A; display: flex; align-items: center; justify-content: space-between;
`;
const ModalTitle = styled.div`
  display: flex; align-items: center; color: #ffffff; font-size: 15px;
  .process { font-weight: 600; color: #8898B1; } .time { opacity: 0.9; }
`;
const CloseButton = styled.button`
  border: none; background: transparent; color: #ffffff; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  &:hover { color: #fca5a5; }
`;
const ModalBody = styled.div`
  padding: 24px; background-color: #263E62; display: flex; justify-content: center; align-items: center; height: auto; aspect-ratio: 16/9; 
  overflow: hidden;
`;
const VideoWrapper = styled.div`
  position: relative; width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
`;

const StyledModalVideo = styled.video`
  width: 100%; height: 100%; object-fit: contain; display: block; outline: none;
  
  /* [핵심] Webkit 브라우저(크롬 등)에서 전체화면 버튼 강제 숨김 */
  &::-webkit-media-controls-fullscreen-button {
    display: none !important;
  }
`;

/* ========== 오버레이 UI 스타일 ========== */

const blinkAnimation = keyframes`
  0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; }
`;

const RecDot = styled.div`
  width: 10px; height: 10px; border-radius: 50%; background-color: #ff3b30;
  animation: ${blinkAnimation} 1.5s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 59, 48, 0.6);
  flex-shrink: 0;
`;

const StatusOverlay = styled.div`
  position: absolute;
  
  /* 위치 및 크기는 이전 요청사항 유지 */
  bottom: 55px; 
  left: 50%; transform: translateX(-50%);
  
  display: flex; align-items: center; justify-content: center; gap: 12px;
  
  min-width: 500px; 
  padding: 16px 30px;
  
  border-radius: 6px;
  background-color: #000000;
  border: 1px solid #333;
  color: #e2e8f0;
  
  font-size: 15px; font-weight: 500; letter-spacing: 0.5px;
  
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.7);
`;