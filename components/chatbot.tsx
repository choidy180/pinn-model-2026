"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { MessageSquare, X, Send, Cpu } from 'lucide-react';

// -----------------------------------------------------------------------------
// [DATA SECTION] 제공해주신 데이터 통합
// -----------------------------------------------------------------------------

export interface MaterialStockRow { name: string; quantity: number; }
export const defaultRows: MaterialStockRow[] = [
  { name: "ABS", quantity: 12 }, { name: "BSPR", quantity: 9 },
  { name: "PP", quantity: 13 }, { name: "총합", quantity: 35 },
];

export interface PressureRowData { name: string; status: "high" | "normal"; diffPercent?: number; }
export const defaultPressureRows: PressureRowData[] = [
  { name: "사출설비 A", status: "high", diffPercent: 10 }, { name: "사출설비 B", status: "normal" },
  { name: "사출설비 C", status: "normal" }, { name: "사출설비 D", status: "high", diffPercent: 5 },
];

export const coolantRows = [
  { name: "사출설비 A", temp: "70℃", delta: "+25℃", type: "up", variant: "alert" },
  { name: "사출설비 B", temp: "42℃", delta: "-3℃", type: "down", variant: "neutral" },
  { name: "사출설비 C", temp: "65℃", delta: "+20℃", type: "up", variant: "alert" },
  { name: "사출설비 D", temp: "46℃", delta: "+1℃", type: "up", variant: "neutral" },
];

export const defaultDryerRows = [
  { name: "1번 건조기", base: "90", current: "99", delta: "+9", type: "up" },
  { name: "2번 건조기", base: "90", current: "97", delta: "+7", type: "up" },
  { name: "3번 건조기", base: "90", current: "90", delta: "0", type: "down" },
  { name: "4번 건조기", base: "90", current: "93", delta: "+3", type: "down" },
];

export const DRYER_CARDS = [
  { id: 1, name: "1번 건조기", material: "PP", targetTemp: 48, currentTemp: 60 },
  { id: 2, name: "2번 건조기", material: "PP", targetTemp: 48, currentTemp: 48 },
  { id: 3, name: "3번 건조기", material: "PP", targetTemp: 48, currentTemp: 50 },
  { id: 4, name: "4번 건조기", material: "PP", targetTemp: 48, currentTemp: 46 },
];

export const WH_CARDS = [
  { id: 1, name: "ABS 창고", material: "ABS", targetTemp: 23, currentTemp: 24 },
  { id: 2, name: "PP 창고", material: "PP", targetTemp: 23, currentTemp: 25 },
  { id: 3, name: "BSPR 창고", material: "BSPR", targetTemp: 23, currentTemp: 23 },
];

export const MOCK_PROCESSES = [
  {
    id: "injectionA", label: "사출설비 A", lastTime: "250926/16:21:22",
    details: [
      { item: "QR코드", value: "QSN00124" }, { item: "샷카운트", value: "6" },
      { item: "전체공정시간", value: "11분" }, { item: "사출시간", value: "9분" },
      { item: "형폐시간", value: "123sec" }, { item: "형개시간", value: "456sec" },
      { item: "최대압력", value: "10pak" }, { item: "센서01", value: "1단계" },
    ],
  },
  {
    id: "dry", label: "건조실", lastTime: "250926/16:21:22",
    details: [
      { item: "건조온도", value: "80℃" }, { item: "건조시간", value: "6시간" },
    ],
  },
];

export const MOCK_STOCK_HISTORY = [
  { id: "H-1", datetime: "2025/10/07 16:21:22", materialLabel: "ABS 3단 적재", workDescription: "재작업팀" },
  { id: "H-2", datetime: "2025/10/07 15:41:23", materialLabel: "ABS +1번 조치", workDescription: "자재팀" },
  { id: "H-3", datetime: "2025/10/06 11:00:00", materialLabel: "PP 입고", workDescription: "물류팀" },
];

// 통합 로그 검색을 위한 가상 데이터 결합
const ALL_LOGS = [
    ...MOCK_STOCK_HISTORY.map(h => ({ date: h.datetime, target: h.materialLabel, desc: h.workDescription })),
    // 건조기 이벤트 등 추가 가능
];

// -----------------------------------------------------------------------------
// [LOGIC ENGINE] 질문 분석 및 답변 생성기 (고도화됨)
// -----------------------------------------------------------------------------

