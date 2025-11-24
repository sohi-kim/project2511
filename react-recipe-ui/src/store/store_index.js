import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import recipeReducer from './slices/recipeSlice'
import favoriteReducer from './slices/favoriteSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer,
    favorite: favoriteReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Set 타입을 무시 (favoriteIds)
        ignoredActions: ['favorite/setFavorites', 'favorite/addFavorite', 'favorite/removeFavorite'],
        ignoredPaths: ['favorite.favoriteIds']
      }
    })
})

export default store