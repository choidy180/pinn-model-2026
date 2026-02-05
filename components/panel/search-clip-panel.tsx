"use client";

import styled, { keyframes } from "styled-components";
import { FiSearch } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation"; 

/* =======================================
 * 데이터 타입
 * ======================================= */

type CameraInfo = {
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

type SelectedState = {
  process: ProcessRow;
  camera: CameraInfo;
} | null;

/* =======================================
 * 비디오 데이터 설정 (ID별 분기)
 * ======================================= */

const API_BASE = "http://1.254.24.170:24828/api/DX_API000031?videoName=";
const DEFAULT_DATE = "250926";
const DEFAULT_TIME_START = "16:19:22";
const DEFAULT_TIME_END = "16:23:22";

// 헬퍼: 파일명 배열을 받아 CameraInfo 배열로 변환
const createCameras = (filenames: string[]): CameraInfo[] => {
  return filenames.map(name => ({
    videoUrl: `${API_BASE}${name}`,
    date: DEFAULT_DATE,
    startTime: DEFAULT_TIME_START,
    endTime: DEFAULT_TIME_END
  }));
};

// ID 1: MJT63702706KSD5NE0286 데이터 셋
const DATA_SET_MJT: ProcessRow[] = [
  {
    id: "p1",
    label: "자재창고",
    cameras: createCameras([
      "warehouse0101.mp4", "warehouse0102.mp4", "warehouse0103.mp4", 
      "warehouse0118.mp4", "warehouse0201.mp4", "warehouse0202.mp4"
    ]),
  },
  {
    id: "p2",
    label: "사출설비",
    cameras: createCameras([
      "equip0111.mp4", "equip0113.mp4", "equip0114.mp4", 
      "equip0120.mp4", "equip0211.mp4", "equip0213.mp4"
    ]),
  },
  {
    id: "p3",
    label: "건조공정",
    cameras: createCameras([
      "dry0101.mp4", "dry0102.mp4", "dry_in01.mp4", 
      "dry_out01.mp4", "dry0201.mp4", "dry0202.mp4"
    ]),
  },
  {
    id: "p4",
    label: "패킹, 조립",
    cameras: createCameras([
      "assembly0101.mp4", "assembly0102.mp4", "assembly0201.mp4", 
      "assembly0202.mp4", "assembly0301.mp4", "assembly0302.mp4"
    ]),
  },
];

// ID 2: AXR82930411LPT9QR1122 데이터 셋
const DATA_SET_AXR: ProcessRow[] = [
  {
    id: "p1",
    label: "자재창고",
    cameras: createCameras([
      "warehouse0203.mp4", "warehouse0218.mp4", "warehouse0301.mp4", 
      "warehouse0302.mp4", "warehouse0303.mp4", "warehouse0318.mp4"
    ]),
  },
  {
    id: "p2",
    label: "사출설비",
    cameras: createCameras([
      "equip0214.mp4", "equip0220.mp4", "equip0311.mp4", 
      "equip0313.mp4", "equip0314.mp4", "equip0320.mp4"
    ]),
  },
  {
    id: "p3",
    label: "건조공정",
    cameras: createCameras([
      "dry_in02.mp4", "dry_out02.mp4", "dry0301.mp4", 
      "dry0302.mp4", "dry_in03.mp4", "dry_out03.mp4"
    ]),
  },
  {
    id: "p4",
    label: "패킹, 조립",
    cameras: createCameras([
      "pack0101.mp4", "pack0102.mp4", "pack0201.mp4", 
      "pack0202.mp4", "pack0301.mp4", "pack0402.mp4"
    ]),
  },
];


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

  // [수정] URL 파라미터 sn 값 가져오기
  const searchParams = useSearchParams();
  const currentSn = searchParams.get("sn") || "MJT63702706KSD5NE0286"; // 값이 없으면 기본값으로 첫번째 ID 사용

  // [핵심] sn 값에 따라 보여줄 데이터 셋 결정 (useMemo로 최적화)
  const currentProcessRows = useMemo(() => {
    if (currentSn === "AXR82930411LPT9QR1122") {
      return DATA_SET_AXR;
    }
    // 기본값 혹은 MJT... 일 경우
    return DATA_SET_MJT;
  }, [currentSn]);

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
          placeholder=""
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBar>

      <RowsWrapper>
        {currentProcessRows.map((row) => (
          <ProcessCard key={row.id}>
            <ProcessLabel>{row.label}</ProcessLabel>

            <CamerasWrapper>
              {row.cameras.map((cam, idx) => (
                <CameraThumb
                  key={`${row.id}-${idx}`}
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
                  controlsList="nofullscreen"
                  autoPlay 
                  muted 
                  playsInline
                />
                
                {/* 오버레이 UI */}
                <StatusOverlay>
                  <RecDot />
                  {/* 현재 페이지 파라미터(sn) 값을 ID로 표시 */}
                  <span>ID [ {currentSn} ] Physical AI Vision Analysis : Active</span>
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
 * 스타일 (변경 없음)
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
  
  bottom: 55px; 
  left: 50%; transform: translateX(-50%);
  
  display: flex; align-items: center; justify-content: center; gap: 12px;
  
  min-width: 700px; 
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