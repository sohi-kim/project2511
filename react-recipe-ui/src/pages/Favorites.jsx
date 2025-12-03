import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { favoriteService } from '../services/api'
import { setFavorites, removeFavorite } from '../store/slices/favoriteSlice'
import '../index.css'

function Favorites() {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { favorites, isLoading } = useSelector(state => state.favorite)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removeLoading, setRemoveLoading] = useState(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await favoriteService.getFavorites()
      dispatch(setFavorites(response.data.recipes || []))
    } catch (err) {
      setError('즐겨찾기를 불러올 수 없습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (recipeId) => {
    try {
      setRemoveLoading(recipeId)
      await favoriteService.removeFavorite(recipeId)
      dispatch(removeFavorite(recipeId))
    } catch (err) {
      setError('삭제에 실패했습니다.')
      console.error(err)
    } finally {
      setRemoveLoading(null)
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
    <div className="favorites-container">
      <div className="page-header">
        <h1>❤️ 즐겨찾기</h1>
        <p>저장한 레시피 목록</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {favorites.length > 0 ? (
        <>
          <div className="results-header">
            <h2>저장된 레시피 ({favorites.length}개)</h2>
          </div>

          <div className="recipes-grid">
            {favorites.map(recipe => (
              <div key={recipe.id} className="recipe-card">
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="recipe-card-link"
                >
                  <div className="recipe-content">
                    <h3>{recipe.title}</h3>
                    <span className="badge badge-appliance">{recipe.appliance}</span>
                    <p className="category">{recipe.category}</p>
                    <div className="recipe-meta">
                      <span>{recipe.difficultyLevel}</span>
                      <span>👨‍🍳 {recipe.cookTime}분</span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => handleRemoveFavorite(recipe.id)}
                  className="btn-remove-favorite"
                  disabled={removeLoading === recipe.id}
                  title="즐겨찾기 제거"
                >
                  {removeLoading === recipe.id ? '제거 중...' : '✕'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p className="empty-icon">🤍</p>
          <p className="empty-message">즐겨찾기한 레시피가 없습니다.</p>
          <Link to="/search" className="btn btn-primary">
            레시피 검색하기
          </Link>
        </div>
      )}
    </div>
  )
}

export default Favorites