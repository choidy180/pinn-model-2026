// MultiSelectModal.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiCheck } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import styled, { css } from "styled-components";

/* =========================
 * 1. Types & Data
 * =======================*/

export type SelectItem = {
  id: string;
  label: string;
  value: string | null; // null 허용
  isHeader?: boolean; // 그룹 헤더 여부
  machineCode?: string; // 소속 머신 코드 (A, B, C, D)
  groupKey?: string; // 소속 그룹 키 (예: basicInfo, cylinderTemperature)
};

type MultiSelectModalProps = {
  isOpen: boolean;
  items?: SelectItem[];
  initialSelectedIds?: string[];
  selected: string | null; 
  onClose: () => void;
  onConfirm: (selected: SelectItem[]) => void;
  record: InjectionProcessRecord; 
};

// ... (InjectionProcessRecord, MachineParameters 등 타입 정의 생략) ...

// *******************************************************************
// 파일 크기 문제로 MOCK_INJECTION_PROCESS_RECORD 및 타입 정의는 생략합니다.
// 실제 코드에서는 이전에 정의된 모든 타입과 Mock 데이터가 파일 상단에 있어야 합니다.
// *******************************************************************

// 임시 타입 및 데이터 정의 (실제 파일에서는 상단에 위치해야 함)
type InjectionProcessRecord = any;
const MOCK_INJECTION_PROCESS_RECORD: InjectionProcessRecord = {};
const groupMap = [
    { key: 'G1', label: '그룹 1 (기본 제어)', start: 0, end: 10 },
    { key: 'G2', label: '그룹 2 (사출 파라미터)', start: 10, end: 22 },
    { key: 'G3', label: '그룹 3 (보압/계량)', start: 22, end: 30 },
];
const MOCK_ITEMS_RAW: SelectItem[] = [
    { id: "m1", label: "형폐시간", value: "123sec" }, { id: "m2", label: "형개시간", value: "456sec" },
    { id: "m3", label: "형개완료위치", value: "1.9mm" }, { id: "m4", label: "형체력", value: "2kgf" },
    { id: "m5", label: "히터온도", value: "40C" }, { id: "m6", label: "노즐후진시간", value: "234sec" },
    { id: "m7", label: "형폐시간2", value: "1.9mm" }, { id: "m8", label: "형체력2", value: "2kgf" },
    { id: "m9", label: "히터온도2", value: "40C" }, { id: "m10", label: "노즐후진시간2", value: "234sec" },
    { id: "m11", label: "형폐시간3", value: "123sec" }, { id: "m12", label: "형개시간3", value: "456sec" },
    { id: "m13", label: "형개완료위치3", value: "1.9mm" }, { id: "m14", label: "형체력3", value: "2kgf" },
    { id: "m15", label: "히터온도3", value: "40C" }, { id: "m16", label: "노즐후진시간3", value: "234sec" },
    { id: "m17", label: "형폐시간4", value: "123sec" }, { id: "m18", label: "형개시간4", value: "456sec" },
    { id: "m19", label: "형개완료위치4", value: "1.9mm" }, { id: "m20", label: "형체력4", value: "2kgf" },
    { id: "m21", label: "히터온도4", value: "40C" }, { id: "m22", label: "노즐후진시간4", value: "234sec" },
    { id: "m23", label: "형폐시간5", value: "123sec" }, { id: "m24", label: "형개시간5", value: "456sec" },
    { id: "m25", label: "형개완료위치5", value: "1.9mm" }, { id: "m26", label: "형체력5", value: "2kgf" },
    { id: "m27", label: "히터온도5", value: "40C" }, { id: "m28", label: "노즐후진시간5", value: "234sec" },
    { id: "m29", label: "형폐시간6", value: "123sec" }, { id: "m30", label: "형개시간6", value: "456sec" },
];

