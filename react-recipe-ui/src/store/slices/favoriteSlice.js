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
    fetchStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchSuccess: (state, action) => {
      state.isLoading = false
      state.favorites = action.payload.favorites
      state.count = action.payload.count
      state.favoriteIds = new Set(action.payload.favorites.map(f => f.id))
    },
    fetchFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    addFavorite: (state, action) => {
      state.favoriteIds.add(action.payload.id)
      state.count++
    },
    removeFavorite: (state, action) => {
      state.favoriteIds.delete(action.payload.id)
      state.favorites = state.favorites.filter(f => f.id !== action.payload.id)
      state.count--
    },
    isFavorited: (state, action) => {
      return state.favoriteIds.has(action.payload)
    }
  }
})

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  addFavorite,
  removeFavorite,
  isFavorited
} = favoriteSlice.actions

export default favoriteSlice.reducer
