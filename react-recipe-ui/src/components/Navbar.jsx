import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, HeartIcon, ClockIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import '../styles/navbar.css'

function Navbar({ onLogout, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/search', label: '검색', icon: MagnifyingGlassIcon },
    { path: '/favorites', label: '즐겨찾기', icon: HeartIcon },
    { path: '/history', label: '검색 이력', icon: ClockIcon }
  ]

  const handleLogout = () => {
    setMobileMenuOpen(false)
    onLogout()
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
                onClick={onLogout}
                className="navbar-logout-btn"
                aria-label="로그아웃"
              >
                <ArrowLeftOnRectangleIcon className="navbar-icon" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="navbar-mobile-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴"
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
              className="navbar-mobile-logout"
              aria-label="로그아웃"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar