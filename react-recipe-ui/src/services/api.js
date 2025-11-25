import axios from 'axios'

/**
 * Axios 설정 (쿠키 기반 토큰 관리)
 * 
 * 백엔드에서 accessToken, refreshToken을 HttpOnly 쿠키로 전송
 * axios는 자동으로 쿠키를 요청에 포함시킴
 */

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  // ← 중요: 쿠키를 요청에 자동으로 포함시킬 수 있도록 설정
  withCredentials: true
})

// 요청 인터셉터
api.interceptors.request.use(
  config => {
    // 쿠키는 자동으로 포함되므로 별도 처리 불필요
    // Content-Type 설정
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  error => Promise.reject(error)
)

// 응답 인터셉터
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // 401 (Unauthorized) 에러 처리
    if (error.response?.status === 401) {
      // 이미 refresh를 시도했으면 다시 시도하지 않음
      if (originalRequest._retry) {
        // 토큰 갱신 실패 → 로그인 페이지로 리다이렉트
        window.location.href = '/login'
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        // 백엔드의 refresh 엔드포인트 호출
        // 백엔드에서 refreshToken 쿠키를 이용해 새 accessToken 발급
        await api.post('/auth/refresh')

        // 새 accessToken이 쿠키에 저장됨
        // 원본 요청 재시도
        return api(originalRequest)
      } catch (refreshError) {
        // 토큰 갱신 실패 → 로그인 페이지로 리다이렉트
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============================================================
// API 서비스 함수들
// ============================================================

// 인증 서비스
export const authService = {
  // 회원가입
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),

  // 로그인
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  // 로그아웃
  logout: () =>
    api.post('/auth/logout'),

  // 헬스 체크
  health: () =>
    api.get('/auth/health'),

  // 토큰 갱신 (쿠키 기반)
  refresh: () =>
    api.post('/auth/refresh')
}

// 레시피 서비스
export const recipeService = {
  // 레시피 검색
  search: (query, appliance, limit = 10) =>
    api.get('/recipes/search', {
      params: { query, appliance, limit }
    }),

  // 레시피 상세 조회
  getDetail: (id) =>
    api.get(`/recipes/${id}`),

  // 가전제품별 레시피 조회
  getByAppliance: (appliance) =>
    api.get(`/recipes/appliance/${appliance}`),

  // 카테고리별 레시피 조회
  getByCategory: (category) =>
    api.get(`/recipes/category/${category}`),

  // 검색 이력 조회
  getSearchHistory: () =>
    api.get('/recipes/history')
}

// 즐겨찾기 서비스
export const favoriteService = {
  // 즐겨찾기 추가
  addFavorite: (recipeId) =>
    api.post(`/favorites/${recipeId}`),

  // 즐겨찾기 제거
  removeFavorite: (recipeId) =>
    api.delete(`/favorites/${recipeId}`),

  // 즐겨찾기 목록 조회
  getFavorites: () =>
    api.get('/favorites'),

  // 특정 레시피가 즐겨찾기인지 확인
  isFavorited: (recipeId) =>
    api.get(`/favorites/check/${recipeId}`),

  // 즐겨찾기 개수 조회
  getFavoriteCount: () =>
    api.get('/favorites/count')
}

// 유틸리티 함수들
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return '오류가 발생했습니다.'
}

// 토큰 초기화 (로그아웃 시)
export const clearAuthTokens = () => {
  // 쿠키는 HttpOnly이므로 JavaScript에서 직접 삭제 불가
  // 서버의 logout 엔드포인트에서 처리됨
  localStorage.removeItem('user')
}

export default api