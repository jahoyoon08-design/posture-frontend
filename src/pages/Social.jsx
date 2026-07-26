import { useEffect, useMemo, useState } from 'react'
import '../styles/pages.css'

const STORAGE_KEYS = {
  rooms: 'posturable-social-study-rooms',
  friends: 'posturable-social-friends',
  joined: 'posturable-social-joined-rooms'
}

const DEFAULT_ROOMS = [
  {
    id: 1,
    name: 'Finals Prep Squad',
    creator: 'Alex Chen',
    studying: 4
  },
  {
    id: 2,
    name: 'Morning Study Club',
    creator: 'Jordan Smith',
    studying: 2
  },
]

const DEFAULT_FRIENDS = [1, 2]

const readStoredArray = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function Social({ user }) {
  const [joinedRooms, setJoinedRooms] = useState(() => readStoredArray(STORAGE_KEYS.joined, []))
  const [searchTerm, setSearchTerm] = useState('')
  const [friends, setFriends] = useState(() => readStoredArray(STORAGE_KEYS.friends, DEFAULT_FRIENDS))
  const [showAllFriends, setShowAllFriends] = useState(false)
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [roomName, setRoomName] = useState('')

  const studyBuddies = [
    {
      id: 1,
      initials: 'AC',
      name: 'Alex Chen',
      status: 'Studying',
      streak: '12d',
      posture: '88',
      studyTime: '145m',
      level: 'Lvl 4',
      color: '#93c5fd'
    },
    {
      id: 2,
      initials: 'JS',
      name: 'Jordan Smith',
      status: 'Online',
      streak: '8d',
      posture: '92',
      studyTime: '98m',
      level: 'Lvl 3',
      color: '#86efac'
    },
    {
      id: 3,
      initials: 'SW',
      name: 'Sam Williams',
      status: 'Offline',
      streak: '15d',
      posture: '85',
      studyTime: '210m',
      level: 'Lvl 5',
      color: '#fed7aa'
    },
  ]

  const people = [
    { id: 4, name: 'Mina Patel', username: 'mina', role: 'Design student' },
    { id: 5, name: 'Theo Brooks', username: 'theo', role: 'Law student' },
    { id: 6, name: 'Lina Kim', username: 'lina', role: 'Engineering student' }
  ]

  const [studyRooms, setStudyRooms] = useState(() => readStoredArray(STORAGE_KEYS.rooms, DEFAULT_ROOMS))

  const leaderboard = [
    { rank: '🥇', initials: 'SW', name: 'Sam Williams', time: '210m', level: 'Lvl 5' },
    { rank: '🥈', initials: 'AC', name: 'Alex Chen', time: '145m', level: 'Lvl 4' },
    { rank: '🥉', initials: 'JS', name: 'Jordan Smith', time: '98m', level: 'Lvl 3' },
  ]

  const friendDirectory = useMemo(() => {
    const buddyEntries = studyBuddies.map((buddy) => ({
      id: buddy.id,
      name: buddy.name,
      initials: buddy.initials,
      color: buddy.color,
      meta: `${buddy.status} · ${buddy.level}`
    }))

    const peopleEntries = people.map((person) => ({
      id: person.id,
      name: person.name,
      initials: getInitials(person.name),
      color: '#cbd5e1',
      meta: person.role
    }))

    return [...buddyEntries, ...peopleEntries]
  }, [studyBuddies, people])

  const currentFriends = friendDirectory.filter((friend) => friends.includes(friend.id))
  const displayedFriends = showAllFriends ? friendDirectory : currentFriends
  const displayedRooms = showAllRooms ? studyRooms : studyRooms.slice(0, 2)
  const displayedLeaderboard = showAllLeaderboard ? leaderboard : leaderboard.slice(0, 2)
  const canExpandRooms = studyRooms.length > 2
  const canExpandLeaderboard = leaderboard.length > 2

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(studyRooms))
  }, [studyRooms])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.friends, JSON.stringify(friends))
  }, [friends])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.joined, JSON.stringify(joinedRooms))
  }, [joinedRooms])

  const toggleRoom = (roomId) => {
    setJoinedRooms(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    )
  }

  const addFriend = (friendId) => {
    setFriends(prev => prev.includes(friendId) ? prev : [...prev, friendId])
  }

  const handleCreateRoom = () => {
    if (!roomName.trim()) return

    const newRoom = {
      id: Date.now(),
      name: roomName.trim(),
      creator: user?.displayName || 'You',
      studying: 1
    }

    setStudyRooms(prev => [newRoom, ...prev])
    setRoomName('')
    setShowCreateModal(false)
  }

  const filteredPeople = searchTerm.trim()
    ? people.filter(person => {
        const haystack = `${person.name} ${person.username}`.toLowerCase()
        return haystack.includes(searchTerm.trim().toLowerCase())
      })
    : []

  return (
    <div className="page social-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
          <p className="page-title">Social</p>
        </div>
        <p className="social-subtitle">Study with friends</p>
      </div>

      <div className="social-section">
        <h3 className="section-title">Find friends</h3>

        <div className="friend-search-card">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or username"
          />

          {filteredPeople.length > 0 && (
            <div className="friend-results">
              {filteredPeople.map(person => (
                <div key={person.id} className="friend-result-row">
                  <div>
                    <div className="friend-result-name">{person.name}</div>
                    <div className="friend-result-meta">@{person.username} · {person.role}</div>
                  </div>
                  <button
                    type="button"
                    className="friend-action"
                    onClick={() => addFriend(person.id)}
                  >
                    {friends.includes(person.id) ? 'Added' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchTerm && filteredPeople.length === 0 && (
            <p className="friend-empty">No matches yet. Try another name.</p>
          )}
        </div>
      </div>

      <div className="social-section">
        <div className="section-header">
          <h3 className="section-title">Current Friends ({currentFriends.length})</h3>
        </div>

        {displayedFriends.length > 0 ? (
          <div className="current-friends-list">
            {displayedFriends.map((friend) => (
              <div key={friend.id} className="current-friend-chip">
                <div className="current-friend-main">
                  <div className="current-friend-avatar" style={{ backgroundColor: friend.color }}>
                    {friend.initials}
                  </div>
                  <div>
                    <div className="current-friend-name">{friend.name}</div>
                    <div className="current-friend-meta">{friend.meta}</div>
                  </div>
                </div>
                {!friends.includes(friend.id) && <span className="friend-not-added">Not added</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="friend-empty">No friends added yet. Search for someone above.</p>
        )}

        <div className="section-more-row">
          <button
            type="button"
            className="more-text-btn"
            onClick={() => setShowAllFriends((prev) => !prev)}
          >
            {showAllFriends ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      <div className="social-section">
        <div className="section-header">
          <h3 className="section-title">Study Rooms</h3>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>+ Create Room</button>
        </div>

        <div className="rooms-list">
          {displayedRooms.map(room => (
            <div key={room.id} className={`room-card ${joinedRooms.includes(room.id) ? 'joined' : ''}`}>
              <div className="room-info">
                <h4 className="room-name">{room.name}</h4>
                <p className="room-meta">by {room.creator} · {room.studying} studying</p>
              </div>
              <button
                className="room-btn"
                onClick={() => toggleRoom(room.id)}
              >
                {joinedRooms.includes(room.id) ? 'Joined ✓' : 'Join'}
              </button>
            </div>
          ))}
        </div>

        <div className="section-more-row">
          <button
            type="button"
            className="more-text-btn"
            onClick={() => setShowAllRooms((prev) => !prev)}
            disabled={!canExpandRooms}
          >
            {showAllRooms ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      <div className="social-section">
        <div className="section-header">
          <h3 className="section-title">Leaderboard</h3>
        </div>
        <p className="leaderboard-subtitle">This week&apos;s study time</p>

        <div className="leaderboard-list">
          {displayedLeaderboard.map((entry, idx) => (
            <div key={idx} className="leaderboard-entry">
              <div className="rank-medal">{entry.rank}</div>
              <div className="entry-avatar">{entry.initials}</div>
              <div className="entry-info">
                <div className="entry-name-row">
                  <h4 className="entry-name">{entry.name}</h4>
                  <span className="entry-level">{entry.level}</span>
                </div>
              </div>
              <div className="entry-time">{entry.time}</div>
            </div>
          ))}
        </div>

        {canExpandLeaderboard && (
          <div className="section-more-row">
            <button
              type="button"
              className="more-text-btn"
              onClick={() => setShowAllLeaderboard((prev) => !prev)}
            >
              {showAllLeaderboard ? 'Less' : 'More'}
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Create a study room</h3>
            <p>Invite friends to a focused session.</p>
            <input
              type="text"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Example: Midnight Review"
            />
            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="button" className="primary-btn" onClick={handleCreateRoom}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
