import axios from 'axios'

/**
 * Axios 설정 (쿠키 기반 토큰 관리)
 * 
 * 백엔드에서 accessToken, refreshToken을 HttpOnly 쿠키로 전송
 * axios는 자동으로 쿠키를 요청에 포함시킴
 */
axios.defaults.withCredentials = true;
// Axios 인스턴스 생성
const api = axios.create({
  // baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  baseURL: 'https://nolre.shop/api',
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
  res => res,
  async error => {
    const originalRequest = error.config;

    // refresh 요청이면 retry 금지
    const isRefreshRequest = originalRequest.url.endsWith('/auth/refresh');
    if (isRefreshRequest) {
      return Promise.reject(error);
    }
     // /auth/me 은 refresh 로직 타면 안 됨
    const isMeRequest = originalRequest.url.endsWith('/auth/me');
    if (isMeRequest) {
      return Promise.reject(error);
    }

    // accessToken 만료 → refresh 시도
    if ((error.response?.status === 401 && !originalRequest._retry) || 
      (error.response?.status === 403 &&  error.response.data?.error === "INVALID_TOKEN")
     ) {
      originalRequest._retry = true;

      try {
        // refresh 요청은 헤더 제거 후 POST
        console.log("AccessToken expired → try refresh");
        await api.post('/auth/refresh', null, {
          headers: { 'Content-Type': '' } // 혹은 삭제
        });

        // originalRequest 재요청
        return api({
          ...originalRequest,
          headers: { ...(originalRequest.headers || {}) }
        });

      } catch (refreshErr) {
        // refreshToken 만료/부재 시만 로그아웃
        if (refreshErr.response?.status === 401) {
          console.log("Refresh expired → logout");
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);


// ============================================================
// API 서비스 함수들
// ============================================================

// 인증 서비스
export const authService = {
  // 사용자 정보 조회
  me: () =>
    api.get('/auth/me'),
  
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


// 관리자 서비스
export const adminService = {
  addCookBook: (formData) =>
    api.post(`/admin/upload`,formData,{
      headers: { "Content-Type": "multipart/form-data" }
    }),
  getProducts: (category) => {
    return api.get(`/admin/products?category=${category}`)
  }   
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