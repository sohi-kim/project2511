import { createSlice } from '@reduxjs/toolkit'

/**
 * 완전한 쿠키 기반 인증 상태 관리
 * 
 * 토큰 관리:
 * - accessToken: HttpOnly 쿠키 (15분)
 * - refreshToken: HttpOnly 쿠키 (7일)
 * 
 * Redux 관리:
 * - user: 사용자 정보
 * - isAuthenticated: 인증 상태 플래그
 * 
 * localStorage 완전 제거 ✅
 */

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  // ← 중요: 쿠키에서 관리하므로 직접 확인 불가
  // API 호출 시 401 응답으로 토큰 만료 감지
  isAuthenticated: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그인/회원가입 시작
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },

    // 로그인/회원가입 성공
    // 백엔드에서 쿠키로 토큰 전송 (자동으로 저장됨)
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.isLoading = false
      state.error = null
      state.isAuthenticated = true

      // 사용자 정보는 Redux 상태에만 저장
      // (세션 유지가 필요하면 아래 로드 로직 참고)
    },

    // 로그인 실패
    loginFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
      state.user = null
      state.isAuthenticated = false

      // localStorage 제거 ✅
    },

    // 로그아웃
    logout: (state) => {
      state.user = null
      state.isLoading = false
      state.error = null
      state.isAuthenticated = false

      // 쿠키는 axios 인터셉터에서 서버 logout 요청으로 삭제됨
    
    },

    // 사용자 정보 업데이트
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        }
      }
    },

    // 에러 초기화
    clearError: (state) => {
      state.error = null
    },

    // 토큰 만료 또는 API 401 응답 시 호출
    // (axios 인터셉터에서 자동 호출)
    handleTokenExpired: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = '세션이 만료되었습니다. 다시 로그인해주세요.'
    },

    // 페이지 새로고침 시 인증 상태 복원
    // (쿠키는 브라우저가 자동으로 유지하므로 검증만 함)
    validateSession: (state) => {
      // 쿠키가 유효하면 사용자 정보 복원
      // (API 헬스 체크로 쿠키 유효성 확인)
      // 별도로 처리 필요하면 useEffect에서 구현
    }
  }
})

// Action creators를 export
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
  handleTokenExpired,
  validateSession
} = authSlice.actions

// Reducer를 default export
export default authSlice.reducer