const generateGuide = () => {
  return `🤖 **질문을 이해하지 못했습니다. 아래 버튼이나 예시를 참고해주세요.**

**1. 🚨 시스템 진단**
- "현재 경고 알람 있어?"
- "위험한 설비 알려줘"

**2. 🏭 설비 상세 제어**
- "1번 건조기 온도 어때?"
- "사출설비 A 형폐시간 얼마야?" (센서값 검색)

**3. 📦 자재 및 재고**
- "ABS 재고 수량"
- "ABS 최근 이력 보여줘"`;
};

const analyzeDataAndResponse = (input: string): string => {
  const query = input.replace(/\s+/g, '').toLowerCase();

  // 1. [Critical Alert] 경고/위험
  if (query.match(/(경고|위험|문제|이상|에러|오류|alert|warning)/)) {
    let reports: string[] = []; // 타입 명시

    const highPressure = defaultPressureRows.filter(r => r.status === 'high');
    if (highPressure.length > 0) reports.push(`🔴 **사출압력 이상**: ${highPressure.map(r => `${r.name}(${r.diffPercent}% 초과)`).join(', ')}`);

    const hotCoolant = coolantRows.filter(r => r.variant === 'alert');
    if (hotCoolant.length > 0) reports.push(`🌡️ **냉각수 온도 경고**: ${hotCoolant.map(r => `${r.name}(${r.temp})`).join(', ')}`);

    const hotDryer = DRYER_CARDS.filter(c => c.currentTemp > c.targetTemp + 5);
    if (hotDryer.length > 0) reports.push(`🔥 **건조기 과열**: ${hotDryer.map(c => `${c.name}(현재 ${c.currentTemp}℃)`).join(', ')}`);

    if (reports.length === 0) return `✅ **시스템 정상 가동 중**\n현재 감지된 경고나 이상 징후가 없습니다.`;
    return `⚠️ **시스템 긴급 리포트**\n\n` + reports.join('\n\n');
  }

  // 2. [Deep Dive] 설비 및 센서 데이터
  if (query.includes("사출") || query.includes("설비")) {
    const processData = MOCK_PROCESSES.find(p => p.id === "injectionA" || query.includes("a"));
    
    if (processData) {
      // 특정 센서값 검색 (예: 형폐시간)
      const keywords = input.split(' ').filter(k => k.length > 1 && !k.match(/(사출|설비|보여줘|알려줘|값|얼마)/));
      for (const keyword of keywords) {
        const sensor = processData.details.find(d => d.item.replace(/\s/g, '').includes(keyword));
        if (sensor) return `🎯 **${processData.label} - ${sensor.item}**\n\n측정값: **${sensor.value}**\n(기준: ${processData.lastTime})`;
      }

      // 설비 요약
      return `🏭 **${processData.label} 종합 상태**\n` +
             `- 연결: 온라인 (${processData.lastTime})\n` +
             `- 주요 데이터: 샷카운트 ${processData.details.find(d=>d.item.includes("샷"))?.value}\n` +
             `💡 Tip: "형폐시간 알려줘" 처럼 특정 값을 물어보세요.`;
    }
  }

  // 3. [Dryer] 건조기
  if (query.includes("건조기")) {
    const num = query.match(/\d+/);
    if (num) {
      const id = parseInt(num[0]);
      const card = DRYER_CARDS.find(c => c.id === id);
      const row = defaultDryerRows.find(r => r.name.includes(`${id}번`));
      
      if (!card) return `🚫 ${id}번 건조기는 존재하지 않습니다.`;
      
      const isHot = card.currentTemp > card.targetTemp + 5;
      return `🔥 **${card.name} 정보**\n` +
             `- 상태: ${isHot ? `⚠️ 과열` : `✅ 정상`}\n` +
             `- 온도: 현재 ${card.currentTemp}℃ / 설정 ${card.targetTemp}℃\n` +
             `- 변화: ${row ? row.delta : '-'}℃ (${row?.type === 'up' ? '상승' : '하강'})`;
    }
    return `🔥 **건조기 전체 현황**\n` + defaultDryerRows.map(r => `- ${r.name}: ${r.current}℃`).join('\n');
  }

  // 4. [Material] 자재/재고/이력
  const materials = ["abs", "pp", "bspr", "pmma"];
  const targetMat = materials.find(m => query.includes(m));

  if (targetMat) {
    const matName = targetMat.toUpperCase();
    const stock = defaultRows.find(r => r.name === matName);
    const wh = WH_CARDS.find(c => c.material === matName);
    const logs = ALL_LOGS.filter(l => l.target.includes(matName));

    if (query.includes("이력") || query.includes("기록")) {
       if (logs.length === 0) return `📜 **${matName}** 관련 이력이 없습니다.`;
       return `📜 **${matName} 최근 이력**\n\n` + logs.map(l => `[${l.date.split(' ')[1]}] ${l.desc}`).join('\n');
    }

    return `📦 **${matName} 자재 리포트**\n` +
           `- 메인 재고: **${stock ? stock.quantity : 0}ea**\n` +
           `- 위치: ${wh ? `${wh.name} (${wh.currentTemp}℃)` : '정보 없음'}\n` +
           `- 최근 작업: ${logs.length > 0 ? logs[0].desc : '-'}`;
  }

  // 5. [Logs] 전체 로그
  if (query.match(/(이력|로그|기록|작업)/)) {
    return `🗄️ **최근 시스템 로그**\n\n` + ALL_LOGS.slice(0, 4).map(e => `• ${e.date.split(' ')[0]} | ${e.desc}`).join('\n');
  }

  return generateGuide();
};

