import { useState } from 'react'
import '../styles/pages.css'

export default function Social() {
  const [joinedRooms, setJoinedRooms] = useState([])
  const [joinedBuddies, setJoinedBuddies] = useState([])

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

  const studyRooms = [
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

  const leaderboard = [
    { rank: '🥇', initials: 'SW', name: 'Sam Williams', time: '210m', level: 'Lvl 5' },
    { rank: '🥈', initials: 'AC', name: 'Alex Chen', time: '145m', level: 'Lvl 4' },
    { rank: '🥉', initials: 'JS', name: 'Jordan Smith', time: '98m', level: 'Lvl 3' },
  ]

  const toggleRoom = (roomId) => {
    setJoinedRooms(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    )
  }

  return (
    <div className="page social-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
          <p className="page-title">Social</p>
        </div>
        <p className="social-subtitle">Study with friends</p>
      </div>

      {/* Study Buddies Section */}
      <div className="social-section">
        <h3 className="section-title">
          <span className="icon">👥</span>
          Study Buddies
        </h3>
        
        <div className="buddies-list">
          {studyBuddies.map(buddy => (
            <div key={buddy.id} className="buddy-card">
              <div className="buddy-avatar" style={{ backgroundColor: buddy.color }}>
                {buddy.initials}
              </div>
              
              <div className="buddy-info">
                <div className="buddy-name-row">
                  <h4 className="buddy-name">{buddy.name}</h4>
                  <span className="buddy-level">{buddy.level}</span>
                </div>
                <span className={`buddy-status ${buddy.status === 'Studying' ? 'active' : buddy.status === 'Online' ? 'online' : 'offline'}`}>
                  {buddy.status}
                </span>
              </div>

              <div className="buddy-stats">
                <div className="buddy-stat">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1"></circle>
                  </svg>
                  {buddy.streak}
                </div>
                <div className="buddy-stat">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  </svg>
                  {buddy.posture}
                </div>
                <div className="buddy-stat">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {buddy.studyTime}
                </div>
              </div>

              <button className="buddy-btn">Join</button>
            </div>
          ))}
        </div>
      </div>

      {/* Study Rooms Section */}
      <div className="social-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="icon">🏫</span>
            Study Rooms
          </h3>
          <button className="create-btn">+ Create Room</button>
        </div>
        
        <div className="rooms-list">
          {studyRooms.map(room => (
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
      </div>

      {/* Leaderboard Section */}
      <div className="social-section">
        <h3 className="section-title">
          <span className="icon">🏆</span>
          Leaderboard
        </h3>
        <p className="leaderboard-subtitle">This week's study time</p>
        
        <div className="leaderboard-list">
          {leaderboard.map((entry, idx) => (
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
      </div>
    </div>
  )
}
