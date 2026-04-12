import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/ign_logo_wht.png'

const Auth = () => {
  const [mode, setMode] = useState(null) // 'user' or 'admin'
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error: loginError } = await login(email, password)

        if (loginError) {
          throw loginError
        }

        //stop loading immediately
        setLoading(false)
      } else {
        const { error: signupError } = await signup(email, password)
        if (signupError) throw signupError
        alert('Signup successful! Check your email for verification if required, then log in.')
        setIsLogin(true)
        setLoading(false)
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <img src={logo} alt="Ignition Logo" className="w-32 mb-8" />
        <h1 className="text-2xl font-bold mb-8 tracking-widest text-center">IGNITION INVENTORY</h1>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => { setMode('admin'); setIsLogin(true); }}
            className="btn-secondary w-full"
          >
            LOGIN AS ADMIN
          </button>
          <button
            onClick={() => setMode('user')}
            className="btn-secondary w-full"
          >
            LOGIN AS USER
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
      <div className="w-full max-w-xs">
        <button
          onClick={() => setMode(null)}
          className="text-xs mb-8 flex items-center gap-1 hover:underline uppercase tracking-tighter"
        >
          ← BACK
        </button>
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="Ignition Logo" className="w-16 mb-4 invert" />
          <h2 className="text-xl font-bold tracking-widest text-center uppercase">
            {mode === 'admin' ? 'Admin Access' : 'User Access'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </button>

          {error && <p className="text-red-600 text-xs mt-2 uppercase text-center font-medium">{error}</p>}
        </form>

        {mode === 'user' && (
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            disabled={loading}
            className="w-full text-xs mt-6 underline uppercase tracking-tighter text-center opacity-60 hover:opacity-100 disabled:opacity-30"
          >
            {isLogin ? 'NO ACCOUNT? SIGN UP' : 'HAVE AN ACCOUNT? LOGIN'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Auth
