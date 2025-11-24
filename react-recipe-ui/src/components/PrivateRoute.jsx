import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PrivateRoute({ children }) {
  const { token, user, isAuthenticated } = useSelector(state => state.auth)

  // 3가지 조건 모두 확인
  if (!token || !user || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