const transformItemsWithHeaders = (itemsRaw: any, selectedMachineCode: string | null): SelectItem[] => {
    const items = MOCK_ITEMS_RAW;
    const result: SelectItem[] = [];
    const GROUP_CONFIG = [
        { key: 'G1', label: '그룹 1 (기본 제어)', start: 0, end: 10 },
        { key: 'G2', label: '그룹 2 (사출 파라미터)', start: 10, end: 22 },
        { key: 'G3', label: '그룹 3 (보압/계량)', start: 22, end: items.length },
    ];
    
    result.push({ id: "ALL_DATA", label: "✔️ 전체 데이터 선택 (ALL)", value: null, isHeader: true, groupKey: "ALL", machineCode: "ALL" });
    
    GROUP_CONFIG.forEach(group => {
        const groupItems = items.slice(group.start, group.end);
        if (groupItems.length === 0) return;

        result.push({ id: `HEADER_${group.key}`, label: group.label, value: null, isHeader: true, groupKey: group.key });

        groupItems.forEach(item => {
            result.push({ ...item, groupKey: group.key, isHeader: false, machineCode: selectedMachineCode || 'A' });
        });
    });
    return result;
};


/* =========================
 * Custom Scroll Area (스타일 유지)
 * =======================*/
const CustomScrollArea: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);
    setContentHeight(el.scrollHeight);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setScrollTop(el.scrollTop);
      setViewportHeight(el.clientHeight);
      setContentHeight(el.scrollHeight);
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const thumbHeightPercent = useMemo(() => {
    if (!viewportHeight || !contentHeight) return 100;
    const ratio = viewportHeight / contentHeight;
    return Math.max(ratio * 100, 10);
  }, [viewportHeight, contentHeight]);

  const thumbTopPercent = useMemo(() => {
    if (!viewportHeight || !contentHeight) return 0;
    const maxScroll = contentHeight - viewportHeight;
    if (maxScroll <= 0) return 0;

    const maxTravel = 100 - thumbHeightPercent;
    return (scrollTop / maxScroll) * maxTravel;
  }, [scrollTop, viewportHeight, contentHeight, thumbHeightPercent]);

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const el = containerRef.current;
    const trackHeight = el.clientHeight - 8;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (trackHeight <= 0 || maxScroll <= 0) return;

    const deltaY = e.clientY - dragStartYRef.current;
    const thumbTravelScroll = (deltaY / trackHeight) * maxScroll;

    el.scrollTop = dragStartScrollTopRef.current + thumbTravelScroll;
  };

  const handleWindowMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  };

  const handleThumbMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;

    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartScrollTopRef.current = el.scrollTop;

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  const hasScroll = contentHeight > viewportHeight + 1;

  return (
    <ScrollOuter>
      <ScrollInner ref={containerRef} onScroll={handleScroll}>
        {children}
      </ScrollInner>

      {hasScroll && (
        <ScrollTrack>
          <ScrollThumb
            $top={thumbTopPercent}
            $height={thumbHeightPercent}
            onMouseDown={handleThumbMouseDown}
          />
        </ScrollTrack>
      )}
    </ScrollOuter>
  );
};


