import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { recipeService } from '../services/api'
import { favoriteService } from '../services/api'
import { addFavorite, removeFavorite } from '../store/slices/favoriteSlice'
import '../styles/index.css'

function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { favoriteIds } = useSelector(state => state.favorite)  // Array

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    loadRecipeDetail()
  }, [id])

  // favoriteIds Array에서 현재 레시피가 즐겨찾기되었는지 확인
  useEffect(() => {
    if (recipe) {
      setIsFavorite(favoriteIds.includes(recipe.id))
    }
  }, [recipe, favoriteIds])

  const loadRecipeDetail = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await recipeService.getDetail(id)
      setRecipe(response.data)
    } catch (err) {
      setError('레시피를 불러올 수 없습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      setFavoriteLoading(true)
      if (isFavorite) {
        await favoriteService.removeFavorite(recipe.id)
        dispatch(removeFavorite(recipe.id))
        setIsFavorite(false)
      } else {
        await favoriteService.addFavorite(recipe.id)
        dispatch(addFavorite(recipe.id))
        setIsFavorite(true)
      }
    } catch (err) {
      setError('작업에 실패했습니다.')
      console.error(err)
    } finally {
      setFavoriteLoading(false)
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

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          돌아가기
        </button>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="error-container">
        <p className="error-message">레시피를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="recipe-detail-container">
      {/* 상단 정보 */}
      <div className="recipe-detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← 돌아가기
        </button>

        <div className="recipe-title-section">
          <h1>{recipe.title}</h1>
          <div className="recipe-badges">
            <span className="badge badge-appliance">{recipe.appliance}</span>
            <span className="badge badge-category">{recipe.category}</span>
            <span className="badge badge-difficulty">{recipe.difficultyLevel}</span>
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`btn-favorite ${isFavorite ? 'active' : ''}`}
          disabled={favoriteLoading}
          title={isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* 레시피 정보 */}
      <div className="recipe-detail-content">
        {/* 왼쪽: 기본 정보 */}
        <div className="recipe-info-section">
          <div className="info-box">
            <h3>요리 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>요리 타입</label>
                <p>{recipe.cuisineType || '-'}</p>
              </div>
              <div className="info-item">
                <label>준비 시간</label>
                <p>{recipe.prepTime}분</p>
              </div>
              <div className="info-item">
                <label>조리 시간</label>
                <p>{recipe.cookTime}분</p>
              </div>
              <div className="info-item">
                <label>인분</label>
                <p>{recipe.servingSize}인분</p>
              </div>
            </div>
          </div>

          {/* 설명 */}
          {recipe.description && (
            <div className="info-box">
              <h3>설명</h3>
              <p className="description-text">{recipe.description}</p>
            </div>
          )}

          {/* 재료 */}
          {recipe.ingredients && (
            <div className="info-box">
              <h3>🛒 재료</h3>
              <div className="ingredients-list">
                {recipe.ingredients.split('\n').map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    <input type="checkbox" id={`ingredient-${index}`} />
                    <label htmlFor={`ingredient-${index}`}>{ingredient.trim()}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 조리법 */}
        <div className="recipe-instructions-section">
          {recipe.instructions && (
            <div className="info-box">
              <h3>👨‍🍳 조리 방법</h3>
              <div className="instructions-list">
                {recipe.instructions.split('\n').map((instruction, index) => (
                  instruction.trim() && (
                    <div key={index} className="instruction-step">
                      <div className="step-number">{index + 1}</div>
                      <p>{instruction.trim()}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="recipe-detail-footer">
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          돌아가기
        </button>
        <button
          onClick={handleToggleFavorite}
          className={`btn ${isFavorite ? 'btn-danger' : 'btn-primary'}`}
          disabled={favoriteLoading}
        >
          {favoriteLoading ? '처리 중...' : (isFavorite ? '❤️ 즐겨찾기 제거' : '🤍 즐겨찾기 추가')}
        </button>
      </div>
    </div>
  )
}

export default RecipeDetail