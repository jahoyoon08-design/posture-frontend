import { useState } from 'react'
import '../styles/pages.css'
import { POSTURE_SCORE_STORAGE_KEY } from './Study'
import { loadHomeStats, loadLevelProgress, getLevelName } from '../utils/homeStats'

export default function Home({ user, onOpenSettings }) {
  const [hasPostureScore] = useState(() => window.localStorage.getItem(POSTURE_SCORE_STORAGE_KEY) !== null)
  const [postureScore] = useState(() => {
    const saved = Number(window.localStorage.getItem(POSTURE_SCORE_STORAGE_KEY))
    return Number.isFinite(saved) && saved > 0 ? saved : 0
  })
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
  const [weeklyStats] = useState(() => loadHomeStats())
  const { streak, studyMinutes: studyTime, breaksTaken } = weeklyStats
  const [levelProgress] = useState(() => loadLevelProgress())
  const { level, xp } = levelProgress
  const levelName = getLevelName(level)
  const [xpToNext] = useState(100)
  const [showXpInfo, setShowXpInfo] = useState(false)
  const [showPostureInfo, setShowPostureInfo] = useState(false)

  const getPostureStatus = (score) => {
    if (!hasPostureScore) return 'No sessions yet'
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Average'
    return 'Needs improvement'
  }

  const getPostureColor = (score) => {
    if (!hasPostureScore) return 'var(--text-light)'
    if (score >= 85) return 'var(--text)'
    if (score >= 70) return 'var(--secondary)'
    if (score >= 50) return 'var(--secondary)'
    return 'var(--text-light)'
  }


  return (
    <div className="page home-page">
      <div className="page-header home-header">
        <div>
          <h1>Posturable</h1>
          <div className="home-greeting-row">
            <p className="home-title">Hello {user?.displayName || 'friend'}!</p>
          </div>
        </div>
        <p className="date">{today}</p>
      </div>

      <div className="posture-card">
        <div className="posture-card-title-row">
          <h2>Today&apos;s Posture Score</h2>
          <button
            type="button"
            className="posture-info-button"
            onClick={() => setShowPostureInfo(prev => !prev)}
            aria-label="Posture score info"
          >
            i
          </button>
        </div>
        {showPostureInfo && (
          <div className="posture-info-box">
            <p><strong>Posture score:</strong></p>
            <ul>
              <li>Starts at 100 each study session</li>
              <li><strong>Forward neck bend (-30):</strong> head bent straight forward</li>
              <li><strong>Left / right neck bend (-20):</strong> head tilted sideways</li>
              <li><strong>Diagonal neck bend (-50):</strong> head bent forward and to the side</li>
              <li><strong>Shoulders rounded (-20):</strong> slouched shoulders</li>
            </ul>
          </div>
        )}
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

        <p className="score-message">
          {hasPostureScore
            ? 'A short stretch break can help you reset and feel more alert.'
            : 'Start a new study session to tabulate today\u2019s posture score'}
        </p>
      </div>

      <div className="home-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Streak (week)</span>
            <span className="stat-value">{streak}</span>
            <span className="stat-sub">days</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Study Time (week)</span>
            <span className="stat-value">{studyTime}</span>
            <span className="stat-sub">min</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Breaks (week)</span>
            <span className="stat-value">{breaksTaken}</span>
            <span className="stat-sub">taken</span>
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
          </div>
          {showXpInfo && (
            <div className="xp-info-text">
              <div className="xp-info-note">Current goal: earn {xpToNext - xp} more XP to reach Level {level + 1}.</div>
              <ul>
                <li>Posture starts at 100 each study session. Keep your neck, shoulders, and spine aligned to keep points high.</li>
                <li>Session score &gt; 80 → +10 XP</li>
                <li>Improvement in posture score vs yesterday → +10 XP</li>
                <li>Corrected posture within 5-10s → +10 XP</li>
                <li>Maintain streak → +10 XP</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