/* =========================
 * Component
 * =======================*/

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  isOpen,
  initialSelectedIds = [],
  selected,
  onClose,
  onConfirm,
  record = MOCK_INJECTION_PROCESS_RECORD,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const allItems = useMemo(() => {
    return transformItemsWithHeaders(record, selected); 
  }, [record, selected]);

  const safeItems = allItems;

  // 🔥 2. 그룹/전체 선택 상태를 계산하여 selectedIds에 반영하는 로직 (동기화)
  useEffect(() => {
    const currentSelectedItems = new Set(selectedIds.filter(id => !id.startsWith('HEADER_') && id !== 'ALL_DATA' && !id.startsWith('GROUP_')));
    
    const groupMap: { [key: string]: string[] } = {};
    const allSelectableItems: string[] = [];

    safeItems.forEach(item => {
        if (!item.isHeader && item.groupKey && item.groupKey !== 'ALL' && item.groupKey !== 'INFO') {
            if (!groupMap[item.groupKey]) {
                groupMap[item.groupKey] = [];
            }
            groupMap[item.groupKey].push(item.id);
            allSelectableItems.push(item.id);
        }
    });

    const headerIdsToAdd: string[] = [];
    let selectedItemsCount = 0;

    Object.entries(groupMap).forEach(([groupKey, itemIds]) => {
        const headerId = `HEADER_${groupKey}`;
        const groupSelectedCount = itemIds.filter(id => currentSelectedItems.has(id)).length;
        
        selectedItemsCount += groupSelectedCount;

        if (groupSelectedCount === itemIds.length && itemIds.length > 0) {
            headerIdsToAdd.push(headerId);
        }
    });

    const totalItemsCount = allSelectableItems.length;
    if (selectedItemsCount > 0 && selectedItemsCount === totalItemsCount && totalItemsCount > 0) {
        headerIdsToAdd.push('ALL_DATA');
    }

    const finalSelectedIds = Array.from(new Set([...Array.from(currentSelectedItems), ...headerIdsToAdd]));
    
    if (finalSelectedIds.length !== selectedIds.length || finalSelectedIds.some(id => !selectedIds.includes(id))) {
        setSelectedIds(finalSelectedIds);
    }
  }, [safeItems, selectedIds.length]); 

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return safeItems;
    const lower = searchTerm.toLowerCase();
    return safeItems.filter((item) =>
      item.isHeader || item.label.toLowerCase().includes(lower)
    );
  }, [safeItems, searchTerm]);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return filteredItems.filter(item => !item.isHeader).slice(0, 5);
  }, [filteredItems, searchTerm]);

  const selectedItems = useMemo(
    // ALL_DATA만 칩에 표시하고, 나머지 그룹 헤더는 필터링
    () => safeItems.filter((item) => 
        selectedIds.includes(item.id) && !(item.id.startsWith('HEADER_') && item.groupKey !== 'ALL')
    ),
    [safeItems, selectedIds]
  );

  const toggleSelect = (id: string) => {
    const isSelected = selectedIds.includes(id);
    const targetItem = safeItems.find(x => x.id === id);

    if (!targetItem) return;

    if (id === "ALL_DATA") {
      // 🔥 ALL_DATA 토글: 이미 선택된 상태라면 -> 해제
      if (isSelected) {
          setSelectedIds([]); 
      } else {
          // 선택된 상태가 아니라면 -> 모든 ID 선택
          const allIds = safeItems.map(item => item.id);
          setSelectedIds(allIds);
      }
      
    } else if (id.startsWith("HEADER_")) {
      const targetGroupKey = targetItem.groupKey;

      const groupItemIds = safeItems
        .filter(item => item.groupKey === targetGroupKey)
        .map(item => item.id);

      setSelectedIds(prev => {
        let newIds = prev.filter(x => !groupItemIds.includes(x));

        if (!isSelected) {
          newIds.push(...groupItemIds);
        }

        return Array.from(new Set(newIds.filter(x => x !== "ALL_DATA")));
      });

    } else {
      // 개별 항목 선택/해제 처리
      setSelectedIds((prev) => {
        return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      });
    }
  };


  const handleRemoveChip = (id: string) => {
    toggleSelect(id);
  };

  const handleConfirm = () => {
    const actualSelectedItems = safeItems.filter((item) =>
      selectedIds.includes(item.id) && !item.isHeader
    );
    onConfirm(actualSelectedItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <Dialog>
        {/* 검색 영역 */}
        <SearchArea>
          <SearchInputWrapper>
            <SearchIcon>
              <IoSearchOutline />
            </SearchIcon>
            <SearchInput
              placeholder="파라미터를 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {suggestions.length > 0 && (
              <SearchSuggestions>
                {suggestions.map((item) => (
                  <SuggestionItem
                    key={item.id}
                    onClick={() => {
                      toggleSelect(item.id);
                      setSearchTerm("");
                    }}
                  >
                    <SuggestionIcon><IoSearchOutline /></SuggestionIcon>
                    <SuggestionLabel>{item.label}</SuggestionLabel>
                  </SuggestionItem>
                ))}
              </SearchSuggestions>
            )}
          </SearchInputWrapper>

          {selectedItems.length > 0 && (
            <ChipRow>
              {selectedItems.map((item) => (
                <Chip key={item.id} onClick={() => !item.isHeader && handleRemoveChip(item.id)}>
                  <span>{item.label}</span>
                  {/* ALL_DATA (isHeader=true, groupKey='ALL') 일 때 X 버튼 표시 */}
                  {(!item.isHeader || item.id === 'ALL_DATA') && ( 
                    <ChipRemoveButton type="button">
                      <FiPlus />
                    </ChipRemoveButton>
                  )}
                </Chip>
              ))}
            </ChipRow>
          )}
        </SearchArea>

        {/* 리스트 영역 */}
        <ListArea>
          <CustomScrollArea>
            <ItemList>
              {filteredItems.map((item) => {
                const checked = selectedIds.includes(item.id);
                const isHeader = item.isHeader;

                return (
                  <ItemRow
                    key={item.id}
                    $isHeader={isHeader}
                  >
                    <LeftGroup
                      onClick={() => toggleSelect(item.id)}
                      $isHeader={isHeader}
                    >
                      <CheckboxWrapper>
                        <HiddenCheckbox
                          checked={checked}
                          readOnly
                        />
                        <StyledCheckbox checked={checked} $isHeader={isHeader}>
                          <FiCheck />
                        </StyledCheckbox>
                      </CheckboxWrapper>
                      <LabelText>{item.label}</LabelText>
                    </LeftGroup>

                    {!isHeader && (
                      <ValueBox>{item.value ?? 'N/A'}</ValueBox>
                    )}
                  </ItemRow>
                );
              })}
              {filteredItems.length === 0 && (
                <EmptyRow>검색 결과가 없습니다.</EmptyRow>
              )}
            </ItemList>
          </CustomScrollArea>
        </ListArea>

        <Footer>
          <GhostButton type="button" onClick={onClose}>
            취소
          </GhostButton>
          <PrimaryButton type="button" onClick={handleConfirm}>
            확인
          </PrimaryButton>
        </Footer>
      </Dialog>
    </Overlay>
  );
};

