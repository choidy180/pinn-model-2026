"use client";

import styled, { css } from "styled-components";
import { FiSearch } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import { MdMicOff, MdClose, MdErrorOutline, MdOndemandVideo, MdHistory } from "react-icons/md";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useState, useEffect } from "react";
import { MOCK_PROCESSES, ProcessId } from "@/data/temp-data";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

// ✅ 자동완성 데이터 2개 고정 세팅
const AUTO_COMPLETE_DATA = [
  { id: "PROC-001", sn: "MJT63702706KSD5NE0286", desc: "라인 A 공정 데이터" },
  { id: "PROC-002", sn: "AXR82930411LPT9QR1122", desc: "라인 B 공정 데이터" }
];

export default function SearchPanelFinal() {
  const router = useRouter();
  
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<typeof AUTO_COMPLETE_DATA>([]);
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

    if (val.trim().length > 0) {
      const filtered = AUTO_COMPLETE_DATA.filter(sn => sn.sn.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered.slice(0, 2)); // 최대 2개
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim().length === 0) return;

    const matched = AUTO_COMPLETE_DATA.find(item => item.sn === keyword);
    if (!matched) {
      setErrorMsg("유효하지 않은 SN입니다.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    // ✅ 검색 시 id값 파라미터 추가
    router.push(`/search?selectedId=${matched.id}&sn=${matched.sn}`);
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

  // ✅ 리스트 클릭 시 ID값 포함하여 이동하는 핸들러
  const handleItemClick = (id: string, sn: string) => {
    setKeyword(sn);
    setSuggestions([]);
    setIsFocused(false);
    setIsSearching(true);
    // ✅ URL 파라미터로 선택한 ID값 전달
    router.push(`/search?selectedId=${id}&sn=${sn}`);
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
            <IconWrapper><FiSearch size={22} color="#fff" /></IconWrapper>
            <SearchForm onSubmit={handleSearch}>
              <input placeholder="SN 입력" value={keyword} onChange={handleChange} />
            </SearchForm>
            <ClearButton type="button" onClick={handleReset}><MdClose size={20} /></ClearButton>
          </SearchBox>
        </SearchBoxContainer>
      </TopLeftContainer>

      <AnimatePresence>
        {!isSearching && (
          <CenterOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchBoxContainer variants={containerVariants} initial="center" animate="center">
              <SearchHeader>
                <Title>SN 검색</Title>
                <Subtitle>시리얼 넘버로 자재 및 설비 정보를 조회하세요</Subtitle>
              </SearchHeader>

              <SearchBox $styleType="center">
                <IconWrapper><FiSearch size={32} color="#fff" /></IconWrapper>
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
                {/* ✅ 자동완성 UI 개선: 무조건 밝고 직관적이게 */}
                {isFocused && (keyword.length > 0 ? suggestions.length > 0 : true) && (
                  <SuggestionList
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                  >
                    <ListHeader>검색 결과 / 최근 기록</ListHeader>
                    {(keyword.length > 0 ? suggestions : AUTO_COMPLETE_DATA).map((item) => (
                      <SuggestionItem key={item.id} onMouseDown={() => handleItemClick(item.id, item.sn)}>
                        <div className="icon-box">
                          <MdHistory size={28} color="#fff" />
                        </div>
                        <div className="text-group">
                          <span className="main-text">{item.sn}</span>
                          <span className="sub-text">공정 ID: {item.id}</span>
                        </div>
                        <IoChevronForward className="arrow-icon" size={24} color="#fff" />
                      </SuggestionItem>
                    ))}
                  </SuggestionList>
                )}
              </AnimatePresence>
            </SearchBoxContainer>
          </CenterOverlay>
        )}
      </AnimatePresence>

      <BackgroundContent $isBlurred={!isSearching}>
        <ContentArea>
          <TopMenuBar>
            {MOCK_PROCESSES.map((proc) => (
              <MenuCard key={proc.id} onClick={() => setSelectedId(proc.id)} data-active={selectedId === proc.id}>
                <div className="title">{proc.label}</div>
                <div className="time">{proc.lastTime}</div>
                <button className="arrow"><IoChevronForward /></button>
              </MenuCard>
            ))}
          </TopMenuBar>

          <BottomArea>
            <LeftPanel>
              {selectedProcess && isSearching ? (
                <VideoWrapper>
                  <StyledVideo src={selectedProcess.video.src} autoPlay loop muted playsInline />
                </VideoWrapper>
              ) : (
                <><EmptyIcon><MdMicOff size={50} /></EmptyIcon><EmptyText>공정을 선택하세요.</EmptyText></>
              )}
            </LeftPanel>

            <RightPanel>
              {selectedProcess ? (
                <DetailTableWrapper>
                  <DetailTable>
                    <thead><tr><th><p>항목</p></th><th><p>값</p></th></tr></thead>
                    <tbody>
                      {selectedProcess.details.map((row, idx) => (
                        <tr key={idx}><td>{row.item}</td><td>{row.value}</td></tr>
                      ))}
                    </tbody>
                  </DetailTable>
                </DetailTableWrapper>
              ) : (
                <RightEmptyState><IoMdCloseCircleOutline size={46} /><RightEmptyText>데이터 없음</RightEmptyText></RightEmptyState>
              )}
            </RightPanel>
          </BottomArea>
        </ContentArea>
      </BackgroundContent>
    </PageWrapper>
  );
}

// ✅ 스타일 정의
const containerVariants: Variants = { center: { width: "720px" } };

const PageWrapper = styled.div` width: 100%; min-height: 100vh; background-color: #0e1f38; color: #8898b1; position: relative; `;
const CenterOverlay = styled(motion.div)` position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; z-index: 1000; background: rgba(10, 25, 47, 0.85); backdrop-filter: blur(10px); `;
const SearchHeader = styled.div` text-align: center; margin-bottom: 40px; `;
const Title = styled.h1` font-size: 48px; color: #fff; font-weight: 800; `;
const Subtitle = styled.p` font-size: 20px; color: #dce7f7; `;

const SearchBoxContainer = styled(motion.div)` position: relative; `;
const SearchBox = styled.div<{ $styleType: 'center' | 'corner' }>`
  background: #162a4a; border: 2px solid #3062af; display: flex; align-items: center; gap: 20px;
  ${({ $styleType }) => $styleType === 'center' ? css` width: 720px; height: 90px; border-radius: 20px; padding: 0 35px; ` : css` width: 450px; height: 55px; border-radius: 12px; padding: 0 20px; `}
`;

const SearchForm = styled.form` flex: 1; height: 100%; input { background: transparent; border: none; outline: none; width: 100%; height: 100%; color: #fff; font-size: 26px; font-weight: 600; &::placeholder { color: #5c6b85; } } `;

const SuggestionList = styled(motion.ul)`
  position: absolute; top: 100%; left: 0; width: 100%; margin-top: 15px; padding: 10px;
  background: #1c355d; border: 2px solid #4a8dfa; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.7); list-style: none; z-index: 1100;
`;

const ListHeader = styled.div` padding: 12px 20px; font-size: 14px; color: #fff; font-weight: 700; opacity: 0.6; border-bottom: 1px solid rgba(255,255,255,0.1); `;

const SuggestionItem = styled.li`
  display: flex; align-items: center; gap: 20px; padding: 22px 28px; border-radius: 15px; cursor: pointer; transition: 0.2s;
  .icon-box { width: 50px; height: 50px; border-radius: 12px; background: #3062af; display: flex; align-items: center; justify-content: center; }
  .text-group { display: flex; flex-direction: column; gap: 4px; .main-text { font-size: 22px; font-weight: 800; color: #ffffff !important; } .sub-text { font-size: 15px; color: #4a8dfa; font-weight: 600; } }
  .arrow-icon { margin-left: auto; transition: 0.2s; }
  &:hover { background: #3062af; .arrow-icon { transform: translateX(8px); } }
`;

const TopLeftContainer = styled(motion.div)` position: absolute; top: 30px; left: 30px; z-index: 500; `;
const ClearButton = styled.button` background: none; border: none; color: #fff; cursor: pointer; `;
const ErrorToast = styled(motion.div)` position: fixed; top: 50px; left: 50%; transform: translateX(-50%); background: #ff4d4f; color: #fff; padding: 15px 30px; border-radius: 10px; z-index: 2000; font-weight: 700; `;
const BackgroundContent = styled.div<{ $isBlurred: boolean }>` padding: 40px; transition: 0.6s; ${({ $isBlurred }) => $isBlurred && css` filter: blur(15px); opacity: 0.4; `} `;
const ContentArea = styled.div` display: flex; flex-direction: column; gap: 20px; height: 85vh; `;
const TopMenuBar = styled.div` display: flex; gap: 15px; `;
const MenuCard = styled(motion.div)` flex: 1; background: #223a5e; padding: 20px; border-radius: 12px; cursor: pointer; &[data-active="true"] { background: #3062af; border: 1px solid #fff; } .title { font-size: 22px; font-weight: 700; color: #fff; } `;
const BottomArea = styled.div` flex: 1; display: flex; gap: 20px; background: #1c3151; padding: 20px; border-radius: 15px; `;
const LeftPanel = styled.div` flex: 2; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; `;
const RightPanel = styled.div` flex: 1; background: #263e62; border-radius: 12px; overflow: hidden; `;
const VideoWrapper = styled.div` width: 100%; height: 100%; `;
const StyledVideo = styled.video` width: 100%; height: 100%; object-fit: cover; `;
const DetailTableWrapper = styled.div` padding: 20px; height: 100%; overflow-y: auto; `;
const DetailTable = styled.table` width: 100%; color: #fff; th p { background: #192a56; padding: 12px; text-align: left; } td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); } `;
const IconWrapper = styled.div` display: flex; align-items: center; `;
const EmptyIcon = styled.div` opacity: 0.3; `;
const EmptyText = styled.div` margin-top: 10px; `;
const RightEmptyState = styled.div` height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; `;
const RightEmptyText = styled.div` margin-top: 10px; `;