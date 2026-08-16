import { useEffect, useMemo, useRef, useState } from 'react'
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
    studying: 4,
    participants: [
      { name: 'Alex Chen', posture: '88', status: 'Studying', studyTime: '145m' },
      { name: 'Jordan Smith', posture: '92', status: 'Online', studyTime: '98m' },
      { name: 'Sam Williams', posture: '85', status: 'Studying', studyTime: '210m' },
      { name: 'You', posture: '0', status: 'Online', studyTime: '0m' }
    ]
  },
  {
    id: 2,
    name: 'Morning Study Club',
    creator: 'Jordan Smith',
    studying: 2,
    participants: [
      { name: 'Jordan Smith', posture: '92', status: 'Online', studyTime: '98m' },
      { name: 'Mina Patel', posture: '86', status: 'Studying', studyTime: '64m' },
      { name: 'You', posture: '0', status: 'Online', studyTime: '0m' }
    ]
  },
]

const DEFAULT_FRIENDS = []
const LEGACY_DEFAULT_FRIEND_IDS = [1, 2]

const readStoredArray = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed.filter((value) => value !== null && value !== undefined)

    if (
      normalized.length === LEGACY_DEFAULT_FRIEND_IDS.length &&
      normalized.every((value) => LEGACY_DEFAULT_FRIEND_IDS.includes(Number(value)))
    ) {
      return fallback
    }

    return normalized
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

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEYS.friends)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      const isLegacyDefault = Array.isArray(parsed)
        && parsed.length === LEGACY_DEFAULT_FRIEND_IDS.length
        && parsed.every((value) => LEGACY_DEFAULT_FRIEND_IDS.includes(Number(value)))

      if (isLegacyDefault) {
        setFriends(DEFAULT_FRIENDS)
        window.localStorage.setItem(STORAGE_KEYS.friends, JSON.stringify(DEFAULT_FRIENDS))
      }
    } catch {
      // Ignore corrupted localStorage values and keep the empty default state.
    }
  }, [])

  const [showAllFriends, setShowAllFriends] = useState(false)
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [roomMembersModal, setRoomMembersModal] = useState(null)
  const [roomPreviewModal, setRoomPreviewModal] = useState(null)
  const [roomName, setRoomName] = useState('')
  const roomVideoRef = useRef(null)

  const studyBuddies = [
    {
      id: 1,
      initials: 'AC',
      name: 'Alex Chen',
      status: 'Online',
      inStudyRoom: true,
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
      inStudyRoom: false,
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
      inStudyRoom: false,
      streak: '15d',
      posture: '85',
      studyTime: '210m',
      level: 'Lvl 5',
      color: '#fed7aa'
    },
  ]

  const people = [
    { id: 4, name: 'Maya Chen', username: 'maya', level: 'Lvl 4', status: 'Online' },
    { id: 5, name: 'Mina Patel', username: 'mina', level: 'Lvl 3', status: 'Online' },
    { id: 6, name: 'Theo Brooks', username: 'theo', level: 'Lvl 2', status: 'Offline' },
    { id: 7, name: 'Lina Kim', username: 'lina', level: 'Lvl 4', status: 'Online' }
  ]

  const [studyRooms, setStudyRooms] = useState(() => readStoredArray(STORAGE_KEYS.rooms, DEFAULT_ROOMS))

  const leaderboard = useMemo(() => {
    const friendDirectoryEntries = [
      ...studyBuddies.map((buddy) => ({
        id: buddy.id,
        initials: buddy.initials,
        name: buddy.name,
        time: buddy.studyTime,
        level: buddy.level,
        status: buddy.inStudyRoom ? 'Studying' : buddy.status
      })),
      ...people.map((person) => ({
        id: person.id,
        initials: getInitials(person.name),
        name: person.name,
        time: '0m',
        level: person.level,
        status: person.status
      }))
    ]

    const friendBuddies = friendDirectoryEntries.filter((entry) => friends.includes(entry.id))

    return friendBuddies.map((entry, index) => ({
      rank: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`,
      initials: entry.initials,
      name: entry.name,
      time: entry.time,
      level: entry.level,
      status: entry.status
    }))
  }, [friends, people, studyBuddies])

  const friendDirectory = useMemo(() => {
    const buddyEntries = studyBuddies.map((buddy) => ({
      id: buddy.id,
      name: buddy.name,
      initials: buddy.initials,
      color: buddy.color,
      meta: `${buddy.inStudyRoom ? 'Studying' : buddy.status} · ${buddy.level}`
    }))

    const peopleEntries = people.map((person) => ({
      id: person.id,
      name: person.name,
      initials: getInitials(person.name),
      color: '#cbd5e1',
      meta: `${person.status} · ${person.level}`
    }))

    return [...buddyEntries, ...peopleEntries]
  }, [studyBuddies, people])

  const currentFriends = friendDirectory.filter((friend) => friends.includes(friend.id))
  const displayedFriends = showAllFriends ? currentFriends : currentFriends.slice(0, 3)
  const canExpandFriends = currentFriends.length > 3
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

  const openRoomMembersModal = (room) => {
    setRoomMembersModal(room)
    setRoomPreviewModal(null)
  }

  const handleConfirmJoinRoom = (room) => {
    setJoinedRooms([room.id])
    setRoomMembersModal(null)
    setRoomPreviewModal(room)
  }

  const handleLeaveRoom = () => {
    setJoinedRooms([])
    setRoomPreviewModal(null)
  }

  const addFriend = (friendId) => {
    setFriends(prev => prev.includes(friendId) ? prev : [...prev, friendId])
  }

  const removeFriend = (friendId) => {
    setFriends(prev => prev.filter(id => id !== friendId))
  }

  const handleCreateRoom = () => {
    if (!roomName.trim()) return

    const newRoom = {
      id: Date.now(),
      name: roomName.trim(),
      creator: user?.displayName || 'You',
      studying: 1,
      participants: [
        { name: user?.displayName || 'You', posture: '0', status: 'Online', studyTime: '0m' },
        { name: 'Alex Chen', posture: '88', status: 'Studying', studyTime: '145m' }
      ]
    }

    setStudyRooms(prev => [newRoom, ...prev])
    setRoomName('')
    setShowCreateModal(false)
  }

  const liveRoomUserStats = useMemo(() => {
    const savedScore = Number(window.localStorage.getItem('posturable-posture-score'))
    const postureScore = Number.isFinite(savedScore) && savedScore > 0 ? savedScore : 0

    return {
      postureScore,
      studyTime: '0m'
    }
  }, [roomPreviewModal, user])

  const filteredPeople = searchTerm.trim()
    ? people
        .filter(person => {
          const query = searchTerm.trim().toLowerCase().replace(/\s+/g, '')
          const [firstName = '', ...restNames] = person.name.split(/\s+/)
          const lastName = restNames.join(' ')
          const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toLowerCase()
          const firstNameCode = firstName.toLowerCase()
          const lastNameCode = lastName.toLowerCase()
          const username = person.username.toLowerCase()

          return (
            firstNameCode.startsWith(query) ||
            lastNameCode.startsWith(query) ||
            initials.startsWith(query) ||
            username.startsWith(query)
          )
        })
        .sort((a, b) => {
          const query = searchTerm.trim().toLowerCase().replace(/\s+/g, '')
          const score = (person) => {
            const [firstName = '', ...restNames] = person.name.split(/\s+/)
            const lastName = restNames.join(' ')
            const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toLowerCase()
            let value = 0

            if (firstName.toLowerCase().startsWith(query)) value += 3
            if (lastName.toLowerCase().startsWith(query)) value += 2
            if (initials.startsWith(query)) value += 4
            if (person.username.toLowerCase().startsWith(query)) value += 1
            return value
          }

          return score(b) - score(a) || a.name.localeCompare(b.name)
        })
    : []

  useEffect(() => {
    if (!roomPreviewModal) return

    let stream = null

    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (roomVideoRef.current) {
          roomVideoRef.current.srcObject = stream
        }
      } catch {
        if (roomVideoRef.current) {
          roomVideoRef.current.poster = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" fill="white" text-anchor="middle" font-size="32" font-family="Arial">Camera unavailable</text></svg>')
        }
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [roomPreviewModal])

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
                    <div className="friend-result-meta">@{person.username} · {person.status} · {person.level}</div>
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
                <div className="current-friend-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => removeFriend(friend.id)}
                  >
                    Delete
                  </button>
                </div>
                {!friends.includes(friend.id) && <span className="friend-not-added">Not added</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="friend-empty">No friends added yet. Search for someone above.</p>
        )}

        {canExpandFriends && (
          <div className="section-more-row">
            <button
              type="button"
              className="more-text-btn"
              onClick={() => setShowAllFriends((prev) => !prev)}
            >
              {showAllFriends ? 'Less' : 'More'}
            </button>
          </div>
        )}
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
                onClick={() => openRoomMembersModal(room)}
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

      {roomMembersModal && (
        <div className="modal-backdrop" onClick={() => setRoomMembersModal(null)}>
          <div className="modal-card room-members-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{roomMembersModal.name}</h3>
            <p>Everyone in this study room</p>

            <div className="room-members-list">
              {(roomMembersModal.participants || []).map((person, index) => (
                <div key={`${person.name}-${index}`} className="room-member-row">
                  <div className="member-avatar">{person.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                  <div className="member-info">
                    <div className="member-name">{person.name}</div>
                    <div className="member-status">{person.status}</div>
                  </div>
                  <div className="member-posture">{person.posture}</div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setRoomMembersModal(null)}>Close</button>
              <button type="button" className="primary-btn" onClick={() => handleConfirmJoinRoom(roomMembersModal)}>Join room</button>
            </div>
          </div>
        </div>
      )}

      {roomPreviewModal && (
        <div className="modal-backdrop" onClick={() => handleLeaveRoom()}>
          <div className="modal-card room-preview-modal" onClick={(event) => event.stopPropagation()}>
            <div className="room-preview-header">
              <div>
                <h3>{roomPreviewModal.name}</h3>
                <p>Study session live</p>
              </div>
              <button type="button" className="ghost-btn" onClick={handleLeaveRoom}>Leave</button>
            </div>

            <div className="room-preview-layout">
              <div className="webcam-panel">
                <video ref={roomVideoRef} autoPlay muted playsInline className="webcam-video" />
                <div className="webcam-label">Your webcam</div>
              </div>

              <div className="room-live-sidebar">
                <div className="posture-panel">
                  <div className="posture-score-label">Your posture score</div>
                  <div className="posture-score-value">{liveRoomUserStats.postureScore}</div>
                  <div className="posture-user">{user?.displayName || 'You'}</div>
                  <div className="posture-meta">{liveRoomUserStats.studyTime} studying</div>
                </div>

                <div className="room-live-members">
                  {(roomPreviewModal.participants || []).filter(person => person.name !== 'You').map((person, index) => (
                    <div key={`${person.name}-${index}`} className="live-member-row">
                      <div className="member-avatar small">{person.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                      <div className="member-info">
                        <div className="member-name">{person.name}</div>
                        <div className="member-status">{person.status}</div>
                      </div>
                      <div className="member-stats">
                        <span className="member-score">{person.posture || '0'}</span>
                        <span className="member-time">{person.studyTime || '0m'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
