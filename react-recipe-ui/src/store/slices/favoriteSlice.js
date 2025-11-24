import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  error: null,
  count: 0
}

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    // 즐겨찾기 조회 시작
    fetchStart: (state) => {
      state.isLoading = true
      state.error = null
    },

    // 즐겨찾기 조회 성공
    fetchSuccess: (state, action) => {
      state.favorites = action.payload
      state.favoriteIds = new Set(action.payload.map(f => f.id))
      state.count = action.payload.length
      state.isLoading = false
      state.error = null
    },

    // 즐겨찾기 조회 실패
    fetchFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },

    // 즐겨찾기 목록 설정
    setFavorites: (state, action) => {
      state.favorites = action.payload
      state.favoriteIds = new Set(action.payload.map(f => f.id))
      state.count = action.payload.length
      state.isLoading = false
    },

    // 즐겨찾기 추가
    addFavorite: (state, action) => {
      const recipeId = action.payload
      
      // favoriteIds Set에 추가
      if (!state.favoriteIds.has(recipeId)) {
        state.favoriteIds.add(recipeId)
        state.count += 1
      }
    },

    // 즐겨찾기 제거
    removeFavorite: (state, action) => {
      const recipeId = action.payload
      
      // favoriteIds Set에서 제거
      if (state.favoriteIds.has(recipeId)) {
        state.favoriteIds.delete(recipeId)
        state.count = Math.max(0, state.count - 1)
      }
      
      // favorites 배열에서도 제거
      state.favorites = state.favorites.filter(f => f.id !== recipeId)
    },

    // 특정 레시피가 즐겨찾기 여부 확인
    checkIsFavorited: (state, action) => {
      const recipeId = action.payload
      return state.favoriteIds.has(recipeId)
    },

    // 즐겨찾기 개수 설정
    setFavoriteCount: (state, action) => {
      state.count = action.payload
    },

    // 즐겨찾기 초기화
    clearFavorites: (state) => {
      state.favorites = []
      state.favoriteIds = new Set()
      state.count = 0
      state.isLoading = false
      state.error = null
    },

    // 에러 초기화
    clearError: (state) => {
      state.error = null
    }
  }
})

// Action creators를 export
export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  setFavorites,
  addFavorite,
  removeFavorite,
  checkIsFavorited,
  setFavoriteCount,
  clearFavorites,
  clearError
} = favoriteSlice.actions

// Reducer를 default export
export default favoriteSlice.reducer