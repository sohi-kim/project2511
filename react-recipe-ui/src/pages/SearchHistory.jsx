import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { recipeService } from '../services/api'
import '../index.css'

function SearchHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSearchHistory()
  }, [])

  const loadSearchHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await recipeService.getSearchHistory()
      setHistory(response.data.history || [])
    } catch (err) {
      setError('검색 이력을 불러올 수 없습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    navigate(`/search?query=${encodeURIComponent(query)}`)
  }

  const handleClearHistory = async () => {
    if (window.confirm('검색 이력을 모두 삭제하시겠습니까?')) {
      try {
        setHistory([])
        // 실제로는 API 호출 필요
      } catch (err) {
        setError('삭제에 실패했습니다.')
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="search-history-container">
      <div className="page-header">
        <h1>🕐 검색 이력</h1>
        <p>최근 검색한 레시피들</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {history.length > 0 ? (
        <>
          <div className="history-header">
            <h2>검색 이력 ({history.length}개)</h2>
            <button
              onClick={handleClearHistory}
              className="btn btn-secondary btn-sm"
            >
              모두 삭제
            </button>
          </div>

          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-content">
                  <div className="history-query">
                    <h3>{item.query}</h3>
                    <span className="result-count">검색 결과: {item.resultCount || 0}개</span>
                  </div>
                  <p className="history-date">
                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <button
                  onClick={() => handleSearch(item.query)}
                  className="btn btn-primary btn-sm"
                >
                  다시 검색
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p className="empty-icon">🔎</p>
          <p className="empty-message">검색 이력이 없습니다.</p>
          <button
            onClick={() => navigate('/search')}
            className="btn btn-primary"
          >
            레시피 검색하기
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchHistory