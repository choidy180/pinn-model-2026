import React, { useEffect, useState } from 'react';

interface ErrorNotifierProps {
  message: string | null;
}

/**
 * 화면 왼쪽 아래에 네트워크 에러 알림을 띄우는 컴포넌트
 */
const ErrorNotifier: React.FC<ErrorNotifierProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      // 5초 후에 자동으로 숨김
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  if (!isVisible) return null;

  // 인라인 스타일을 사용하여 왼쪽 아래에 고정
  const notifierStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    backgroundColor: '#dc3545', // 빨간색 배경
    color: 'white',
    padding: '10px 15px',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    fontSize: '14px'
  };

  return (
    <div style={notifierStyle}>
      <strong>🚨 네트워크 오류:</strong> {message}
    </div>
  );
};

export default ErrorNotifier;