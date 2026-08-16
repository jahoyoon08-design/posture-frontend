import { useEffect, useState } from 'react'
import '../styles/pages.css'

export default function Settings({ user, onUpdateUser, onLogout }) {
  const [form, setForm] = useState({
    displayName: user?.displayName || 'Ava',
    username: user?.username || 'ava',
    email: user?.email || 'ava@posturable.app',
    password: '',
    confirmPassword: '',
    avatar: user?.avatar || ''
  })
  const [status, setStatus] = useState('Personalize your profile and study vibe.')

  useEffect(() => {
    setForm({
      displayName: user?.displayName || 'Ava',
      username: user?.username || 'ava',
      email: user?.email || 'ava@posturable.app',
      password: '',
      confirmPassword: '',
      avatar: user?.avatar || ''
    })
  }, [user])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (form.password && form.password !== form.confirmPassword) {
      setStatus('Passwords do not match. Please try again.')
      return
    }

    const nextUser = {
      ...user,
      displayName: form.displayName.trim() || user?.displayName || 'Student',
      username: form.username.trim() || user?.username || 'student',
      email: form.email.trim() || user?.email || 'student@posturable.app',
      avatar: form.avatar.trim() || user?.avatar || '',
      password: form.password || user?.password || ''
    }

    onUpdateUser(nextUser)
    window.localStorage.setItem('posturable-user', JSON.stringify(nextUser))
    setStatus('Profile updated. Your next session is ready.')
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
          <p className="page-title">Profile & Settings</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="profile-preview-card">
          <div className="avatar-preview" style={{ backgroundImage: form.avatar ? `url(${form.avatar})` : undefined }}>
            {!form.avatar && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"></path>
              </svg>
            )}
          </div>
          <div>
            <h2>{form.displayName || 'Your name'}</h2>
            <p>@{form.username || 'username'}</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label>
            Display name
            <input
              type="text"
              value={form.displayName}
              onChange={(event) => handleChange('displayName', event.target.value)}
            />
          </label>

          <label>
            Username
            <input
              type="text"
              value={form.username}
              onChange={(event) => handleChange('username', event.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
            />
          </label>

          <label>
            Profile picture URL
            <input
              type="url"
              value={form.avatar}
              placeholder="https://images.unsplash.com/..."
              onChange={(event) => handleChange('avatar', event.target.value)}
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={form.password}
              placeholder="Leave blank to keep current"
              onChange={(event) => handleChange('password', event.target.value)}
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => handleChange('confirmPassword', event.target.value)}
            />
          </label>

          <p className="settings-status">{status}</p>

          <div className="settings-actions">
            <button type="submit" className="primary-btn">Save profile</button>
            <button type="button" className="ghost-btn logout-btn" onClick={onLogout}>Log out</button>
          </div>
        </form>
      </div>
    </div>
  )
}
