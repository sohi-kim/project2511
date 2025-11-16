import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  recipes: [],
  currentRecipe: null,
  searchQuery: '',
  appliance: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10
}

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    searchStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    searchSuccess: (state, action) => {
      state.isLoading = false
      state.recipes = action.payload.recipes
      state.totalCount = action.payload.totalCount
      state.searchQuery = action.payload.query
    },
    searchFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    setRecipe: (state, action) => {
      state.currentRecipe = action.payload
    },
    setAppliance: (state, action) => {
      state.appliance = action.payload
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    clearRecipes: (state) => {
      state.recipes = []
      state.currentRecipe = null
      state.searchQuery = ''
    }
  }
})

export const {
  searchStart,
  searchSuccess,
  searchFailure,
  setRecipe,
  setAppliance,
  setCurrentPage,
  clearRecipes
} = recipeSlice.actions

export default recipeSlice.reducer
