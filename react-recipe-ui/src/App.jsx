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
import './index.css'

/**
 * AppContent 컴포넌트
 * Provider 내부에서 Redux hook을 사용하기 위해 분리
 * 쿠키 기반 인증: 페이지 새로고침 시 세션 검증
 */
function AppContent() {
  const dispatch = useDispatch()

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // 1) Refresh Token → AccessToken 자동 복구
        await authService.refresh()

        // 2) AccessToken 재발급 성공 → 사용자 정보 요청
        const res = await authService.me()

        if (res.data) {
          dispatch(loginSuccess({ user: res.data }))
          console.log("🔄 세션 복구 성공:", res.data)
        }
      } catch (error) {
        if (error.response?.status === 401) {
           console.log("session restore failed! (401) - login required.")
      } else {
          console.log("session failed! :", error)
      }
      }
    }

    restoreSession()
  }, [dispatch])

  return (
    <Router>
      <Routes>
        {/* 공개 라우트 */}
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

        {/* Not found → 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

// ---------------------------------------------------------------------
// App (최상위 Provider)
// ---------------------------------------------------------------------
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
