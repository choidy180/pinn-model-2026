import React, { useEffect } from 'react';
import useApi from '../hooks/useApi';
import ErrorNotifier from './error-notifier';

// 응답 데이터 타입 정의
interface User {
  id: number;
  name: string;
}

interface PostResult {
  message: string;
  success: boolean;
}

// 가상 API 엔드포인트
const GET_USERS_URL = '/api/v1/users';
const CREATE_POST_URL = '/api/v1/posts';

const ApiExample: React.FC = () => {
  // 1. GET 요청 (메서드 생략: 기본값 'GET')
  // exampleFunc(url) 형태
  const { 
    data: userData, 
    isLoading: isUserLoading, 
    error: userError, 
    fetchData: fetchUsers 
  } = useApi<User[]>(GET_USERS_URL); // method 생략

  // 2. POST 요청 (메서드 명시: 'POST')
  // exampleFunc(url, "post") 형태
  const { 
    data: postData, 
    isLoading: isPostLoading, 
    error: postError, 
    fetchData: createPost 
  } = useApi<PostResult>(CREATE_POST_URL, 'POST'); // method 명시

  // 에러 메시지 통합 관리 (ErrorNotifier를 위해)
  const errorMessage = (userError || postError) 
    ? "API 호출 중 치명적인 네트워크 문제가 발생했습니다." 
    : null;

  // GET 요청 실행 (파라미터 포함)
  useEffect(() => {
    fetchUsers({ limit: 10, page: 1 }); // GET 요청 시 이 객체는 쿼리 스트링으로 변환됨
  }, [fetchUsers]);

  // POST 요청 핸들러
  const handleCreatePost = () => {
    // POST 요청 실행 (파라미터 포함)
    createPost({ title: '제목입니다', content: '내용입니다', authorId: 123 }); // POST 요청 시 이 객체는 JSON Body로 전송됨
  };

  return (
    <div>
      <h2>✨ URL 기반 API 호출 테스트</h2>
      
      {/* --- GET 요청 --- */}
      <h3>1. 사용자 목록 (GET: `useApi(url)`)</h3>
      <p>URL: **{GET_USERS_URL}**</p>
      {isUserLoading && <p>로딩 중...</p>}
      {userData && (
        <pre>{JSON.stringify(userData.slice(0, 3), null, 2)}</pre>
      )}
      
      <hr/>

      {/* --- POST 요청 --- */}
      <h3>2. 게시물 생성 (POST: `useApi(url, 'POST')`)</h3>
      <p>URL: **{CREATE_POST_URL}**</p>
      <button onClick={handleCreatePost} disabled={isPostLoading}>
        {isPostLoading ? '생성 요청 중...' : '게시물 생성 요청'}
      </button>
      {postData && (
        <div style={{ marginTop: '10px' }}>
          <p>응답 메시지: **{postData.message}**</p>
          <pre>{JSON.stringify(postData, null, 2)}</pre>
        </div>
      )}

      {/* 에러 알림 */}
      <ErrorNotifier message={errorMessage} />
    </div>
  );
};

export default ApiExample;