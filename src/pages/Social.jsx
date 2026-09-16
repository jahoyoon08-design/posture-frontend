import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/pages.css'
import { loadDailyHistory } from '../utils/homeStats'
import { POSTURE_STATUS_DEDUCTIONS, analyzePosture, loadMediapipePose } from '../utils/posturePose'
import { MdMenuBook, MdAccessTime, MdPause, MdPlayArrow } from 'react-icons/md'

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
      studying: 0,
      participants: [
        { name: 'You', posture: '0', status: 'Online', studyTime: '0m' }
      ]
    }

    setStudyRooms(prev => [newRoom, ...prev])
    setRoomName('')
    setShowCreateModal(false)
  }

  const [isRoomTimerRunning, setIsRoomTimerRunning] = useState(true)
  const [roomElapsedSeconds, setRoomElapsedSeconds] = useState(0)
  const [currentStreakSeconds, setCurrentStreakSeconds] = useState(0)
  const [todayBaselineSeconds, setTodayBaselineSeconds] = useState(0)
  const [memberElapsedSeconds, setMemberElapsedSeconds] = useState({})

  const parseMinutesLabel = (label) => {
    const match = /\d+/.exec(label || '')
    return match ? Number(match[0]) * 60 : 0
  }

  // Reset the focus timer and seed each member's elapsed time whenever a room is joined.
  useEffect(() => {
    if (!roomPreviewModal) return

    setIsRoomTimerRunning(true)
    setRoomElapsedSeconds(0)
    setCurrentStreakSeconds(0)

    const todayKey = new Date().toISOString().slice(0, 10)
    setTodayBaselineSeconds((loadDailyHistory()[todayKey]?.studyMinutes || 0) * 60)

    const seeded = {}
    ;(roomPreviewModal.participants || []).forEach((person) => {
      if (person.name !== 'You') seeded[person.name] = parseMinutesLabel(person.studyTime)
    })
    setMemberElapsedSeconds(seeded)
  }, [roomPreviewModal])

  // Tick every second: your timer only while running, other "Studying" members always.
  useEffect(() => {
    if (!roomPreviewModal) return undefined

    const interval = setInterval(() => {
      if (isRoomTimerRunning) {
        setRoomElapsedSeconds((prev) => prev + 1)
        setCurrentStreakSeconds((prev) => prev + 1)
      }
      setMemberElapsedSeconds((prev) => {
        const next = { ...prev }
        ;(roomPreviewModal.participants || []).forEach((person) => {
          if (person.name !== 'You' && person.status === 'Studying') {
            next[person.name] = (next[person.name] || 0) + 1
          }
        })
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [roomPreviewModal, isRoomTimerRunning])

  const toggleRoomTimer = () => {
    if (isRoomTimerRunning) {
      setIsRoomTimerRunning(false)
    } else {
      setIsRoomTimerRunning(true)
      setCurrentStreakSeconds(0)
    }
  }

  const roomVideoRef = useRef(null)
  const roomPoseRef = useRef(null)
  const roomCameraStreamRef = useRef(null)
  const roomScoreSamplesRef = useRef([])
  const roomLastStatusUpdateRef = useRef(0)
  const [roomPostureScore, setRoomPostureScore] = useState(100)

  // Start the same MediaPipe posture tracking as the Study page while the room is open.
  useEffect(() => {
    if (!roomPreviewModal) return undefined

    let stopped = false
    setRoomPostureScore(100)
    roomScoreSamplesRef.current = []
    roomLastStatusUpdateRef.current = 0

    const onResults = (results) => {
      const lm = results.poseLandmarks || []
      if (!lm.length) return
      const status = analyzePosture(lm)
      const now = Date.now()
      if (status && now - roomLastStatusUpdateRef.current >= 1000) {
        roomLastStatusUpdateRef.current = now
        const deduction = POSTURE_STATUS_DEDUCTIONS[status] ?? 0
        roomScoreSamplesRef.current.push(100 - deduction)
      }
    }

    const start = async () => {
      try {
        const Pose = await loadMediapipePose()
        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        })
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })
        pose.onResults(onResults)
        roomPoseRef.current = pose

        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        roomCameraStreamRef.current = stream
        const video = roomVideoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()

        const frameLoop = async () => {
          if (stopped || !roomPoseRef.current || !video.srcObject) return
          try {
            await roomPoseRef.current.send({ image: video })
          } catch {
            // ignore per-frame errors
          }
          requestAnimationFrame(frameLoop)
        }
        requestAnimationFrame(frameLoop)
      } catch (err) {
        console.error('Failed to start room posture tracking', err)
      }
    }

    start()

    return () => {
      stopped = true
      if (roomPoseRef.current && roomPoseRef.current.close) roomPoseRef.current.close()
      roomPoseRef.current = null
      if (roomCameraStreamRef.current) {
        roomCameraStreamRef.current.getTracks().forEach((track) => track.stop())
        roomCameraStreamRef.current = null
      }
      if (roomVideoRef.current) {
        try {
          roomVideoRef.current.pause()
          roomVideoRef.current.srcObject = null
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [roomPreviewModal])

  // Average the collected samples into a fresh score every 5 seconds.
  useEffect(() => {
    if (!roomPreviewModal) return undefined

    const interval = setInterval(() => {
      const samples = roomScoreSamplesRef.current
      if (samples.length === 0) return
      const average = Math.round(samples.reduce((sum, s) => sum + s, 0) / samples.length)
      roomScoreSamplesRef.current = []
      setRoomPostureScore(average)
    }, 5000)

    return () => clearInterval(interval)
  }, [roomPreviewModal])

  const formatHMS = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const roomMembersForGrid = roomPreviewModal
    ? (roomPreviewModal.participants || []).map((person) => person.name === 'You'
      ? { name: user?.displayName || 'You', active: isRoomTimerRunning, seconds: roomElapsedSeconds, isYou: true, score: roomPostureScore }
      : { name: person.name, active: person.status === 'Studying', seconds: memberElapsedSeconds[person.name] || 0, isYou: false })
    : []

  const activeMemberCount = roomMembersForGrid.filter((member) => member.active).length

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

  return (
    <div className="page social-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
        </div>
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

            <video ref={roomVideoRef} playsInline muted style={{ display: 'none' }} />

            <div className="room-focus-timer">
              <span className="room-focus-clock">{formatHMS(roomElapsedSeconds)}</span>
              <button
                type="button"
                className="room-focus-toggle"
                onClick={toggleRoomTimer}
                aria-label={isRoomTimerRunning ? 'Pause timer' : 'Resume timer'}
              >
                {isRoomTimerRunning ? <MdPause size={20} /> : <MdPlayArrow size={20} />}
              </button>
            </div>

            <div className="room-focus-stats">
              <div className="room-focus-stat">
                <span className="room-focus-stat-label">Today</span>
                <span className="room-focus-stat-value">{formatHMS(todayBaselineSeconds + roomElapsedSeconds)}</span>
              </div>
              <div className="room-focus-stat">
                <span className="room-focus-stat-label">Current focus</span>
                <span className="room-focus-stat-value">{formatHMS(currentStreakSeconds)}</span>
              </div>
            </div>

            <div className="room-ranking-row">
              <span className="room-ranking-count">{activeMemberCount}/{roomMembersForGrid.length}</span>
              <span className="room-ranking-name">{roomPreviewModal.name}</span>
            </div>

            <div className="room-members-grid">
              {roomMembersForGrid.map((member) => (
                <div key={member.name} className={`room-member-card ${member.active ? 'active' : 'idle'}`}>
                  {member.active ? <MdMenuBook size={26} /> : <MdAccessTime size={26} />}
                  <span className="room-member-card-name">{member.name}</span>
                  {member.isYou && <span className="room-member-card-score">{member.score}</span>}
                  <span className="room-member-card-time">{formatHMS(member.seconds)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
