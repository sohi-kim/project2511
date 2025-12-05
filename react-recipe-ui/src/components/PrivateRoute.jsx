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
  const { user, isAuthenticated, isLoading } = useSelector(state => state.auth)

   // 1) 로딩 중이면 아직 인증 체크하지 않음.  # Ctrl+F5 시 Redux auth state 초기화 문제해결
  if (isLoading) return <div>Loading...</div>;

  // 2) 인증 실패 → 로그인 페이지 이동
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  return children
}

export default PrivateRoute
/*
Ctrl+F5 ➡ React 초기화 ➡ /auth/me 요청 ➡ 타이밍 문제로 401 발생 (혹은 아직 인증 필터가 준비 전)
➡인터셉터: "어, accessToken 만료?" → refresh 호출 ➡ refresh 성공 ➡인터셉터가 /auth/me 를 다시 실행해주지 않음
➡user 상태 null ➡ React Router: "user 없음 → 로그인 페이지로 이동"

*/