export default MultiSelectModal;

/* =========================
 * Styles (ChipRow에 스크롤 추가 및 ListArea 재정의)
 * =======================*/

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
`;

const Dialog = styled.div`
  width: 100%; max-width: 560px; max-height: 80vh;
  background: #1C3153; border-radius: 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
  padding: 24px 28px 20px; box-sizing: border-box;

  display: flex; flex-direction: column; gap: 18px;
`;

const SearchArea = styled.div`
  display: flex; flex-direction: column; gap: 10px;
`;

const SearchInputWrapper = styled.div`
  position: relative; width: 100%;
  background: #243d64; border-radius: 12px;
  padding: 10px 14px 10px 38px;
`;

const SearchIcon = styled.span`
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%); pointer-events: none;
  font-size: 16px;
`;

const SearchInput = styled.input`
  width: 100%; border: none; outline: none;
  background: transparent; color: #f4f7ff;
  font-size: 15px;

  &::placeholder { color: #8494b6; }
`;

const SearchSuggestions = styled.div`
  position: absolute; left: 0; right: 0;
  top: 100%; margin-top: 4px;
  background: #243d64; border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55);
  max-height: 180px; overflow-y: auto; padding: 6px 0;
  z-index: 10;
`;

const SuggestionItem = styled.button`
  width: 100%; border: none; outline: none;
  background: transparent; padding: 8px 14px 8px 36px;
  display: flex; align-items: center; gap: 8px; cursor: pointer;

  color: #ffffff; font-size: 16px;

  &:hover { background: rgba(15, 34, 70, 0.8); }

  svg { width: 18px; height: 18px; }
`;

const SuggestionIcon = styled.span`
  position: absolute; left: 14px;
  font-size: 14px; opacity: 0.8;
`;

const SuggestionLabel = styled.span`
  margin-left: 10px;
`;

const ChipRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 7px;
  max-height: 90px; 
  overflow-y: auto;
  padding-bottom: 5px; 
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const Chip = styled.div`
  display: inline-flex; align-items: center;
  padding: 6px 12px 6px 16px; border-radius: 999px;
  background: #08152B; color: #f4f7ff;
  font-size: 14px; cursor: pointer;

  svg {
    display: flex; justify-content: center; align-items: center;
    height: 22px; width: 22px;
  }
`;

const ChipRemoveButton = styled.button`
  border: none; outline: none; background: transparent;
  color: #ffffff; cursor: pointer; font-size: 18px;
  line-height: 1; display: flex; justify-content: center;
  align-items: center;

  svg { rotate: 45deg; }
`;

const ListArea = styled.div`
  flex: 1; 
  min-height: 0;
  overflow: hidden;
  border-radius: 12px; background: #0b1d36;
`;

const ItemList = styled.div`
  padding: 12px 10px; display: flex;
  flex-direction: column; gap: 8px;
`;

// LeftGroup 참조 전에 LabelText 정의
const LabelText = styled.span`
  font-size: 16px;
  color: #dbe4ff;
  font-weight: 600;
  transition: color 0.2s ease;
`;

// LeftGroup은 StyledCheckbox와 LabelText 위에 있어야 안전
const LeftGroup = styled.div<{ $isHeader?: boolean }>`
  display: flex; align-items: center;
  gap: 12px; cursor: pointer;
  padding: 4px 0;

  ${({ $isHeader }) => $isHeader && css`
    cursor: pointer;

    ${LabelText} {
      color: #b0c2ff;
      font-weight: 700;
    }
  `}

  &:hover span { color: #ffffff; }
`;


const ItemRow = styled.div<{ $isHeader?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $isHeader }) => ($isHeader ? '1fr' : 'minmax(0, 0.38fr) minmax(0, 1fr)')};
  gap: 10px;
  align-items: center;
  padding-right: 10px;

  ${({ $isHeader }) => $isHeader && css`
    background: rgba(72, 103, 255, 0.15);
    border-radius: 8px;
    padding: 4px 0;
    margin: 4px 0;
    padding-left: 10px;

    & + div {
      margin-top: 10px;
    }
  `}
`;

const CheckboxWrapper = styled.div`
  display: inline-flex; align-items: center;
  position: relative;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0; clip: rect(0 0 0 0); height: 1px;
  margin: -1px; overflow: hidden; padding: 0;
  position: absolute; white-space: nowrap; width: 1px;
`;

const StyledCheckbox = styled.div<{ checked: boolean, $isHeader?: boolean }>`
  width: ${({ $isHeader }) => ($isHeader ? '24px' : '20px')};
  height: ${({ $isHeader }) => ($isHeader ? '24px' : '20px')};
  background: ${(props) => (props.checked ? "#4867ff" : "rgba(255, 255, 255, 0.05)")};
  border: 2px solid ${(props) => (props.checked ? "#4867ff" : "#3b4f73")};
  border-radius: 6px; display: flex;
  align-items: center; justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);

  svg {
    color: white;
    font-size: ${({ $isHeader }) => ($isHeader ? '18px' : '14px')};
    stroke-width: 3px;
    opacity: ${(props) => (props.checked ? 1 : 0)};
    transform: scale(${(props) => (props.checked ? 1 : 0.5)});
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${LeftGroup}:hover & {
    border-color: ${(props) => (props.checked ? "#5c78ff" : "#5A749A")};
  }
`;

const ValueBox = styled.div`
  padding: 8px 16px; border-radius: 8px;
  background: #08152B; border: 1px solid #24334e;
  color: #ffffff; font-size: 16px; font-weight: 600;
`;

const EmptyRow = styled.div`
  padding: 16px 4px; text-align: center;
  font-size: 13px; color: #9cadcf;
`;

const Footer = styled.div`
  display: flex; justify-content: flex-end;
  gap: 10px; margin-top: 4px;
`;

const ButtonBase = styled.button`
  height: 44px; min-width: 50%;
  border-radius: 10px; font-size: 15px;
  font-weight: 600; cursor: pointer;
  border: none; outline: none;

  display: flex; align-items: center; justify-content: center;

  transition: background 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease;
`;

const GhostButton = styled(ButtonBase)`
  background: transparent; color: #d8e1ff;
  border: 2px solid #3b4f73;

  &:hover { background: rgba(34, 53, 93, 0.7); }
`;

const PrimaryButton = styled(ButtonBase)`
  background: #4867ff; color: #ffffff;
  box-shadow: 0 6px 16px rgba(23, 54, 180, 0.6);

  &:hover { background: #5c78ff; }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 8px rgba(23, 54, 180, 0.6);
  }
`;

const ScrollOuter = styled.div`
  position: relative; flex: 1; min-height: 0;
  max-height: 350px; overflow-y: scroll;
`;

const ScrollInner = styled.div`
  height: 100%; overflow-y: scroll; overflow-x: hidden;
  padding-right: 12px;

  -ms-overflow-style: none; scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
`;

const ScrollTrack = styled.div`
  position: absolute; top: 2px; right: 2px; bottom: 2px;
  width: 8px; border-radius: 999px; pointer-events: none;
`;

const ScrollThumb = styled.div<{ $top: number; $height: number }>`
  position: absolute; left: 0; width: 100%;
  border-radius: 999px; background: #5A749A; cursor: pointer;

  top: ${({ $top }) => $top}%;
  height: ${({ $height }) => $height}%;

  pointer-events: auto;

  &:hover { background: linear-gradient(180deg, #6f8dff, #9fe4ff); }
`;