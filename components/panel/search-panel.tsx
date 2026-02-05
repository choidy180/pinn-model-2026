"use client";

import styled from "styled-components";
import { FiSearch } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { MdMicOff } from "react-icons/md";

export default function SearchPanel() {
  return (
    <PageWrapper>
      {/* 🔍 검색바 */}
      <SearchBox>
        <FiSearch />
        <input placeholder="SN 검색" />
      </SearchBox>

      {/* 공정 카테고리 */}
      <TopMenuBar>
        {[
          "원소재",
          "사출설비A",
          "건조실",
          "패킹",
          "조립라인",
        ].map((label) => (
          <MenuCard key={label}>
            <div className="title">{label}</div>
            <div className="time">250926/16:21:22</div>
            <button className="arrow">
              <IoChevronForward />
            </button>
          </MenuCard>
        ))}
      </TopMenuBar>

      {/* 메인 하단 UI */}
      <BottomArea>
        {/* 좌측 패널 */}
        <LeftPanel>
          <EmptyIcon>
            <MdMicOff size={50} />
          </EmptyIcon>
          <EmptyText>상단에서 공정을 선택하세요.</EmptyText>
        </LeftPanel>

        {/* 우측 패널 */}
        <RightPanel>
          <EmptyIcon>
            <IoMdCloseCircleOutline size={46} />
          </EmptyIcon>
          <RightEmptyText>데이터가 없습니다.</RightEmptyText>
        </RightPanel>
      </BottomArea>
    </PageWrapper>
  );
}

/* ================================
 * Styles
 * ================================ */

const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  color: #dce7f7;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SearchBox = styled.div`
  width: 380px;
  height: 42px;
  background: #041126;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 15px;
  color: #b9c4d5;

  input {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    color: #dce7f7;

    &::placeholder {
      color: #8d9ab0;
    }
  }
`;

const TopMenuBar = styled.div`
  width: 100%;
  display: flex;
  gap: 14px;
`;

const MenuCard = styled.div`
  position: relative;
  width: 100%;
  height: 70px;
  background: #1C3151;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #dce7f7;

  .title {
    font-size: 17px;
    font-weight: 700;
  }

  .time {
    font-size: 13px;
    margin-top: 4px;
    color: #9ba7b9;
  }

  .arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1b2331;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    color: #b8c5d8;
    font-size: 16px;
    cursor: pointer;
  }
`;

const BottomArea = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
`;

/* 좌측 영역 */
const LeftPanel = styled.div`
  flex: 2.2;
  background: #041126;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c3cde0;
`;

const EmptyIcon = styled.div`
  opacity: 0.4;
  margin-bottom: 12px;
`;

const EmptyText = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

/* 우측 영역 */
const RightPanel = styled.div`
  flex: 1;
  background: #34455f;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const RightEmptyText = styled.div`
  font-size: 14px;
  margin-top: 12px;
  opacity: 0.7;
`;
