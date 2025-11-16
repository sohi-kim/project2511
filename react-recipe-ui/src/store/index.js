import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import recipeReducer from './slices/recipeSlice'
import favoriteReducer from './slices/favoriteSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer,
    favorite: favoriteReducer
  }
})

export default store
