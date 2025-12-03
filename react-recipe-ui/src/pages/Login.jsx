import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/authSlice'
import { authService } from '../services/api'
import '../index.css'

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

      // 쿠키 기반 인증: user 정보만 Redux에 저장
      // 토큰은 서버에서 쿠키로 자동 저장됨
      dispatch(loginSuccess({
        user: {
          userId: response.data.userId,
          email: response.data.email,
          name: response.data.name
        }
        // token, refreshToken 필드 제거 ✅
        // (쿠키에서 관리됨)
      }))

      // 로그인 성공 후 홈으로 이동
      // replace: true로 설정하면 뒤로가기에서 로그인 페이지 제외
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
              required
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
              required
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