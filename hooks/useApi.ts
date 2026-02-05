import { useState, useCallback } from 'react';

// 타입 정의
type HttpMethod = 'GET' | 'POST';
type Params = Record<string, any>; 
type UseApiResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  // fetchData의 body 파라미터는 선택적입니다.
  fetchData: (body?: Params) => Promise<boolean>; 
};

// 재시도 관련 상수
const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 3000;

/**
 * URL만 필수로 받고, HTTP 메서드와 파라미터를 선택적으로 처리하는 커스텀 훅
 * @param url - 호출할 API 엔드포인트 URL (필수)
 * @param method - HTTP 요청 메서드 ('GET' 또는 'POST'). 기본값은 'GET'입니다.
 * @returns {UseApiResult<T>}
 */
function useApi<T = any>(url: string, method: HttpMethod = 'GET'): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // body는 GET일 때는 쿼리 파라미터로, POST일 때는 JSON body로 사용됩니다.
  const fetchData = useCallback(async (body: Params = {}): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    let attempt = 0;

    const executeFetch = async (): Promise<boolean> => {
      let fullUrl = url;
      let options: RequestInit = { method };
      const hasBody = Object.keys(body).length > 0;

      try {
        if (method.toUpperCase() === 'GET') {
          // GET 요청: body는 쿼리 파라미터로 변환하여 URL에 추가
          if (hasBody) {
            const query = new URLSearchParams(body).toString();
            fullUrl = `${url}?${query}`;
          }
        } else if (method.toUpperCase() === 'POST') {
          // POST 요청: body는 JSON 형태로 전송
          if (hasBody) {
            options.headers = {
              'Content-Type': 'application/json',
            };
            options.body = JSON.stringify(body);
          }
        } else {
          throw new Error(`지원하지 않는 HTTP 메서드: ${method}`);
        }

        const response = await fetch(fullUrl, options);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const result: T = await response.json(); 
        setData(result);
        setIsLoading(false);
        return true; 
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          attempt++;
          console.warn(`API 호출 실패 (재시도 ${attempt}/${MAX_RETRIES}): ${url}`, (err as Error).message);
          return new Promise((resolve) => {
            setTimeout(() => resolve(executeFetch()), RETRY_INTERVAL_MS);
          });
        } else {
          setError(err as Error);
          setIsLoading(false);
          return false; 
        }
      }
    };

    return await executeFetch();
  }, [url, method]); // 의존성 배열에 url과 method 포함

  return { data, isLoading, error, fetchData };
}

export default useApi;