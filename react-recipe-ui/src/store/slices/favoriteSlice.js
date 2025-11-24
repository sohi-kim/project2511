import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  favorites: [],
  favoriteIds: [],  // Set 대신 Array 사용
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
      state.favoriteIds = action.payload.map(f => f.id)  // Array로 변환
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
      state.favoriteIds = action.payload.map(f => f.id)  // Array로 변환
      state.count = action.payload.length
      state.isLoading = false
    },

    // 즐겨찾기 추가
    addFavorite: (state, action) => {
      const recipeId = action.payload
      
      // favoriteIds Array에 추가 (중복 확인)
      if (!state.favoriteIds.includes(recipeId)) {
        state.favoriteIds.push(recipeId)
        state.count += 1
      }
    },

    // 즐겨찾기 제거
    removeFavorite: (state, action) => {
      const recipeId = action.payload
      
      // favoriteIds Array에서 제거
      const index = state.favoriteIds.indexOf(recipeId)
      if (index > -1) {
        state.favoriteIds.splice(index, 1)
        state.count = Math.max(0, state.count - 1)
      }
      
      // favorites 배열에서도 제거
      state.favorites = state.favorites.filter(f => f.id !== recipeId)
    },

    // 특정 레시피가 즐겨찾기 여부 확인
    checkIsFavorited: (state, action) => {
      const recipeId = action.payload
      return state.favoriteIds.includes(recipeId)
    },

    // 즐겨찾기 개수 설정
    setFavoriteCount: (state, action) => {
      state.count = action.payload
    },

    // 즐겨찾기 초기화
    clearFavorites: (state) => {
      state.favorites = []
      state.favoriteIds = []
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