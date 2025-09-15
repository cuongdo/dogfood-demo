import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signInWithEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signInWithEmail(email)

      if (error) {
        setError(error.message)
      } else {
        setEmailSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>Multigres Demo<br/>(TOP SECRET)</h1>
          <h2>Check Your Email</h2>
          <p className="email-sent-message">
            We've sent a magic link to <strong>{email}</strong>. 
            Click the link in your email to sign in.
          </p>
          <button 
            onClick={() => {
              setEmailSent(false)
              setEmail('')
            }}
            className="back-btn"
          >
            Try Different Email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Multigres Demo<br/>(TOP SECRET)</h1>
        <h2>Sign In with Magic Link</h2>
        <p className="login-description">
          Enter your email address and we'll send you a magic link to sign in.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email address"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading || !email} className="submit-btn">
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login