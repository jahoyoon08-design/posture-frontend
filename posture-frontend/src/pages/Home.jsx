import { useState } from 'react'
import '../styles/pages.css'

export default function Home({ user, onOpenSettings }) {
  const [postureScore] = useState(82)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
  const [streak] = useState(6)
  const [studyTime] = useState(92)
  const [breaksTaken] = useState(12)
  const [focusLapses] = useState(1)
  const [level] = useState(3)
  const [levelName] = useState('Focus Builder')
  const [xp] = useState(74)
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
    if (score < 40) return 'var(--text-light)'
    if (score < 70) return 'var(--secondary)'
    return 'var(--text)'
  }

  return (
    <div className="page home-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
          <p className="page-title">Hello, {user?.displayName || 'friend'}</p>
        </div>
        <p className="date">{today}</p>
      </div>

      <div className="welcome-card">
        <div>
          <p className="welcome-eyebrow">Today&apos;s plan</p>
          <h2>Stay tall, study steadily, and keep your pose in check.</h2>
        </div>
        <button type="button" className="ghost-btn" onClick={onOpenSettings}>Edit profile</button>
      </div>

      <div className="posture-card">
        <h2>Today&apos;s Posture Score</h2>
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
            style={{ width: `${postureScore}%` }}
          ></div>
        </div>

        <p className="score-message">A short stretch break can help you reset and feel more alert.</p>
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
                <div className="xp-info-section">
                  <strong>Posture score</strong>
                  <ul>
                    <li>Start at 100 each study session</li>
                    <li>High severity (-30): severe slouched posture, head forward too much</li>
                    <li>Medium severity (-20): mild slouch</li>
                    <li>Low severity (-10): slight drift from ideal posture</li>
                  </ul>
                </div>
                <div className="xp-info-section">
                  <strong>XP</strong>
                  <ul>
                    <li>Session score &gt; 80 → +10 XP</li>
                    <li>Improvement in posture score vs yesterday → +10 XP</li>
                    <li>Corrected posture within 5–10s → +10 XP</li>
                    <li>Maintain streak → +10 XP</li>
                  </ul>
                </div>
                <div className="xp-info-note">Current goal: earn {xpToNext - xp} more XP to unlock Level {level + 1}.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
