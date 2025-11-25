import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { useDispatch } from 'react-redux'
import store from './store'

// Components
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Search from './pages/Search'
import RecipeDetail from './pages/RecipeDetail'
import Favorites from './pages/Favorites'
import SearchHistory from './pages/SearchHistory'

// Redux
import { loginSuccess, handleTokenExpired } from './store/slices/authSlice'
import { authService } from './services/api'

// Styles
import './styles/index.css'

/**
 * AppContent 컴포넌트
 * Provider 내부에서 Redux hook을 사용하기 위해 분리
 * 쿠키 기반 인증: 페이지 새로고침 시 세션 검증
 */
function AppContent() {
  const dispatch = useDispatch()

  // 앱 시작 시 또는 페이지 새로고침 시 세션 검증
  useEffect(() => {
    const validateSession = async () => {
      try {
        // 백엔드 헬스 체크로 쿠키 토큰 유효성 확인
        // (쿠키는 브라우저가 자동으로 요청에 포함시킴)
        const response = await authService.health()
        
        // 토큰이 유효하면 사용자 정보 복원
        if (response.data && response.data.user) {
          dispatch(loginSuccess({
            user: response.data.user
          }))
        }
      } catch (err) {
        // 쿠키가 만료되었거나 유효하지 않음
        // 상태는 기본값 유지 (로그아웃 상태)
        console.log('Session validation failed - user needs to login')
      }
    }

    // 앱 초기화 시 세션 검증
    validateSession()
  }, [dispatch])

  return (
    <Router>
      <Routes>
        {/* 공개 라우트 - 로그인/회원가입 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 보호된 라우트 */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/history" element={<SearchHistory />} />
        </Route>

        {/* 존재하지 않는 경로 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

/**
 * App 컴포넌트 (최상위)
 * Provider를 최상위에 배치하고 AppContent를 감싸기
 */
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App