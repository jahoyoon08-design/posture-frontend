import { useState, useEffect } from 'react'
import '../styles/pages.css'

export default function Home() {
  const [postureScore, setPostureScore] = useState(0)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
  // Mocked user stats for home page
  const [streak] = useState(0)
  const [studyTime] = useState(0) // in minutes
  const [breaksTaken] = useState(0)
  const [focusLapses] = useState(0)

  // Level / XP
  const [level] = useState(1)
  const [levelName] = useState('Beginner')
  const [xp] = useState(0)
  const [xpToNext] = useState(100)
  const [showXpInfo, setShowXpInfo] = useState(false)

  const xpPerStudy = 5
  const xpPerBreak = 2
  const xpPerMinute = 1

  const getPostureStatus = (score) => {
    if (score < 40) return 'Needs work'
    if (score < 70) return 'Good'
    return 'Excellent'
  }

  const getPostureColor = (score) => {
    // Use monochrome palette: greys and black for UI
    if (score < 40) return 'var(--text-light)'
    if (score < 70) return 'var(--secondary)'
    return 'var(--text)'
  }

  return (
    <div className="page home-page">
      <div className="page-header">
        <h1>Posturable</h1>
        <p className="date">{today}</p>
      </div>

      <div className="posture-card">
        <h2>Today's Posture Score</h2>
        <div className="score-container">
          <div className="score-display">
            <div className="score-circle" style={{ borderColor: getPostureColor(postureScore) }}>
              <span className="score-value">{postureScore}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
          <div className="score-status">
            <span className="status-label">{getPostureStatus(postureScore)}</span>
          </div>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${postureScore}%`,
              backgroundColor: getPostureColor(postureScore)
            }}
          ></div>
        </div>

        <p className="score-message">Start a study session to track your posture.</p>
      </div>

      <div className="home-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Streak</span>
            <span className="stat-value">{streak}</span>
            <span className="stat-sub">days</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Study Time</span>
            <span className="stat-value">{studyTime}</span>
            <span className="stat-sub">min</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Breaks</span>
            <span className="stat-value">{breaksTaken}</span>
            <span className="stat-sub">taken</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Focus Lapses</span>
            <span className="stat-value">{focusLapses}</span>
          </div>
        </div>

        <div className="level-card">
          <div className="level-left">
            <div className="level-badge">Level {level}</div>
            <div className="level-name">{levelName}</div>
          </div>
          <div className="level-right">
            <div className="xp-label-row">
              <div className="xp-display">{xp} XP</div>
              <button
                type="button"
                className="xp-info-button"
                onClick={() => setShowXpInfo(prev => !prev)}
                aria-label="XP info"
              >
                i
              </button>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${(xp / xpToNext) * 100}%` }} />
            </div>
            <div className="xp-meta">{xpToNext - xp} XP until Level {level + 1}</div>
            {showXpInfo && (
              <div className="xp-info-text">
                <strong>How XP adds up:</strong>
                <ul>
                  <li>{xpPerStudy} XP per study session</li>
                  <li>{xpPerBreak} XP per break session</li>
                  <li>{xpPerMinute} XP per focused minute</li>
                </ul>
                <div className="xp-info-note">Current goal: earn {xpToNext - xp} more XP to unlock Level {level + 1}.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
