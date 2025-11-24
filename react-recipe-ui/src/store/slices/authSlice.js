import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isLoading: false,
  error: null,
  // ← 중요: isAuthenticated 플래그 추가
  isAuthenticated: !!localStorage.getItem('token')
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
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.isLoading = false
      state.error = null
      // ← 중요: 로그인 성공 시 isAuthenticated = true
      state.isAuthenticated = true

      // localStorage에 토큰 저장
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('refreshToken', action.payload.refreshToken)
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },

    // 로그인 실패
    loginFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
      state.user = null
      state.token = null
      state.refreshToken = null
      // ← 중요: 로그인 실패 시 isAuthenticated = false
      state.isAuthenticated = false

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },

    // 로그아웃
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isLoading = false
      state.error = null
      // ← 중요: 로그아웃 시 isAuthenticated = false
      state.isAuthenticated = false

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },

    // 토큰 갱신 성공
    refreshTokenSuccess: (state, action) => {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      // isAuthenticated는 유지 (이미 로그인 상태)

      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('refreshToken', action.payload.refreshToken)
    },

    // 토큰 갱신 실패
    refreshTokenFailure: (state) => {
      state.token = null
      state.refreshToken = null
      state.user = null
      // ← 중요: 토큰 갱신 실패 시 로그아웃 처리
      state.isAuthenticated = false

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },

    // 사용자 정보 업데이트
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      }
      localStorage.setItem('user', JSON.stringify(state.user))
    },

    // 에러 초기화
    clearError: (state) => {
      state.error = null
    },

    // localStorage에서 로드 (앱 초기화 시)
    loadFromLocalStorage: (state) => {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      const user = localStorage.getItem('user')

      if (token && refreshToken) {
        state.token = token
        state.refreshToken = refreshToken
        // ← 중요: localStorage에서 복원할 때도 isAuthenticated = true
        state.isAuthenticated = true
        if (user) {
          state.user = JSON.parse(user)
        }
      } else {
        state.isAuthenticated = false
      }
    }
  }
})

// Action creators를 export
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateUser,
  clearError,
  loadFromLocalStorage
} = authSlice.actions

// Reducer를 default export
export default authSlice.reducer