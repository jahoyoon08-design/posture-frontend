import { useEffect, useState } from 'react'
import '../styles/pages.css'
import { toUsername, updateUser } from '../utils/api'

export default function Settings({ user, onUpdateUser, onLogout }) {
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  })
  const [status, setStatus] = useState('Personalize your profile and study vibe.')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm({
      displayName: user?.displayName || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    })
  }, [user])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // The backend has no username column; it is always derived from the display name.
  const username = toUsername(form.displayName)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const displayName = form.displayName.trim() || user?.displayName
    const email = form.email.trim() || user?.email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email address.')
      return
    }

    setIsSaving(true)
    try {
      const savedUser = await updateUser(user.id, {
        displayName,
        email,
        profilePictureUrl: form.avatar.trim() || undefined
      })
      onUpdateUser(savedUser)
      setStatus('Profile updated. Your next session is ready.')
    } catch (error) {
      // The backend doesn't pre-check email uniqueness on update, so Postgres's error comes through.
      setStatus(/duplicate key/i.test(error.message)
        ? 'That email is already used by another account.'
        : error.message || 'Could not save your profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
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
            <p>@{username}</p>
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
            <input type="text" value={username} readOnly disabled />
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

          <p className="settings-status">{status}</p>

          <div className="settings-actions">
            <button type="submit" className="primary-btn" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save profile'}
            </button>
            <button type="button" className="ghost-btn logout-btn" onClick={onLogout}>Log out</button>
          </div>
        </form>
      </div>
    </div>
  )
}
