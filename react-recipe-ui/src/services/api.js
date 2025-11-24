import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})
// axios.defaults.withCredentials = true;
// Add token to requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Handle response errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (email, password, name) =>
    apiClient.post('/auth/register', { email, password, name }),
  
  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken })
}

export const recipeService = {
  search: (query, appliance, limit = 10) =>
    apiClient.get('/recipes/search', {
      params: { query, appliance, limit }
    }),
  
  getDetail: (id) =>
    apiClient.get(`/recipes/${id}`),
  
  getByAppliance: (appliance) =>
    apiClient.get(`/recipes/appliance/${appliance}`),
  
  getByCategory: (category) =>
    apiClient.get(`/recipes/category/${category}`),
  
  getSearchHistory: () =>
    apiClient.get('/recipes/history')
}

export const favoriteService = {
  addFavorite: (recipeId) =>
    apiClient.post(`/favorites/${recipeId}`),
  
  removeFavorite: (recipeId) =>
    apiClient.delete(`/favorites/${recipeId}`),
  
  getFavorites: () =>
    apiClient.get('/favorites'),
  
  isFavorited: (recipeId) =>
    apiClient.get(`/favorites/check/${recipeId}`),
  
  getFavoriteCount: () =>
    apiClient.get('/favorites/count')
}

export default apiClient
