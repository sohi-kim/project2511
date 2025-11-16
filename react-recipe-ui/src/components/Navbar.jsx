import React from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon, MagnifyingGlassIcon, HeartIcon, ClockIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

function Navbar({ onLogout, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🍳</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Recipe RAG</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span>검색</span>
            </Link>
            <Link to="/favorites" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <HeartIcon className="w-5 h-5" />
              <span>즐겨찾기</span>
            </Link>
            <Link to="/history" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <ClockIcon className="w-5 h-5" />
              <span>검색 이력</span>
            </Link>
            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/search" className="block px-4 py-2 hover:bg-gray-100">검색</Link>
            <Link to="/favorites" className="block px-4 py-2 hover:bg-gray-100">즐겨찾기</Link>
            <Link to="/history" className="block px-4 py-2 hover:bg-gray-100">검색 이력</Link>
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
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
