import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { MagnifyingGlassIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline'
import '../styles/home.css'

function Home() {
  const { user } = useSelector(state => state.auth)
  const { count: favoriteCount } = useSelector(state => state.favorite)

  const appliances = [
    { name: '전기밥솥', icon: '🍚', description: '밥 요리' },
    { name: '쥬서기', icon: '🧃', description: '음료' },
    { name: '믹서기', icon: '🥤', description: '스무디' },
    { name: '오븐', icon: '🍰', description: '구우 요리' },
    { name: '전자레인지', icon: '⏱️', description: '간편 요리' },
    { name: '에어프라이어', icon: '🍟', description: '튀김' }
  ]

  const features = [
    {
      title: '스마트 검색',
      description: 'AI 기반 자연언어 처리로 정확한 레시피를 찾습니다',
      icon: 'search',
      component: (
        <MagnifyingGlassIcon className="w-12 h-12" />
      )
    },
    {
      title: '즐겨찾기',
      description: '마음에 드는 레시피를 저장하고 언제든 접근하세요',
      icon: 'heart',
      component: (
        <HeartIcon className="w-12 h-12" />
      )
    },
    {
      title: '검색 이력',
      description: '이전에 검색한 내용을 빠르게 확인합니다',
      icon: 'clock',
      component: (
        <ClockIcon className="w-12 h-12" />
      )
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            🍳 주방가전별 요리 검색
          </h1>
          <p className="hero-subtitle">
            AI 기반 RAG 시스템으로 당신에게 맞는 레시피를 찾아보세요
          </p>
          {user && (
            <p style={{ 
              fontSize: '0.95rem', 
              marginBottom: '1rem',
              opacity: 0.95
            }}>
              안녕하세요, <strong>{user.name}</strong>님! 👋
            </p>
          )}
          <Link
            to="/search"
            className="hero-button"
          >
            <MagnifyingGlassIcon style={{ width: '20px', height: '20px' }} />
            지금 검색하기
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: '#dbeafe',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '0.875rem',
            color: '#1e40af',
            marginBottom: '0.5rem'
          }}>
            즐겨찾기
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1e40af'
          }}>
            {favoriteCount}
          </p>
        </div>
        <div style={{
          background: '#fee2e2',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#991b1b',
            marginBottom: '0.5rem'
          }}>
            가전제품
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#991b1b'
          }}>
            {appliances.length}
          </p>
        </div>
        <div style={{
          background: '#dcfce7',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#166534',
            marginBottom: '0.5rem'
          }}>
            기능
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#166534'
          }}>
            3
          </p>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: '#1f2937'
        }}>
          주요 기능
        </h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`feature-icon ${feature.icon}`}>
                {feature.component}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Appliances */}
      <div className="appliances-section">
        <h2 className="section-title">가전제품별 요리</h2>
        <div className="appliances-grid">
          {appliances.map((appliance) => (
            <Link
              key={appliance.name}
              to={`/search?appliance=${encodeURIComponent(appliance.name)}`}
              className="appliance-card"
            >
              <div className="appliance-icon">{appliance.icon}</div>
              <h3 className="appliance-name">{appliance.name}</h3>
              <p className="appliance-description">{appliance.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '3rem',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          지금 바로 시작하세요! 🚀
        </h2>
        <p style={{
          fontSize: '1rem',
          marginBottom: '1.5rem',
          opacity: 0.9
        }}>
          원하는 가전제품을 선택하고 맛있는 레시피를 찾아보세요.
        </p>
        <Link
          to="/search"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#667eea',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          레시피 검색하기 →
        </Link>
      </div>

      {/* Info Section */}
      <div style={{
        background: '#f9fafb',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          💡 팁
        </h3>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          <li style={{
            padding: '0.5rem 0',
            color: '#6b7280',
            fontSize: '0.95rem'
          }}>
            ✓ 원하는 가전제품을 선택하여 관련 레시피를 검색하세요.
          </li>
          <li style={{
            padding: '0.5rem 0',
            color: '#6b7280',
            fontSize: '0.95rem'
          }}>
            ✓ 마음에 드는 레시피는 즐겨찾기에 저장할 수 있습니다.
          </li>
          <li style={{
            padding: '0.5rem 0',
            color: '#6b7280',
            fontSize: '0.95rem'
          }}>
            ✓ 검색 이력에서 이전 검색 내용을 다시 확인할 수 있습니다.
          </li>
          <li style={{
            padding: '0.5rem 0',
            color: '#6b7280',
            fontSize: '0.95rem'
          }}>
            ✓ 자연어로 검색하면 AI가 관련 레시피를 찾아줍니다.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Home