import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/authSlice'
import { authService } from '../services/api'
import '../index.css'

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
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

    // 유효성 검사
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setLoading(true)
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.name
      )

      // 쿠키 기반 인증: user 정보만 Redux에 저장
      // 회원 가입 후 로그인 바로 실행하지 않음.
      // dispatch(loginSuccess({
      //   user: {
      //     userId: response.data.userId,
      //     email: response.data.email,
      //     name: response.data.name
      //   }
        
      // }))

      // 회원가입 성공 후 로그인으로 이동
      // replace: true로 설정하면 뒤로가기에서 회원가입 페이지 제외
      alert('회원가입이 완료되었습니다.로그인 해주세요.')
      navigate('/login', { replace: true })
      
    } catch (err) {
      setError(
        err.response?.data?.message || 
        '회원가입에 실패했습니다.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🍳 회원가입</h1>
          <p>Kitchen Recipe RAG에 가입하세요</p>
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
            <label htmlFor="name" className="form-label">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              className="form-input"
              disabled={loading}
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
              minLength="6"
              required
            />
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
              최소 6자 이상
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              className="form-input"
              disabled={loading}
              minLength="6"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-footer">
          <p>이미 계정이 있으신가요? <Link to="/login" className="link">로그인</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register