// -----------------------------------------------------------------------------
// [STYLED COMPONENTS]
// -----------------------------------------------------------------------------

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(56, 189, 248, 0); }
  100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
`;
const typing = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-4px); opacity: 1; }
`;

const WidgetContainer = styled.div`
  position: fixed; 
  bottom: 30px; 
  right: 30px; 
  z-index: 9999;
  display: flex; 
  flex-direction: column; 
  align-items: flex-end;
  font-family: 'Pretendard', sans-serif;
  
  /* 컨테이너 자체는 클릭 무시 (뒤의 요소 클릭 가능) */
  pointer-events: none; 
`;

// Transient Prop ($isOpen) 적용
const ToggleButton = styled.button<{ $isOpen: boolean }>`
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid #38bdf8; color: #38bdf8;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
  backdrop-filter: blur(4px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${pulse} 3s infinite;
  pointer-events: auto;

  &:hover { transform: scale(1.1); background: #38bdf8; color: #0f172a; }
  
  ${props => props.$isOpen && css`
    background: #ef4444; border-color: #f87171; color: white;
    transform: rotate(135deg); animation: none;
    &:hover { background: #dc2626; transform: rotate(135deg) scale(1.1); }
  `}
`;

// Transient Prop ($isOpen) 적용
const ChatWindow = styled.div<{ $isOpen: boolean }>`
  width: 400px; height: 600px;
  background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px;
  margin-bottom: 24px; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  transform-origin: bottom right; 
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(40px)')};
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.4s;
  pointer-events: ${props => (props.$isOpen ? 'auto' : 'none')};
`;

const Header = styled.div`
  padding: 16px 20px; background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  display: flex; align-items: center; justify-content: space-between;
  
  h3 {
    margin: 0; font-size: 15px; font-weight: 700; color: #f1f5f9;
    display: flex; align-items: center; gap: 8px;
    span { color: #38bdf8; font-size: 10px; background: rgba(56, 189, 248, 0.15); padding: 2px 6px; border-radius: 4px; }
  }
`;

const MessageList = styled.div`
  flex: 1; padding: 20px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 10px; }
`;

// Transient Prop ($isBot) 적용
const MessageBubble = styled.div<{ $isBot: boolean }>`
  max-width: 88%; padding: 14px 18px; border-radius: 14px;
  font-size: 14px; line-height: 1.6; position: relative;
  white-space: pre-wrap; word-break: break-word;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  animation: ${slideIn} 0.3s ease forwards;

  strong { font-weight: 700; color: #38bdf8; }
  
  ${props => props.$isBot ? css`
    align-self: flex-start; 
    background: rgba(30, 41, 59, 0.7); color: #e2e8f0;
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-top-left-radius: 2px;
  ` : css`
    align-self: flex-end; 
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white; border-bottom-right-radius: 2px;
  `}
`;

const TypingIndicator = styled.div`
  align-self: flex-start; padding: 12px 16px; 
  background: rgba(30, 41, 59, 0.5); border-radius: 14px; border-top-left-radius: 2px;
  display: flex; gap: 5px; margin-bottom: 10px;
  span {
    width: 6px; height: 6px; background: #94a3b8; border-radius: 50%;
    animation: ${typing} 1.4s infinite ease-in-out both;
  }
  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }
`;

// 추천 버튼 영역 스타일
const SuggestionArea = styled.div`
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.8);
  border-top: 1px solid rgba(56, 189, 248, 0.1);
  display: flex; gap: 8px; overflow-x: auto; white-space: nowrap;
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none; scrollbar-width: none;
`;

const SuggestionChip = styled.button`
  background: rgba(56, 189, 248, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8; padding: 6px 12px;
  border-radius: 20px; font-size: 14px; font-family: 'Pretendard', sans-serif;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 4px;

  &:hover {
    background: rgba(56, 189, 248, 0.2);
    border-color: #38bdf8; transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(56, 189, 248, 0.2);
  }
  &:active { transform: translateY(0); }
`;

const InputArea = styled.div`
  padding: 16px 20px; border-top: 1px solid rgba(56, 189, 248, 0.2);
  background: rgba(15, 23, 42, 0.95); display: flex; gap: 12px; align-items: center;
`;

const Input = styled.input`
  flex: 1; background: rgba(30, 41, 59, 0.6); 
  border: 1px solid rgba(71, 85, 105, 0.5); border-radius: 10px;
  padding: 14px; color: white; outline: none; font-size: 14px;
  transition: all 0.2s;
  &::placeholder { color: #64748b; font-size: 13px; }
  &:focus { 
    border-color: #38bdf8; background: rgba(15, 23, 42, 0.8); 
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2); 
  }
`;

const SendButton = styled.button`
  background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8;
  color: #38bdf8; border-radius: 10px; width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #38bdf8; color: #0f172a; transform: translateY(-1px); }
  &:disabled { border-color: #334155; color: #334155; cursor: not-allowed; background: transparent; }
`;

// -----------------------------------------------------------------------------
// [MAIN COMPONENT]
// -----------------------------------------------------------------------------

// 인터페이스 정의 (Never 타입 에러 방지)
interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
}

const FuturisticChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generic 타입 적용 <ChatMessage[]>
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "시스템 연결 완료.\n아래 추천 버튼을 눌러 빠른 진단이 가능합니다.", isBot: true }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { label: "🚨 시스템 진단", query: "현재 경고 알람 있어?" },
    { label: "📦 ABS 자재 추적", query: "ABS 재고랑 이력 알려줘" },
    { label: "📜 금일 작업", query: "오늘 전체 작업 로그 보여줘" },
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages, isTyping]);

  // 바깥 클릭 시 닫기 (Capture Phase 사용)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen]);

  // 메시지 전송 공통 로직
  const sendMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text: text, isBot: false }]);
    setIsTyping(true);

    setTimeout(() => {
      const responseText = analyzeDataAndResponse(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, isBot: true }]);
      setIsTyping(false);
    }, 600 + Math.random() * 600);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <WidgetContainer ref={containerRef}>
      <ChatWindow $isOpen={isOpen}>
        <Header>
          <h3><Cpu size={16} /> FACTORY AI <span>V2.4 ONLINE</span></h3>
          <X size={18} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)}/>
        </Header>
        
        <MessageList>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} $isBot={msg.isBot} dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>')}} />
          ))}
          {isTyping && <TypingIndicator><span></span><span></span></TypingIndicator>}
          <div ref={messagesEndRef} />
        </MessageList>

        <SuggestionArea>
          {suggestions.map((s, idx) => (
            <SuggestionChip key={idx} onClick={() => sendMessage(s.query)}>
              {s.label}
            </SuggestionChip>
          ))}
        </SuggestionArea>

        <InputArea>
          <Input 
            placeholder="명령어 또는 질문 입력..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <SendButton onClick={handleSend} disabled={isTyping}>
            <Send size={20} />
          </SendButton>
        </InputArea>
      </ChatWindow>

      <ToggleButton $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={32} /> : <MessageSquare size={30} />}
      </ToggleButton>
    </WidgetContainer>
  );
};

export default FuturisticChatbot;