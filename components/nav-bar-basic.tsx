"use client";

import React, { useMemo, useRef } from "react";
import styled from "styled-components";
import IconLogo from "@/public/icon/logo-icon.svg";
import { BiSolidHome } from "react-icons/bi";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const NAV_HEIGHT = 68;
const MENU_WIDTH = 170;

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // 현재 경로에 따른 활성 메뉴 인덱스 계산
  const activeIndex = useMemo(() => {
    if (pathname.includes('warehouse')) return 0;
    if (pathname.includes('/facilities')) return 1;
    if (pathname.includes('/dryer')) return 2;
    if (pathname.includes('/packing')) return 3;
    if (pathname.includes('/assembly')) return 4;
    if (pathname.includes('/search')) return 5;
    return -1;
  }, [pathname]);

  return (
    <NavWrapper ref={navRef}>
      <NavInner>
        <LogoArea onClick={() => router.push('/')}>
          <Image src={IconLogo} width={20} height={20} alt="logo" />
          <LogoText>
            <span className="dim">공간 검색 기반</span>
            <span className="accent">리얼 스트리밍</span>
          </LogoText>
        </LogoArea>

        <RightGroup>
          <Menu>
            <MenuItem $active={activeIndex === 0}>
              <button onClick={() => router.push('/warehouse')}>자재창고</button>
            </MenuItem>

            <MenuItem $active={activeIndex === 1}>
              <button onClick={() => router.push('/facilities/type')}>사출설비</button>
            </MenuItem>

            <MenuItem $active={activeIndex === 2}>
              <button onClick={() => router.push('/dryer?selected')}>건조실</button>
              {/* 서브메뉴 예시 (필요시 사용) */}
              <SubMenu>
                <SubMenuItem onClick={() => router.push('/dryer/1')}>건조실 A</SubMenuItem>
                <SubMenuItem onClick={() => router.push('/dryer/2')}>건조실 B</SubMenuItem>
              </SubMenu>
            </MenuItem>

            <MenuItem $active={activeIndex === 3}>
              <button onClick={() => router.push('/packing')}>패킹</button>
            </MenuItem>

            <MenuItem $active={activeIndex === 4}>
              <button onClick={() => router.push('/assembly')}>조립라인</button>
            </MenuItem>

            <MenuItem $active={activeIndex === 5}>
              <button onClick={() => router.push('/search?selected=inquiry')}>검색</button>
            </MenuItem>

            <ActiveIndicator $index={activeIndex} />
          </Menu>

          <RightArea>
            <HomeButton onClick={() => router.push('/')}>
              <BiSolidHome />
            </HomeButton>
          </RightArea>
        </RightGroup>
      </NavInner>
    </NavWrapper>
  );
};

export default NavBar;

// ───────────────────── 스타일 정의 ─────────────────────

const NavWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: ${NAV_HEIGHT}px;
  background: #051328;
  color: #ffffff;
  padding: 0 35px;
  z-index: 9999;
  border-bottom: 1px solid #2A3648;
  
  /* 항상 노출 */
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;

const NavInner = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const LogoText = styled.div`
  font-size: 18px;
  display: flex;
  gap: 4px;
  font-weight: 500;
  .dim { color: #FFFFFF; }
  .accent { color: #40A0E5; }
`;

const RightGroup = styled.div`
  margin-left: auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Menu = styled.ul`
  display: flex;
  height: 100%;
  align-items: stretch;
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ActiveIndicator = styled.div<{ $index: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: #ffffff;
  width: ${MENU_WIDTH}px;
  pointer-events: none;
  transform: translateX(${({ $index }) => ($index < 0 ? 0 : $index * MENU_WIDTH)}px);
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  opacity: ${({ $index }) => ($index < 0 ? 0 : 1)};
  z-index: 10;
`;

const SubMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #050b14;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-5px);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 10000;
`;

const MenuItem = styled.li<{ $active?: boolean }>`
  position: relative;
  height: 100%;
  display: flex;
  align-items: stretch;

  button {
    width: ${MENU_WIDTH}px;
    height: 100%;
    border: none;
    background: ${({ $active }) => ($active ? "#3151B9" : "transparent")};
    color: ${({ $active }) => ($active ? "#ffffff" : "#d0d6e0")};
    padding: 0 24px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all ease 0.15s;
  }

  &:hover button {
    background: #3151B9;
    color: #ffffff;
  }

  &:hover ${SubMenu} {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
`;

const SubMenuItem = styled.button`
  border: none;
  background: #142032 !important;
  height: 52px !important;
  color: #d0d6e0;
  padding: 14px 15px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  transition: all ease-in-out 0.2s;
  width: 100% !important;

  &:hover {
    background: #3151B9 !important;
    color: #ffffff;
  }
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
`;

const HomeButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #3c4b5e;
  background: #2C4B77;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A5B9D5;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;

  &:hover {
    background: #3151B9;
  }
`;