import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/authSlice'
import { authService } from '../services/api'
import '../styles/index.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const response = await authService.login(
        formData.email,
        formData.password
      )

      // Redux에 로그인 정보 저장
      dispatch(loginSuccess({
        user: {
          userId: response.data.userId,
          email: response.data.email,
          name: response.data.name
        },
        token: response.data.token,
        refreshToken: response.data.refreshToken
      }))

      // Redux 상태 업데이트는 동기적이므로 즉시 navigate 가능
      // replace: true로 설정하면 뒤로가기 시 로그인 페이지로 돌아가지 않음
      navigate('/', { replace: true })
      
    } catch (err) {
      setError(
        err.response?.data?.message || 
        '로그인에 실패했습니다.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🍳 로그인</h1>
          <p>Kitchen Recipe RAG에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email" className="form-label">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="form-input"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              className="form-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-footer">
          <p>계정이 없으신가요? <Link to="/register" className="link">회원가입</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Login