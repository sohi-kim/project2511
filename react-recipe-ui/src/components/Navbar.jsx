import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, HeartIcon, ClockIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { logout } from '../store/slices/authSlice'
import { authService } from '../services/api'
import '../styles/navbar.css'

/**
 * Navbar 컴포넌트 (쿠키 기반)
 * 
 * 로그아웃 시:
 * 1. authService.logout() 호출 (백엔드에 로그아웃 요청)
 * 2. 백엔드: Set-Cookie로 쿠키 삭제
 * 3. Redux dispatch(logout()) (프론트 상태 초기화)
 * 4. /login으로 리다이렉트
 */
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/search', label: '검색', icon: MagnifyingGlassIcon },
    { path: '/favorites', label: '즐겨찾기', icon: HeartIcon },
    { path: '/history', label: '검색 이력', icon: ClockIcon }
  ]

  const handleLogout = async () => {
    try {
      setLoading(true)
      
      // 1️⃣ 백엔드에 로그아웃 요청
      // 백엔드에서:
      // - Set-Cookie: accessToken=; Max-Age=0 (쿠키 삭제)
      // - Set-Cookie: refreshToken=; Max-Age=0 (쿠키 삭제)
      await authService.logout()
      
      // 2️⃣ Redux 상태 초기화
      dispatch(logout())
      
      // 3️⃣ 모바일 메뉴 닫기
      setMobileMenuOpen(false)
      
      // 4️⃣ 로그인 페이지로 리다이렉트
      navigate('/login', { replace: true })
      
    } catch (err) {
      console.error('Logout failed:', err)
      
      // 로그아웃 API 실패 시에도 로컬 상태는 초기화
      // (쿠키는 이미 만료되었을 수 있음)
      dispatch(logout())
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">🍳</div>
            <span className="logo-text">Recipe RAG</span>
          </Link>

          {/* Desktop Menu */}
          <div className="navbar-menu-desktop">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <Icon className="navbar-icon" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* User Section */}
            <div className="navbar-user-section">
              <span className="navbar-username">{user?.name || '사용자'}</span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="navbar-logout-btn"
                aria-label="로그아웃"
                title={loading ? '로그아웃 중...' : '로그아웃'}
              >
                <ArrowLeftOnRectangleIcon className="navbar-icon" />
                <span>{loading ? '로그아웃 중...' : '로그아웃'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="navbar-mobile-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴"
            disabled={loading}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="navbar-icon-mobile" />
            ) : (
              <Bars3Icon className="navbar-icon-mobile" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="navbar-menu-mobile">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="navbar-mobile-logout"
              aria-label="로그아웃"
            >
              {loading ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar