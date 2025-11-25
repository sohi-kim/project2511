import {useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Search from './pages/Search'
import RecipeDetail from './pages/RecipeDetail'
import Favorites from './pages/Favorites'
import SearchHistory from './pages/SearchHistory'
import PrivateRoute from './components/PrivateRoute'
import './styles/index.css'
import { useDispatch } from 'react-redux'
import { loadFromLocalStorage } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadFromLocalStorage())
  }, [dispatch])

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* 공개 페이지 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 보호된 페이지 */}
          <Route element={<Layout />}>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="/recipe/:id" element={<PrivateRoute><RecipeDetail /></PrivateRoute>} />
            <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><SearchHistory /></PrivateRoute>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
