import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import { recipeService } from '../services/api'
import { setRecipes, setAppliance, setCurrentPage } from '../store/slices/recipeSlice'
import '../index.css'
import '../styles/search.css'

function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAppliance, setSelectedAppliance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  const dispatch = useDispatch()
  const { recipes, appliance, currentPage, pageSize, isLoading } = useSelector(state => state.recipe)
  const { token } = useSelector(state => state.auth)

  const appliances = ['전기밥솥', '쥬서기', '믹서기', '오븐', '에어프라이어']

  useEffect(() => {
    // URL 파라미터에서 가전제품 가져오기
    const applianceParam = searchParams.get('appliance')
    if (applianceParam) {
      setSelectedAppliance(applianceParam)
      handleSearch('', applianceParam)
    }
  }, [searchParams])

  const handleSearch = async (query = searchQuery, app = selectedAppliance) => {
    if (!query && !app) {
      setError('검색어 또는 가전제품을 선택해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await recipeService.search(query, app, 10)
      dispatch(setRecipes(response.data.recipes || []))
      dispatch(setCurrentPage(1))
    } catch (err) {
      setError('검색에 실패했습니다. 다시 시도해주세요.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    handleSearch(searchQuery, selectedAppliance)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedAppliance('')
    dispatch(setRecipes([]))
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>🔍 레시피 검색</h1>
        <p>원하는 요리를 찾아보세요</p>
      </div>

      {/* 검색 폼 */}
      <div className="search-form-section">
        <div className="search-form">
          <div className="form-group">
            <label className="form-label">검색어</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="요리명, 재료 등을 입력하세요"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">가전제품</label>
            <select
              value={selectedAppliance}
              onChange={(e) => setSelectedAppliance(e.target.value)}
              className="form-select"
              disabled={loading}
            >
              <option value="">전체 선택</option>
              {appliances.map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              onClick={handleApplyFilters}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '검색 중...' : '검색'}
            </button>
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary"
              disabled={loading}
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* 빠른 선택 버튼 */}
      {!searchQuery && !selectedAppliance && (
        <div className="quick-filters">
          <p className="section-title">가전제품 선택</p>
          <div className="filter-buttons">
            {appliances.map(app => (
              <button
                key={app}
                onClick={() => {
                  setSelectedAppliance(app)
                  handleSearch(searchQuery, app)
                }}
                className="filter-button"
                disabled={loading}
              >
                {app}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      <div className="search-results">
        {recipes.length > 0 ? (
          <>
            <div className="results-header">
              <h2>검색 결과 ({recipes.length}개)</h2>
            </div>
            <div className="recipes-grid">
              {recipes.map(recipe => (
                <Link
                  key={recipe.id}
                  to={`/recipe/${recipe.id}`}
                  className="recipe-card-link"
                >
                  <div className="recipe-card">
                    <div className="recipe-header">
                      <h3>{recipe.title}</h3>
                      <span className="badge badge-appliance">{recipe.appliance}</span>
                    </div>
                    <div className="recipe-info">
                      <p className="category">{recipe.category}</p>
                      <p className="difficulty">
                        난이도: <span className="difficulty-badge">{recipe.difficultyLevel}</span>
                      </p>
                      <div className="recipe-times">
                        <span>준비: {recipe.prepTime}분</span>
                        <span>조리: {recipe.cookTime}분</span>
                        <span>인분: {recipe.servingSize}</span>
                      </div>
                    </div>
                    {recipe.description && (
                      <p className="description">{recipe.description.substring(0, 100)}...</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            {searchQuery || selectedAppliance ? (
              <>
                <p className="empty-icon">🔎</p>
                <p className="empty-message">검색 결과가 없습니다.</p>
                <p className="empty-hint">다른 검색어를 시도해보세요.</p>
              </>
            ) : (
              <>
                <p className="empty-icon">🍳</p>
                <p className="empty-message">검색을 시작해보세요!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search