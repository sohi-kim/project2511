import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * PrivateRoute 컴포넌트 (쿠키 기반)
 * 
 * 쿠키 기반 인증에서는:
 * - token, refreshToken은 쿠키에서 관리 (Redux에 없음)
 * - user, isAuthenticated만 Redux에서 관리
 * 
 * 따라서 user와 isAuthenticated만 확인하면 됨
 */
function PrivateRoute({ children }) {
  // token 필드 제거 (쿠키에서 관리) ✅
  const { user, isAuthenticated } = useSelector(state => state.auth)

  // 사용자 정보와 인증 플래그만 확인
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
