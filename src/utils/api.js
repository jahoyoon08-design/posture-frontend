// Relative by default so the Vite dev proxy and the Netlify redirect both forward to the backend.
const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }

  return data
}

// The backend has no username column, so derive one from the display name.
export const toUsername = (displayName) =>
  (displayName || '').toLowerCase().replace(/\s+/g, '') || 'student'

// Stats default to 0 so rows from older backends without these columns still render.
const fromApiStats = (row) => ({
  xp: row.xp_value ?? 0,
  level: row.user_level ?? 1,
  currentStreak: row.current_streak ?? 0,
  totalStudyTime: row.total_study_time ?? 0,
  totalSessions: row.total_sessions ?? 0,
  avgPostureScore: row.avg_posture_score ?? 0
})

// Backend rows are snake_case; the UI works with camelCase user objects.
export const fromApiUser = (apiUser) => ({
  id: apiUser.id,
  fullName: apiUser.full_name,
  displayName: apiUser.display_name,
  username: toUsername(apiUser.display_name),
  email: apiUser.email,
  avatar: apiUser.profile_picture_url || '',
  ...fromApiStats(apiUser)
})

// A friends row carries two ids: `id` is the friendship (used for DELETE),
// `friend_id` is the other user (used to match against /api/users).
export const fromApiFriend = (row) => ({
  friendshipId: row.id,
  friendId: row.friend_id,
  fullName: row.full_name,
  displayName: row.display_name,
  avatar: row.profile_picture_url || '',
  ...fromApiStats(row)
})

export const registerUser = async ({ fullName, displayName, email, password }) => {
  const data = await request('/auth/register', {
    method: 'POST',
    body: { fullName, displayName, email, password }
  })
  return fromApiUser(data.user)
}

export const loginUser = async ({ email, password }) => {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } })
  return fromApiUser(data.user)
}

// The backend lowercases email on register/login but not on update, so normalize it here
// or a mixed-case email would no longer match at login.
export const updateUser = async (userId, { displayName, email, profilePictureUrl }) => {
  const data = await request(`/users/${userId}`, {
    method: 'PUT',
    body: { displayName, email: email.trim().toLowerCase(), profilePictureUrl }
  })
  return fromApiUser(data.user)
}

export const fetchUsers = async () => {
  const users = await request('/users')
  return users.map(fromApiUser)
}

export const fetchFriends = async (userId) => {
  const rows = await request(`/friends/${userId}`)
  return rows.map(fromApiFriend)
}

export const createFriend = (userId, friendId) =>
  request('/friends', { method: 'POST', body: { userId, friendId } })

export const deleteFriend = (friendshipId) =>
  request(`/friends/${friendshipId}`, { method: 'DELETE' })
