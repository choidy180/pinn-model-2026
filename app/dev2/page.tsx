'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, Clock, ScanBarcode, AlertCircle, 
  FileCheck, Settings, LogOut, Wrench, Activity,
  Check, Wifi, Battery, PlayCircle, ShieldCheck, FileText, 
  AlertTriangle, Camera, RefreshCw
} from 'lucide-react';

// ==================================================================================
// [STYLE] Animations
// ==================================================================================

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0px rgba(59, 130, 246, 0); border-color: #3b82f6; }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); border-color: #93c5fd; }
  100% { box-shadow: 0 0 0px rgba(59, 130, 246, 0); border-color: #3b82f6; }
`;

const scanLine = keyframes`
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`;

const blinkCursor = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const scannerMove = keyframes`
  0%, 100% { top: 5%; }
  50% { top: 95%; }
`;

const flashAnimation = keyframes`
  0% { opacity: 0; }
  10% { opacity: 1; background: white; }
  100% { opacity: 0; }
`;

// ==================================================================================
// [STYLE] Layout & Components
// ==================================================================================

const Container = styled.div`
  width: 100vw; height: 100vh; background-color: #0b0d14; color: #f8fafc;
  font-family: 'Pretendard', sans-serif; overflow: hidden; display: flex; 
  flex-direction: column; padding: 20px; box-sizing: border-box; gap: 20px;
`;

const MainContent = styled.div` flex: 1; display: flex; gap: 24px; min-height: 0; `;

const VideoPanel = styled.div`
  flex: 1.3; background-color: #11131f; border-radius: 20px; border: 4px solid #232736;
  position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
`;

const ShutterFlash = styled.div`
  position: absolute; inset: 0; pointer-events: none; z-index: 100;
  animation: ${flashAnimation} 0.2s ease-out forwards;
`;

const ReportPanel = styled.div`
  flex: 1; background-color: #141724; border-radius: 20px; border: 4px solid #232736;
  display: flex; flex-direction: column; overflow: hidden;
`;

const ReportHeader = styled.div`
  height: 90px; padding: 0 32px; border-bottom: 4px solid #232736; flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center; background: #191d2d;
`;

const ReportContent = styled.div`
  flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto;
`;

const GridRow = styled.div` 
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; flex: 1; min-height: 130px;
`;

const SectionWrapper = styled.div`
  flex: 2; display: flex; flex-direction: column; min-height: 240px;
`;

const InfoCard = styled(motion.div)<{ $highlight?: string }>`
  background: #1f2336; border: 2px solid #2f3651; padding: 24px; border-radius: 16px;
  height: 100%; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;
  h4 { font-size: 18px; color: #94a3b8; margin-bottom: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px; text-transform: uppercase; svg { width: 22px; height: 22px; } }
  p { font-size: 34px; font-weight: 900; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.5px; line-height: 1.2; }
  ${props => props.$highlight && css` p { color: ${props.$highlight}; } `}
`;

const SectionCard = styled(motion.div)<{ $active?: boolean; $completed?: boolean }>`
  background: #1f2336; border: 2px solid #2f3651; border-radius: 16px; padding: 32px; 
  position: relative; overflow: hidden; height: 100%; box-sizing: border-box; display: flex; flex-direction: column;
  ${props => props.$active && css` border-color: #3b82f6; animation: ${pulseGlow} 2s infinite; `}
  ${props => props.$completed && css` border-color: #059669; `}
`;

const PlaceholderBox = styled(motion.div)`
  height: 100%; width: 100%; background: rgba(255, 255, 255, 0.02);
  border: 3px dashed rgba(255, 255, 255, 0.1); border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #475569;
`;

const SectionTitle = styled.h3<{ $color?: string }>` 
  font-size: 26px; font-weight: 900; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; 
  color: ${props => props.$color || '#fff'}; svg { width: 34px; height: 34px; }
`;

// 이미지 수직 중앙 정렬
const ContentFlex = styled.div` 
  display: flex; gap: 24px; flex: 1; align-items: center; height: 100%;
`;

const TextContent = styled.div` 
  flex: 1; font-size: 22px; line-height: 1.7; color: #e2e8f0; font-weight: 600; 
  ul { padding-left: 0; list-style: none; margin: 0; } 
  li { margin-bottom: 12px; position: relative; padding-left: 28px; &::before { content: '•'; position: absolute; left: 0; color: #64748b; font-size: 28px; top: -5px; } }
`;

const ImagePreview = styled.div` 
  width: 240px; height: 160px; background: #0f111a; border-radius: 12px; border: 3px solid #334155; 
  overflow: hidden; position: relative; flex-shrink: 0; 
  &::after { content: ''; position: absolute; left: 0; right: 0; height: 4px; background: #3b82f6; animation: ${scanLine} 2s linear infinite; }
`;

const CapturedImage = styled.img` width: 100%; height: 100%; object-fit: cover; `;

const QRScannerOverlay = styled(motion.div)`
  position: absolute; inset: 0; margin: auto;
  width: 500px; height: 500px; border: 6px solid rgba(0, 255, 255, 0.4); border-radius: 30px; z-index: 25;
  display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  &::before { content: ''; position: absolute; top: -6px; left: -6px; right: -6px; bottom: -6px; border: 6px solid transparent; border-top-color: #00ffff; border-bottom-color: #00ffff; border-radius: 30px; animation: ${pulseGlow} 1.5s infinite; }
  &::after { content: ''; position: absolute; left: 20px; right: 20px; height: 4px; background: #ef4444; box-shadow: 0 0 20px #ef4444; animation: ${scannerMove} 2s linear infinite; }
`;

const QRStatusText = styled.div`
  position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%);
  background: #000; color: #00ffff; padding: 12px 24px; border-radius: 12px;
  font-weight: 800; font-size: 24px; white-space: nowrap; border: 2px solid #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
`;

const SubtitleOverlay = styled(motion.div)`
  position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%) !important;
  background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(12px); padding: 30px 80px; 
  border-radius: 24px; border: 2px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; z-index: 30;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); min-width: 400px;
`;
const TypewriterText = styled.span` font-size: 42px; font-weight: 900; color: #ffffff; letter-spacing: 2px; font-family: 'Pretendard', sans-serif; text-shadow: 0 4px 10px rgba(0,0,0,0.5); &::after { content: '|'; display: inline-block; margin-left: 8px; color: #3b82f6; animation: ${blinkCursor} 1s infinite; }`;

const HeaderTitle = styled.h2` font-size: 32px; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 16px; svg { color: #3b82f6; width: 40px; height: 40px; }`;
const LiveBadge = styled.span<{ $isActive?: boolean }>` background: ${props => props.$isActive ? 'rgba(37, 99, 235, 0.2)' : 'rgba(71, 85, 105, 0.2)'}; color: ${props => props.$isActive ? '#60a5fa' : '#64748b'}; border: 2px solid ${props => props.$isActive ? 'rgba(37, 99, 235, 0.4)' : 'rgba(71, 85, 105, 0.4)'}; font-size: 16px; padding: 10px 20px; border-radius: 100px; font-weight: 800; display: flex; align-items: center; gap: 10px; &::before { content: '●'; font-size: 12px; color: ${props => props.$isActive ? '#60a5fa' : '#64748b'}; } `;

// Viewer & Overlays
const ViewerContainer = styled.div` width: 100%; height: 100%; background-color: #000; position: relative; display: flex; align-items: center; justify-content: center; `;
const StyledIframe = styled.iframe` width: 100%; height: 100%; border: none; object-fit: cover; pointer-events: none; `;
const ConnectionOverlay = styled.div` position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 50%, #1e2336 0%, #0d1017 100%); color: #fff; z-index: 5; `;
const Spinner = styled.div` width: 40px; height: 40px; border: 4px solid rgba(255, 255, 255, 0.1); border-left-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; @keyframes spin { to { transform: rotate(360deg); } } `;
const CamBadge = styled.div` position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.6); color: #4ade80; padding: 8px 16px; border-radius: 20px; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 20; backdrop-filter: blur(4px); border: 1px solid rgba(74, 222, 128, 0.2); &::before { content: ''; width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 8px #4ade80; } `;
const RecordingBadge = styled.div` background: #dc2626; padding: 12px 24px; border-radius: 100px; font-size: 20px; font-weight: 800; color: white; display: flex; align-items: center; gap: 12px; &::before { content: ''; width: 14px; height: 14px; background: #fff; border-radius: 50%; animation: blink 1.5s infinite; } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } } `;
const StatusChip = styled.div` background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); border: 2px solid rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 100px; font-size: 18px; font-weight: 700; color: #e2e8f0; display: flex; align-items: center; gap: 12px; svg { width: 22px; height: 22px; } `;

// Modals
const ModalOverlay = styled(motion.div)` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; `;
const AlertModalContent = styled(motion.div)` background: #1f2336; border: 2px solid #ef4444; border-radius: 24px; padding: 40px 60px; display: flex; flex-direction: column; align-items: center; gap: 24px; box-shadow: 0 20px 60px rgba(239, 68, 68, 0.3); max-width: 500px; text-align: center; `;
const CompletionModalContent = styled(motion.div)` background: #1f2336; border: 3px solid #10b981; border-radius: 30px; padding: 60px 80px; display: flex; flex-direction: column; align-items: center; gap: 30px; box-shadow: 0 20px 80px rgba(16, 185, 129, 0.4); max-width: 600px; text-align: center; `;
const FullScreenReset = styled(motion.div)` position: fixed; inset: 0; background: #0b0d14; z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; `;
const ConfirmButton = styled.button` background: #ef4444; color: white; border: none; padding: 14px 40px; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; margin-top: 10px; transition: background 0.2s; &:hover { background: #dc2626; } `;

const StepFooter = styled.div` height: 120px; background: #141724; border-radius: 20px; border: 4px solid #232736; padding: 20px; display: flex; align-items: center; gap: 20px; flex-shrink: 0; `;
const StepItem = styled.div<{ $status: string }>` flex: 1; height: 100%; border-radius: 16px; display: flex; align-items: center; padding: 0 24px; gap: 16px; transition: all 0.3s ease; position: relative; ${props => { if (props.$status === 'completed') return css`background: rgba(16, 185, 129, 0.1); border: 3px solid #059669; color: #34d399;`; if (props.$status === 'active') return css`background: rgba(59, 130, 246, 0.1); border: 3px solid #3b82f6; color: #60a5fa; box-shadow: inset 0 0 30px rgba(59, 130, 246, 0.2);`; return css`background: #11131f; border: 3px solid #1f2336; color: #475569; opacity: 0.5;`; }} `;
const StepIconWrapper = styled.div<{ $status: string }>` width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: ${props => props.$status === 'completed' ? '#059669' : props.$status === 'active' ? '#2563eb' : '#232736'}; color: #fff; svg { width: 32px; height: 32px; } `;
const StepText = styled.div` display: flex; flex-direction: column; justify-content: center; gap: 6px; span.label { font-size: 13px; font-weight: 700; text-transform: uppercase; } span.value { font-size: 16px; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } `;

const StepPlaceholder = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <PlaceholderBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div style={{ opacity: 0.3, transform: 'scale(1.5)' }}>{icon}</div>
    <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '8px' }}>{text}</span>
  </PlaceholderBox>
);

// ==================================================================================
// COMPONENTS
// ==================================================================================

interface WearableLiveViewerProps { hosts?: string; port?: number; onConnectionChange?: (connected: boolean) => void; }
const WearableLiveViewer = ({ hosts = "10.172.167.185, 192.168.0.53", port = 8080, onConnectionChange }: WearableLiveViewerProps) => {
  const [connectedIp, setConnectedIp] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>('idle');
  const [log, setLog] = useState("시스템 대기 중...");
  const scanIps = async () => {
    if (status === 'connected') return;
    const candidateIps = hosts.split(',').map(s => s.trim()).filter(Boolean);
    if (candidateIps.length === 0) { setStatus('error'); setLog("IP 설정 없음"); onConnectionChange?.(false); return; }
    setStatus('scanning'); setLog("신호 검색 중...");
    for (const ip of candidateIps) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 1500); 
        await fetch(`http://${ip}:${port}/`, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
        clearTimeout(id); setConnectedIp(ip); setStatus('connected'); onConnectionChange?.(true); return; 
      } catch (e) { console.log(`Fail: ${ip}`); }
    }
    setStatus('error'); setLog("카메라 없음"); onConnectionChange?.(false);
  };
  useEffect(() => { scanIps(); }, [hosts]);
  return (
    <ViewerContainer>
      {status === 'connected' && connectedIp ? ( <> <StyledIframe src={`http://${connectedIp}:${port}/`} title="Wearable Feed" allowFullScreen /> <CamBadge>IP: {connectedIp}</CamBadge> </> ) : ( <ConnectionOverlay> {status === 'scanning' ? ( <> <Spinner /> <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#60a5fa' }}>SYSTEM SCANNING...</div> <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: 8 }}>{log}</div> </> ) : ( <> <PlayCircle size={60} style={{ opacity: 0.3, marginBottom: 16 }} /> <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#475569' }}>SYSTEM STANDBY</div> <button onClick={scanIps} style={{ marginTop: 20, padding: '8px 16px', background: '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>재시도</button> </> )} </ConnectionOverlay> )}
    </ViewerContainer>
  );
};

const STEPS = [
  { id: 0, label: '준비 단계', key: 'READY', icon: <ShieldCheck /> },
  { id: 1, label: '이력 확인', key: 'HISTORY', icon: <FileText /> }, 
  { id: 2, label: '작성자 확인', key: 'WRITER', icon: <User /> },
  { id: 3, label: '모델/SN 스캔', key: 'PRODUCT INFO', icon: <ScanBarcode /> },
  { id: 4, label: '불량 배출구', key: 'OUTLET', icon: <LogOut /> },
  { id: 5, label: '공정 확인', key: 'PROCESS', icon: <Settings /> },
  { id: 6, label: '불량내용 분석', key: 'DEFECT', icon: <AlertCircle /> },
  { id: 7, label: '조치내용 입력', key: 'ACTION', icon: <Wrench /> },
  { id: 8, label: '조치 완료', key: 'COMPLETE', icon: <FileCheck /> },
];

const HighVisDashboard = () => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isCamConnected, setIsCamConnected] = useState(false);
  
  const [reportDate, setReportDate] = useState("");
  const [reportTime, setReportTime] = useState("");
  const [typedText, setTypedText] = useState("");
  
  const [writerConfirmed, setWriterConfirmed] = useState(false);
  const [writerName, setWriterName] = useState("");
  
  const [scanConfirmed, setScanConfirmed] = useState(false);
  
  const [outletConfirmed, setOutletConfirmed] = useState(false);
  const [processConfirmed, setProcessConfirmed] = useState(false);

  const [isFlash, setIsFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Modal States
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const CAPTURE_IMAGE_URL = "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=400&auto=format&fit=crop";

  const resetDashboard = () => {
    setCurrentStep(0); // [MODIFIED] Reset to Step 0 (Ready)
    setReportDate(""); setReportTime(""); 
    setWriterConfirmed(false); setWriterName(""); 
    setScanConfirmed(false); 
    setOutletConfirmed(false); setProcessConfirmed(false);
    setCapturedImage(null);
    setTypedText("");
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsCamConnected(connected);
    if (!connected) { 
      setShowErrorModal(true); 
      setCurrentStep(-1); 
      setReportDate(""); setReportTime(""); 
      setWriterConfirmed(false); setWriterName(""); 
      setScanConfirmed(false); 
      setOutletConfirmed(false); setProcessConfirmed(false);
      setCapturedImage(null);
    } else {
        // [MODIFIED] Connect -> Go to Step 0
        setCurrentStep(0);
    }
  };

  // Step 1 Logic
  useEffect(() => {
    if (currentStep === 1) {
      const fullText = "불량 조치 기록";
      const now = new Date();
      setReportDate(now.toLocaleDateString('ko-KR').replace(/\.$/, '')); 
      setReportTime(now.toLocaleTimeString('ko-KR', { hour12: false })); 
      let idx = 0; setTypedText("");
      const timer = setInterval(() => {
        setTypedText(fullText.slice(0, idx + 1));
        idx++;
        if (idx === fullText.length) clearInterval(timer);
      }, 120);
      return () => clearInterval(timer);
    } else if (currentStep !== 2 && currentStep !== 4) { 
      setTypedText("");
    }
  }, [currentStep]);

  // Step 3 Auto Trigger
  useEffect(() => {
    if (currentStep === 3 && !scanConfirmed) {
      const timer = setTimeout(() => {
        setScanConfirmed(true);
        setCurrentStep(4);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, scanConfirmed]);

  // Step 6 Capture Simulation
  useEffect(() => {
    if (currentStep === 6 && !capturedImage) {
      setIsFlash(true);
      setTimeout(() => setIsFlash(false), 200);
      setCapturedImage(CAPTURE_IMAGE_URL);
    }
  }, [currentStep, capturedImage]);

  // Key Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentStep === 8) {
          setShowCompletionModal(true);
          setTimeout(() => {
            setShowCompletionModal(false);
            setShowResetModal(true);
            setTimeout(() => {
              setShowResetModal(false);
              resetDashboard();
            }, 2000);
          }, 4000);
          return;
        }

        if (currentStep === 2 && !writerConfirmed) {
          const name = "장호승";
          let idx = 0; setTypedText("");
          const timer = setInterval(() => {
            setTypedText(name.slice(0, idx + 1));
            idx++;
            if (idx === name.length) {
              clearInterval(timer);
              setTimeout(() => {
                setWriterName("장호승 / 제조2팀");
                setWriterConfirmed(true);
                setTypedText(""); 
              }, 1500);
            }
          }, 120);
          return;
        }

        if (currentStep === 4 && !outletConfirmed) {
          const text1 = "2번 배출구에서 배출됨";
          let idx = 0; setTypedText("");
          const timer1 = setInterval(() => {
            setTypedText(text1.slice(0, idx + 1));
            idx++;
            if (idx === text1.length) {
              clearInterval(timer1);
              setTimeout(() => {
                setOutletConfirmed(true);
                setTimeout(() => {
                  const text2 = "42번 공정";
                  let idx2 = 0; setTypedText(""); 
                  const timer2 = setInterval(() => {
                    setTypedText(text2.slice(0, idx2 + 1));
                    idx2++;
                    if (idx2 === text2.length) {
                      clearInterval(timer2);
                      setTimeout(() => {
                        setProcessConfirmed(true);
                        setTypedText("");
                        setCurrentStep(6);
                      }, 1000);
                    }
                  }, 120);
                }, 500);
              }, 1000);
            }
          }, 120);
          return;
        }
        
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      }
      if (e.key === 'ArrowLeft') setCurrentStep(prev => Math.max(prev - 1, -1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, writerConfirmed, outletConfirmed]); 

  const getStatus = (idx: number) => {
    if (idx < currentStep) return 'completed';
    if (idx === currentStep) return 'active';
    return 'pending';
  };

  const cardAnim = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.4 } };

  return (
    <Container>
      <AnimatePresence>
        {showErrorModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AlertModalContent initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <AlertTriangle size={64} color="#ef4444" />
              <div><h2 style={{fontSize:24, fontWeight:900, color:'#ef4444'}}>CONNECTION LOST</h2><p style={{marginTop:16, color:'#cbd5e1'}}>카메라 연결이 종료되었습니다.<br/><span style={{fontSize:14, color:'#94a3b8'}}>네트워크 상태를 확인해주세요.</span></p></div>
              <ConfirmButton onClick={() => setShowErrorModal(false)}>확인</ConfirmButton>
            </AlertModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletionModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CompletionModalContent initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <FileCheck size={100} color="#10b981" />
              <div>
                <h2 style={{fontSize:32, fontWeight:900, color:'#10b981', marginBottom:12}}>SUCCESS</h2>
                <p style={{fontSize:24, fontWeight:700, color:'#ffffff'}}>불량조치 보고서 작성이<br/>완료되었습니다.</p>
              </div>
            </CompletionModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetModal && (
          <FullScreenReset initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RefreshCw size={80} color="#3b82f6" className="animate-spin" />
            <h2 style={{fontSize:36, fontWeight:900, color:'#3b82f6', marginTop:30}}>SYSTEM INITIALIZING...</h2>
            <p style={{fontSize:20, color:'#94a3b8'}}>현재 로직을 초기화중입니다.</p>
          </FullScreenReset>
        )}
      </AnimatePresence>

      <MainContent>
        {/* VIDEO PANEL */}
        <VideoPanel>
          {isFlash && <ShutterFlash />}
          <AnimatePresence>
            {isCamConnected && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
                  <RecordingBadge>REC 촬영중</RecordingBadge>
                </motion.div>
                <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, display: 'flex', gap: 12 }}>
                  <StatusChip><Wifi size={20}/> 5G Connected</StatusChip>
                  <StatusChip><Battery size={20}/> 82%</StatusChip>
                </div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {typedText && (
              <SubtitleOverlay initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}>
                <TypewriterText>{typedText}</TypewriterText>
              </SubtitleOverlay>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {currentStep === 3 && !scanConfirmed && (
              <QRScannerOverlay initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}>
                <QRStatusText>SCANNING QR CODE...</QRStatusText>
              </QRScannerOverlay>
            )}
          </AnimatePresence>

          <WearableLiveViewer onConnectionChange={handleConnectionChange} />
        </VideoPanel>

        {/* REPORT PANEL */}
        <ReportPanel>
          <ReportHeader>
            <HeaderTitle><Activity /> 불량 조치 보고서</HeaderTitle>
            <LiveBadge $isActive={currentStep >= 0}>{currentStep === -1 ? "System Standby" : "Live Editing"}</LiveBadge>
          </ReportHeader>

          <ReportContent>
            {/* Row 1: 기본 정보 */}
            <GridRow>
                <div style={{ height:'100%' }}>
                  {currentStep >= 1 ? (
                    <InfoCard {...cardAnim}>
                      <h4><Calendar/> 작성일자</h4>
                      <p>{reportDate}</p>
                    </InfoCard>
                  ) : <StepPlaceholder icon={<Calendar size={32}/>} text="Waiting" />}
                </div>
                <div style={{ height:'100%' }}>
                  {currentStep >= 1 ? (
                    <InfoCard {...cardAnim}>
                      <h4><Clock/> 작성시간</h4>
                      <p>{reportTime}</p>
                    </InfoCard>
                  ) : <StepPlaceholder icon={<Clock size={32}/>} text="Waiting" />}
                </div>
                <div style={{ height:'100%' }}>
                  {writerConfirmed ? (
                    <InfoCard {...cardAnim} $highlight="#10b981">
                      <h4><User/> 작성자</h4>
                      <p>{writerName}</p> 
                    </InfoCard>
                  ) : <StepPlaceholder icon={<User size={32}/>} text="Pending Verification" />}
                </div>
            </GridRow>

            {/* Row 2: 제품 정보 (Step 3) */}
            <GridRow>
                {(currentStep >= 4 || scanConfirmed) ? (
                  <>
                    <div style={{ gridColumn: 'span 2', height:'100%' }}>
                      <InfoCard {...cardAnim}><h4>모델</h4><p>Drum Tub Asm</p></InfoCard>
                    </div>
                    <div style={{ height:'100%' }}>
                      <InfoCard {...cardAnim}><h4>S/N</h4><p>AJQ74873897KSD</p></InfoCard>
                    </div>
                  </>
                ) : (
                  <div style={{ gridColumn: 'span 3', height:'100%' }}>
                    <StepPlaceholder icon={<ScanBarcode size={40}/>} text="Product Scan Required" />
                  </div>
                )}
            </GridRow>

            {/* Row 3: 공정 정보 (Step 4 & 5) */}
            <GridRow>
                <div style={{ height:'100%' }}>
                   {outletConfirmed ? (
                    <InfoCard {...cardAnim} $highlight="#ef4444"><h4>불량배출구</h4><p>2번</p></InfoCard>
                   ) : <StepPlaceholder icon={<LogOut size={32}/>} text="Outlet Check" />}
                </div>
                <div style={{ gridColumn: 'span 2', height:'100%' }}>
                   {processConfirmed ? (
                    <InfoCard {...cardAnim} $highlight="#3b82f6"><h4>발생 공정/라인</h4><p>42번 공정</p></InfoCard>
                   ) : <StepPlaceholder icon={<Settings size={32}/>} text="Process Info" />}
                </div>
            </GridRow>

            {/* Section 1: 불량 내용 */}
            <SectionWrapper>
              {currentStep >= 6 ? (
                <SectionCard {...cardAnim} $active={currentStep === 6} $completed={currentStep > 6}>
                  <SectionTitle $color="#ef4444"><AlertCircle /> 불량 내용</SectionTitle>
                  <ContentFlex>
                    <TextContent>
                      <ul>
                        <li>S/N 스캔 결과 반복 불량으로 확인됨.</li>
                        <li>42번 공정 로터볼트 자동 체결 설비의 유압 문제로 체결 토크값 부족 알람 발생.</li>
                      </ul>
                    </TextContent>
                    <ImagePreview>
                      {capturedImage ? <CapturedImage src={capturedImage} alt="Snapshot" /> : null}
                    </ImagePreview>
                  </ContentFlex>
                </SectionCard>
              ) : (
                <StepPlaceholder icon={<AlertCircle size={48}/>} text="Waiting for Defect Analysis" />
              )}
            </SectionWrapper>

            {/* Section 2: 조치 내용 */}
            <SectionWrapper>
              {currentStep >= 7 ? (
                <SectionCard {...cardAnim} $active={currentStep === 7} $completed={currentStep > 7}>
                  <SectionTitle $color="#10b981"><Wrench /> 조치 내용</SectionTitle>
                  <ContentFlex>
                    <TextContent>
                      <ul>
                        <li>규정 토크렌치를 사용하여 수동 재체결 진행함 (450Nm).</li>
                        <li>체결 후 유격 확인 및 정상 가동 테스트 완료.</li>
                        <li>조치 완료까지 3분 소요.</li>
                      </ul>
                    </TextContent>
                    <ImagePreview>
                        {capturedImage ? <CapturedImage src={capturedImage} style={{filter:'grayscale(100%)'}} alt="Action" /> : null}
                    </ImagePreview>
                  </ContentFlex>
                </SectionCard>
              ) : (
                <StepPlaceholder icon={<Wrench size={48}/>} text="Waiting for Action Log" />
              )}
            </SectionWrapper>
          </ReportContent>
        </ReportPanel>
      </MainContent>

      <StepFooter>
        {STEPS.map((step, idx) => {
          const status = getStatus(idx);
          return (
            <StepItem key={step.id} $status={status}>
              <StepIconWrapper $status={status}>{step.icon}</StepIconWrapper>
              <StepText>
                <span className="label">{step.key}</span>
                <span className="value">{step.label}</span>
              </StepText>
              {status === 'completed' && <Check size={28} color="#10b981" style={{marginLeft:'auto'}}/>}
              {status === 'active' && <Activity size={28} color="#3b82f6" className={idx === 1 || (idx === 2 && !writerConfirmed && currentStep === 2) || (idx === 4 && (!outletConfirmed || !processConfirmed) && currentStep === 4) ? "animate-pulse" : "animate-spin"} style={{marginLeft:'auto'}}/>}
            </StepItem>
          )
        })}
      </StepFooter>
    </Container>
  );
};

export default HighVisDashboard;