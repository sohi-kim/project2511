import React from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline'

function Home() {
  const appliances = [
    { name: '전기밥솥', icon: '🍚', description: '밥 요리 레시피' },
    { name: '쥬서기', icon: '🧃', description: '음료 레시피' },
    { name: '믹서기', icon: '🥤', description: '스무디 레시피' },
    { name: '오븐', icon: '🍰', description: '구우 요리' },
    { name: '전자레인지', icon: '⏱️', description: '간편 요리' },
    { name: '에어프라이어', icon: '🍟', description: '튀김 요리' }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-12">
        <h1 className="text-4xl font-bold mb-4">주방가전별 요리 검색</h1>
        <p className="text-lg mb-6 opacity-90">AI 기반 RAG 시스템으로 당신에게 맞는 레시피를 찾아보세요</p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          지금 검색하기
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <MagnifyingGlassIcon className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">스마트 검색</h3>
          <p className="text-gray-600">AI 기반 자연언어 처리로 정확한 레시피를 찾습니다</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <HeartIcon className="w-12 h-12 text-red-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">즐겨찾기</h3>
          <p className="text-gray-600">마음에 드는 레시피를 저장하고 언제든 접근하세요</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <ClockIcon className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">검색 이력</h3>
          <p className="text-gray-600">이전에 검색한 내용을 빠르게 확인합니다</p>
        </div>
      </div>

      {/* Appliances */}
      <div>
        <h2 className="text-2xl font-bold mb-6">가전제품별 요리</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {appliances.map((appliance) => (
            <Link
              key={appliance.name}
              to={`/search?appliance=${encodeURIComponent(appliance.name)}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all text-center"
            >
              <div className="text-4xl mb-3">{appliance.icon}</div>
              <h3 className="font-semibold text-sm">{appliance.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{appliance.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
