"use client";

import styled, { css, keyframes } from "styled-components";
import { FiSearch } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import { MdMicOff, MdClose, MdErrorOutline, MdOndemandVideo, MdHistory } from "react-icons/md";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useState, useEffect } from "react";
import { MOCK_PROCESSES, ProcessId } from "@/data/temp-data";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation"; // ✅ 라우터 추가

// ✅ 1. 더미 데이터 (랜덤 SN 20개)
const VALID_SNS = [
  "MJT63702706KSD5NE0286",
  "MJT63702707KSD5NE0287",
  "MJT63702708KSD5NE0288",
  "MJT63702709KSD5NE0289",
  "MJT63702710KSD5NE0290",
  "MJT63702711KSD5NE0291",
  "MJT63702712KSD5NE0292",
  "MJT63702713KSD5NE0293",
  "MJT63702714KSD5NE0294",
  "MJT63702715KSD5NE0295",
  "KSD5NE0286MJT63702706",
  "KSD5NE0287MJT63702707",
  "KSD5NE0288MJT63702708",
  "KSD5NE0289MJT63702709",
  "KSD5NE0290MJT63702710",
  "AXR82930411LPT9QR1122",
  "AXR82930412LPT9QR1123",
  "BZC93841522MQU0RS2233",
  "BZC93841523MQU0RS2234",
  "CYD04952633NRV1ST3344"
];

// ✅ 2. 최근 검색 기록 더미 데이터
const MOCK_RECENT_SEARCHES = [
  "MJT63702706KSD5NE0286",
  "AXR82930411LPT9QR1122",
  "BZC93841522MQU0RS2233"
];

export default function SearchPanelFinal() {
  const router = useRouter(); // ✅ 라우터 훅 사용
  
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isFocused, setIsFocused] = useState(false);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<ProcessId | null>(MOCK_PROCESSES[0]?.id || null);

  const selectedProcess = selectedId
    ? MOCK_PROCESSES.find((p) => p.id === selectedId) ?? null
    : null;

  useEffect(() => {
    setIsVideoLoaded(false);
  }, [selectedId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    setErrorMsg(null); 

    if (VALID_SNS.includes(val)) {
      setIsSearching(true);
      setSuggestions([]); 
      return; 
    }

    if (val.trim().length > 0) {
      const filtered = VALID_SNS.filter(sn => sn.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim().length === 0) return;

    if (!VALID_SNS.includes(keyword)) {
      setErrorMsg("SN이 유효하지 않습니다. 다시 확인해주세요.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsSearching(true);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleReset = () => {
    setIsSearching(false);
    setKeyword("");
    setSuggestions([]);
    setErrorMsg(null);
  };

  const selectSuggestion = (sn: string) => {
    setKeyword(sn);
    setSuggestions([]);
    setIsFocused(false);
    
    if(VALID_SNS.includes(sn)) {
        setIsSearching(true);
    } else {
        setIsSearching(true);
    }
  };

  // ✅ 최근 검색 기록 클릭 핸들러 (페이지 이동)
  const handleHistoryClick = (sn: string) => {
    // 1. (선택사항) 검색어 창에 값을 채워주고 싶다면: setKeyword(sn);
    // 2. 페이지 이동
    router.push("/search?selected=clip");
  };

  return (
    <PageWrapper>
      <AnimatePresence>
        {errorMsg && (
          <ErrorToast
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
          >
            <MdErrorOutline size={20} />
            {errorMsg}
          </ErrorToast>
        )}
      </AnimatePresence>

      {/* ✅ 1. 좌상단 검색창 (검색 후) */}
      <TopLeftContainer>
        <SearchBoxContainer
          initial={{ opacity: 0 }} 
          animate={{ 
            opacity: isSearching ? 1 : 0,           
            pointerEvents: isSearching ? "auto" : "none" 
          }}
          transition={{ duration: 0.2 }}
        >
          <SearchBox $styleType="corner">
            <IconWrapper>
              <FiSearch size={22} color="#fff" />
            </IconWrapper>
            <SearchForm onSubmit={handleSearch}>
              <input
                placeholder="SN을 입력하여 공정을 검색하세요"
                value={keyword}
                onChange={handleChange}
              />
            </SearchForm>
            <ClearButton type="button" onClick={handleReset}>
              <MdClose size={20} />
            </ClearButton>
          </SearchBox>

          <AnimatePresence>
            {isSearching && suggestions.length > 0 && (
              <SuggestionList
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {suggestions.map((sn) => (
                  <li key={sn} onClick={() => selectSuggestion(sn)}>
                    <HighLightText>{sn}</HighLightText>
                  </li>
                ))}
              </SuggestionList>
            )}
          </AnimatePresence>
        </SearchBoxContainer>
      </TopLeftContainer>

      {/* ✅ 2. 중앙 검색창 (초기 화면) */}
      <AnimatePresence>
        {!isSearching && (
          <CenterOverlay
            key="center-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SearchBoxContainer
              initial="center"
              animate="center"
              exit="center"
              variants={containerVariants}
            >
              <SearchHeader>
                <Title>SN 검색</Title>
                <Subtitle>시리얼 넘버로 자재 및 설비 정보를 조회하세요</Subtitle>
              </SearchHeader>

              <SearchBox $styleType="center">
                <IconWrapper>
                  <FiSearch size={28} color="#b9c4d5" />
                </IconWrapper>
                <SearchForm onSubmit={handleSearch}>
                  <input
                    autoFocus
                    placeholder="시리얼 넘버를 입력하세요"
                    value={keyword}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  />
                </SearchForm>
              </SearchBox>

              <AnimatePresence>
                {/* Case A: 최근 검색 기록 (크고 직관적인 UI) */}
                {isFocused && keyword.trim().length === 0 && (
                   <SuggestionList
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                   >
                     <HistoryHeader>이전 검색 기록</HistoryHeader>
                     
                     {MOCK_RECENT_SEARCHES.map((sn, idx) => (
                       <HistoryItem key={idx} onMouseDown={() => handleHistoryClick(sn)}>
                         {/* 좌측 아이콘 박스 */}
                         <HistoryIconBox>
                            <MdHistory size={22} color="#8898b1" />
                         </HistoryIconBox>
                         
                         {/* 텍스트 정보 */}
                         <HistoryTextGroup>
                            <span className="sn-text">{sn}</span>
                            <span className="sub-text">최근 조회 기록</span>
                         </HistoryTextGroup>

                         {/* 우측 이동 화살표 (직관성 추가) */}
                         <IoChevronForward size={20} color="#5c6b85" style={{ marginLeft: 'auto' }} />
                       </HistoryItem>
                     ))}
                   </SuggestionList>
                )}

                {/* Case B: 자동 완성 */}
                {suggestions.length > 0 && (
                  <SuggestionList
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {suggestions.map((sn) => (
                      <li key={sn} onClick={() => selectSuggestion(sn)}>
                        {sn}
                      </li>
                    ))}
                  </SuggestionList>
                )}
              </AnimatePresence>
            </SearchBoxContainer>
          </CenterOverlay>
        )}
      </AnimatePresence>

      {/* 3. 배경 컨텐츠 */}
      <BackgroundContent $isBlurred={!isSearching}>
        <ContentArea>
          <TopMenuBar>
            {MOCK_PROCESSES.map((proc) => (
              <MenuCard
                key={proc.id}
                onClick={() => setSelectedId(proc.id)}
                data-active={selectedId === proc.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="title">{proc.label}</div>
                <div className="time">{proc.lastTime}</div>
                <button className="arrow">
                  <IoChevronForward />
                </button>
              </MenuCard>
            ))}
          </TopMenuBar>

          <BottomArea>
            <LeftPanel>
              {selectedProcess ? (
                <VideoWrapper
                  key={selectedProcess.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {isSearching && (
                    <>
                      {!isVideoLoaded && (
                        <SkeletonLoader>
                          <MdOndemandVideo size={48} />
                          <span>비디오를 불러오는 중...</span>
                        </SkeletonLoader>
                      )}

                      <StyledVideo
                        src={selectedProcess.video.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onCanPlay={() => setIsVideoLoaded(true)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isVideoLoaded ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      />
                      <VideoTimeBar
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isVideoLoaded ? 1 : 0 }}
                      >
                        {selectedProcess.video.timeRange}
                      </VideoTimeBar>
                    </>
                  )}
                </VideoWrapper>
              ) : (
                <>
                  <EmptyIcon><MdMicOff size={50} /></EmptyIcon>
                  <EmptyText>상단에서 공정을 선택하세요.</EmptyText>
                </>
              )}
            </LeftPanel>

            <RightPanel>
              {selectedProcess ? (
                <DetailTableWrapper
                  key={selectedProcess.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DetailTable>
                    <thead>
                      <tr>
                        <th><p>항목</p></th>
                        <th><p>값</p></th>
                        <th><p>비고</p></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProcess.details.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.item}</td>
                          <td>{row.value}</td>
                          <td>{row.note ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </DetailTable>
                </DetailTableWrapper>
              ) : (
                <RightEmptyState>
                  <EmptyIcon><IoMdCloseCircleOutline size={46} /></EmptyIcon>
                  <RightEmptyText>데이터가 없습니다.</RightEmptyText>
                </RightEmptyState>
              )}
            </RightPanel>
          </BottomArea>
        </ContentArea>
      </BackgroundContent>
    </PageWrapper>
  );
}

/* ================================
 * Animation Config
 * ================================ */

const containerVariants: Variants = {
  center: {
    width: "640px",
    transition: { duration: 0.3, ease: "easeInOut" }
  },
};

/* ================================
 * Styles
 * ================================ */

const PageWrapper = styled.div`
  width: 100%; min-height: 100vh;
  overflow: hidden;
  padding-bottom: 60px;
  box-sizing: border-box;
  color: #8898b1;
  background-color: #0e1f38;
  overflow-y: scroll; overflow-x: hidden; position: relative;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
`;

const SearchHeader = styled.div`
  display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; text-align: center;
`;

const Title = styled.h1`
  font-size: 42px; font-weight: 700; color: #ffffff; margin-bottom: 12px; text-shadow: 0 4px 10px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 18px; color: #dce7f7; font-weight: 400; text-shadow: 0 2px 5px rgba(0,0,0,0.3);
`;

const ErrorToast = styled(motion.div)`
  position: fixed; top: 100px; left: 50%; transform: translateX(-50%); z-index: 2000;
  background-color: #ff4d4f; color: white; padding: 12px 24px; border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 10px;
  font-weight: 600; font-size: 15px; pointer-events: none;
`;

const CenterOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center; z-index: 1000;
`;

const TopLeftContainer = styled(motion.div)`
  position: relative; top: 24px; left: 30px; z-index: 1000; pointer-events: auto;
`;

const SearchBoxContainer = styled(motion.div)`
  position: relative; display: flex; flex-direction: column; pointer-events: auto;
`;

const SearchBox = styled.div<{ $styleType: 'center' | 'corner' }>`
  background: rgba(4, 16, 37, 0.95); backdrop-filter: blur(12px);
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15);
  overflow: hidden; white-space: nowrap;
  ${({ $styleType }) => $styleType === 'center' ? css` width: 640px; height: 80px; border-radius: 24px; padding: 0 32px; ` : css` width: 500px; height: 60px; border-radius: 16px; padding: 0 20px; `}
`;

const SuggestionList = styled(motion.ul)`
  position: absolute; top: 100%; left: 0; width: 100%; margin-top: 8px; padding: 8px 0;
  background: #10243e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); list-style: none; z-index: 100;
  max-height: 400px; overflow-y: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  
  li { 
    padding: 12px 20px; color: #dce7f7; cursor: pointer; font-size: 15px; 
    transition: background 0.2s; 
    display: flex; align-items: center;
    &:hover { background: rgba(255,255,255,0.1); color: #fff; } 
  }
`;

// ✅ 기록 헤더 스타일
const HistoryHeader = styled.li`
  padding: 12px 24px !important;
  font-size: 14px !important;
  color: #8898b1 !important;
  font-weight: 600;
  cursor: default !important;
  pointer-events: none;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 4px;
  &:hover { background: transparent !important; color: #8898b1 !important; }
`;

// ✅ 크고 직관적인 기록 아이템 스타일
const HistoryItem = styled.li`
  padding: 16px 24px !important; /* 클릭 영역 확대 */
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: background 0.2s ease;
  
  &:hover { 
    background: rgba(255,255,255,0.08) !important; 
    .sub-text { color: #aebcd6; }
  }
`;

const HistoryIconBox = styled.div`
  width: 40px; height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
`;

const HistoryTextGroup = styled.div`
  display: flex; flex-direction: column; gap: 4px;
  .sn-text {
    font-size: 16px;
    font-weight: 600;
    color: #e2ecff;
    letter-spacing: 0.5px;
  }
  .sub-text {
    font-size: 13px;
    color: #5c6b85;
    transition: color 0.2s;
  }
`;

const HighLightText = styled.span``;

const IconWrapper = styled.div` display: flex; align-items: center; justify-content: center; `;
const SearchForm = styled.form`
  flex: 1; height: 100%; display: flex; align-items: center;
  input { background: transparent; border: none; outline: none; width: 100%; height: 100%; color: #dce7f7; font-weight: 500; font-size: 20px; &::placeholder { color: #5c6b85; transition: color 0.3s; } &:focus::placeholder { color: #8898b1; } }
`;
const ClearButton = styled.button`
  background: none; border: none; color: #5c6b85; cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 50%; background: rgba(255,255,255,0.05); &:hover { background: rgba(255,255,255,0.15); color: #fff; }
`;

const BackgroundContent = styled.div<{ $isBlurred: boolean }>`
  width: 100%; min-height: 100vh; padding: 30px; box-sizing: border-box; padding-top: 46px; 
  will-change: filter, transform; transition: filter 0.8s ease, transform 0.8s ease;
  
  ${({ $isBlurred }) => $isBlurred ? css` 
    filter: blur(10px); 
    transform: scale(0.98); 
    pointer-events: none; 
    img, video, svg, table, .title, .time, .arrow, th, td { opacity: 0; transition: opacity 0.3s; } 
  ` : css` 
    filter: blur(0px); 
    transform: scale(1); 
    pointer-events: auto; 
    img, video, svg, table, .title, .time, .arrow, th, td { opacity: 1; transition: opacity 0.5s ease 0.3s; } 
  `}
`;

const ContentArea = styled.div` 
  display: flex; flex-direction: column; gap: 20px; width: 100%; 
  height: calc(100vh - 136px); min-height: 600px;
`;
const TopMenuBar = styled.div` width: 100%; display: flex; gap: 16px; height: 110px; flex-shrink: 0; `;
const MenuCard = styled(motion.div)`
  position: relative; flex: 1; background: #223a5e; border-radius: 12px; padding: 20px 24px; display: flex; flex-direction: column; justify-content: center; color: #ffffff; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: all 0.2s;
  .title { font-size: 24px; font-weight: 700; margin-bottom: 6px; } .time { font-size: 16px; color: #8fa3c4; }
  .arrow { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; border: none; color: #fff; font-size: 18px; }
  &[data-active="true"] { background: #4a72ad; border-color: rgba(255,255,255,0.3); box-shadow: 0 8px 20px rgba(74, 114, 173, 0.3); .time { color: #dce7f7; font-size: 16px; } }
`;
const BottomArea = styled(motion.div)` flex: 1; display: flex; gap: 20px; padding: 24px; background-color: #1c3151; border-radius: 16px; min-height: 0; overflow: hidden; box-shadow: inset 0 0 30px rgba(0,0,0,0.15); `;
const LeftPanel = styled.div` flex: 2.2; background: #041126; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #c3cde0; height: 100%; overflow: hidden; position: relative; `;
const EmptyIcon = styled.div` opacity: 0.4; margin-bottom: 16px; `;
const EmptyText = styled.div` font-size: 15px; opacity: 0.7; font-weight: 500; `;
const RightPanel = styled.div` flex: 1; background: #263e62; border-radius: 12px; display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; height: 100%; overflow: hidden; `;
const RightEmptyState = styled.div` width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; `;
const RightEmptyText = styled.div` font-size: 15px; margin-top: 16px; opacity: 0.7; font-weight: 500; `;

const VideoWrapper = styled(motion.div)` width: 100%; height: 100%; position: relative; border-radius: 12px; overflow: hidden; background: #1C3151; `;
const StyledVideo = styled(motion.video)` width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 12px; `;

const SkeletonLoader = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: #152238; border-radius: 12px; z-index: 2;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; color: #8898b1; font-size: 16px; font-weight: 500;
  svg { opacity: 0.7; }
`;

const VideoTimeBar = styled(motion.div)` position: absolute; left: 0; right: 0; bottom: 0; height: 50px; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 15px; text-shadow: 0 1px 3px rgba(0,0,0,0.6); z-index: 3; `;

const DetailTableWrapper = styled(motion.div)`
  width: 100%; height: 100%; padding: 0 24px 24px 24px; box-sizing: border-box; overflow: auto;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
`;

const DetailTable = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0; font-size: 15px; color: #e2ecff; table-layout: fixed;
  thead th { 
    background-color: #263e62; position: sticky; top: 0; z-index: 10; padding: 24px 0px 0px 0px; border-bottom: 1px solid #3b5275; text-align: left; font-weight: 600; color: #aebcd6; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    p { background-color: #192a56; padding: 14px; font-size: 16px; }
  }
  td { padding: 14px 16px; border-bottom: 1px solid rgba(59, 82, 117, 0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  tr:last-child td { border-bottom: none; }
`;