import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Study from './pages/Study'
import Stats from './pages/Stats'
import Stretches from './pages/Stretches'
import Social from './pages/Social'
import Settings from './pages/Settings'
import studyIcon from './assets/study icon.png'
import stretchIcon from './assets/stretch-icon.png'
import { MdHome, MdMenuBook, MdBarChart, MdFitnessCenter, MdPeople } from 'react-icons/md'
import { POSTURE_SCORE_STORAGE_KEY, POSTURE_SCORE_DATE_STORAGE_KEY } from './pages/Study'
import { resetHomeStats, resetLevelProgress, resetDailyHistory } from './utils/homeStats'
import { loginUser, registerUser } from './utils/api'

const readSavedUser = () => {
  try {
    const savedUser = JSON.parse(window.localStorage.getItem('posturable-user'))
    // Accounts saved before the backend existed have no numeric id and can't call the API.
    return Number.isInteger(savedUser?.id) ? savedUser : null
  } catch {
    return null
  }
}

const PAGE_PATHS = {
  home: '/',
  study: '/study',
  stats: '/stats',
  stretches: '/stretches',
  social: '/social',
  settings: '/settings'
}

const pageFromPath = (pathname) =>
  Object.keys(PAGE_PATHS).find((page) => PAGE_PATHS[page] === pathname)

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  // The URL is the source of truth for the current page so it survives a refresh.
  const currentPage = pageFromPath(location.pathname)
  const setCurrentPage = (page) => navigate(PAGE_PATHS[page])
  const [user, setUser] = useState(readSavedUser)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return user !== null && window.localStorage.getItem('posturable-auth') === 'true'
    } catch {
      return false
    }
  })
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [authError, setAuthError] = useState('')
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)

  useEffect(() => {
    window.localStorage.setItem('posturable-user', JSON.stringify(user))
    window.localStorage.setItem('posturable-auth', String(isAuthenticated))
  }, [user, isAuthenticated])

  const handleAuthChange = (field, value) => {
    setAuthForm(prev => ({ ...prev, [field]: value }))
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const isStrongPassword = (password) =>
    password.length >= 6 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    if (authMode === 'signup') {
      if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password || !authForm.confirmPassword) {
        setAuthError('Please fill in all fields.')
        return
      }

      if (!isValidEmail(authForm.email.trim())) {
        setAuthError('Please enter a valid email address.')
        return
      }

      if (!isStrongPassword(authForm.password)) {
        setAuthError('Password must be at least 6 characters and include a letter, a number, and a symbol.')
        return
      }

      if (authForm.password !== authForm.confirmPassword) {
        setAuthError('Passwords do not match.')
        return
      }
    } else {
      if (!authForm.email.trim() || !authForm.password) {
        setAuthError('Please enter your email and password.')
        return
      }

      if (!isValidEmail(authForm.email.trim())) {
        setAuthError('Please enter a valid email address.')
        return
      }
    }

    let authenticatedUser
    setIsSubmittingAuth(true)
    try {
      if (authMode === 'signup') {
        const name = authForm.name.trim()
        authenticatedUser = await registerUser({
          fullName: name,
          displayName: name,
          email: authForm.email.trim(),
          password: authForm.password
        })
      } else {
        authenticatedUser = await loginUser({
          email: authForm.email.trim(),
          password: authForm.password
        })
      }
    } catch (error) {
      setAuthError(error.message || 'Something went wrong. Please try again.')
      return
    } finally {
      setIsSubmittingAuth(false)
    }

    if (authMode === 'signup') {
      // Brand-new account: start with no logged posture score and all
      // weekly stats/level progress/daily history at 0, rather than
      // inheriting any previous data.
      window.localStorage.removeItem(POSTURE_SCORE_STORAGE_KEY)
      window.localStorage.removeItem(POSTURE_SCORE_DATE_STORAGE_KEY)
      resetHomeStats()
      resetLevelProgress()
      resetDailyHistory()
    }

    setUser(authenticatedUser)
    setIsAuthenticated(true)
    setCurrentPage('home')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage('home')
    setAuthForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setAuthError('')
  }

  // Study keeps its own live camera/timer session, so it stays mounted (just hidden)
  // instead of unmounting like the other pages, which is why it isn't included here.
  const renderOtherPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home user={user} onOpenSettings={() => setCurrentPage('settings')} />
      case 'stats':
        return <Stats />
      case 'stretches':
        return <Stretches />
      case 'social':
        return <Social user={user} />
      case 'settings':
        return <Settings user={user} onUpdateUser={setUser} onLogout={handleLogout} />
      default:
        return null
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Better posture, calmer focus</p>
            <h1>Posturable</h1>
            <p>Log in or create your account to start your study flow.</p>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'signup' && (
              <label>
                Full name
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(event) => handleAuthChange('name', event.target.value)}
                  placeholder="Your name"
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => handleAuthChange('email', event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => handleAuthChange('password', event.target.value)}
                placeholder="At least 6 characters, with a letter, number & symbol"
              />
            </label>

            {authMode === 'signup' && (
              <label>
                Confirm password
                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(event) => handleAuthChange('confirmPassword', event.target.value)}
                  placeholder="Re-enter password"
                />
              </label>
            )}

            <button type="submit" className="primary-btn auth-submit" disabled={isSubmittingAuth}>
              {isSubmittingAuth ? 'Please wait…' : authMode === 'login' ? 'Log in' : 'Create account'}
            </button>

            {authError && <p className="auth-error">{authError}</p>}
          </form>

          <div className="auth-switch-row">
            <span>{authMode === 'login' ? 'New here?' : 'Already have an account?'}</span>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
                setAuthError('')
              }}
            >
              {authMode === 'login' ? 'Create account' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPage) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="app-container">
      <main className="app-content">
        <div style={{ display: currentPage === 'study' ? 'contents' : 'none' }}>
          <Study />
        </div>
        {currentPage !== 'study' && renderOtherPage()}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
          title="Home"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11L12 3l9 8" />
            <path d="M5 11v8h5v-5h4v5h5v-8" />
          </svg>
          <span>Home</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'study' ? 'active' : ''}`}
          onClick={() => setCurrentPage('study')}
          title="Study"
        >
          <img src={studyIcon} alt="Study" className="nav-icon-image" />
          <span>Study</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentPage('stats')}
          title="Stats"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19h16" />
            <path d="M7 14v5" />
            <path d="M12 10v9" />
            <path d="M17 7v12" />
          </svg>
          <span>Stats</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'stretches' ? 'active' : ''}`}
          onClick={() => setCurrentPage('stretches')}
          title="Stretches"
        >
          <img src={stretchIcon} alt="Stretch" className="nav-icon-image" />
          <span>Stretch</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'social' ? 'active' : ''}`}
          onClick={() => setCurrentPage('social')}
          title="Social"
        >
          <MdPeople className="nav-icon" size={24} aria-hidden="true" />
          <span>Social</span>
        </button>

        <button
          className={`nav-item profile-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentPage('settings')}
          title="Settings"
        >
          <span className="profile-nav-icon">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.displayName ? `${user.displayName} profile` : 'Profile'}
                className="profile-nav-avatar"
              />
            ) : (
              <span className="profile-nav-fallback">
                {(user?.displayName || 'U')[0].toUpperCase()}
              </span>
            )}
          </span>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  )
}

export default App
