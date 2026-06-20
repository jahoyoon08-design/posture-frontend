import { useState, useEffect } from 'react'
import '../styles/pages.css'

export default function Study() {
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState('work') // 'work' or 'break'
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const totalSeconds = sessionType === 'work' ? workMinutes * 60 : breakMinutes * 60
  const progress = totalSeconds > 0 ? 1 - timeLeft / totalSeconds : 0
  const circumference = 2 * Math.PI * 88
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1))

  const toggleSettings = () => {
    setShowSettings(prev => !prev)
  }

  useEffect(() => {
    let interval

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      if (sessionType === 'work') {
        setSessionsCompleted(prev => prev + 1)
        setSessionType('break')
        setTimeLeft(breakMinutes * 60)
      } else {
        setSessionType('work')
        setTimeLeft(workMinutes * 60)
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, sessionType, workMinutes, breakMinutes])

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(totalSeconds)
    }
  }, [totalSeconds, isRunning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsRunning(prev => !prev)
  }

  const resetSession = () => {
    setIsRunning(false)
    setSessionType('work')
    setTimeLeft(workMinutes * 60)
  }

  const getSessionStatus = () => {
    return sessionType === 'work' ? 'Work Session' : 'Break Time'
  }

  const getStatusColor = () => {
    return sessionType === 'work' ? 'var(--text)' : 'var(--text-light)'
  }

  return (
    <div className="page study-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
          <p className="page-title">Study</p>
        </div>
      </div>

      <div className="timer-container">
        <div className="status-row">
          <div className="status-text" style={{ color: getStatusColor() }}>
            {isRunning ? 'In Progress' : 'Ready'}
          </div>

          {!isRunning && (
            <button
              type="button"
              className={`settings-toggle ${showSettings ? 'open' : ''}`}
              onClick={toggleSettings}
              title="Timer settings"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h10M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {!isRunning && showSettings && (
          <div className="timer-settings">
            <div className="duration-control">
              <label>Study duration</label>
              <div className="duration-slider">
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(Number(e.target.value))}
                />
                <span>{workMinutes} min</span>
              </div>
            </div>

            <div className="duration-control">
              <label>Break duration</label>
              <div className="duration-slider">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                />
                <span>{breakMinutes} min</span>
              </div>
            </div>
          </div>
        )}

        <div className="timer-display">
          <div className="timer-ring">
            <svg viewBox="0 0 200 200" className="timer-ring-svg">
              <circle
                cx="100"
                cy="100"
                r="88"
                className="timer-ring-track"
              />
              <circle
                cx="100"
                cy="100"
                r="88"
                className="timer-ring-progress"
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>
            <div className="time-circle-inner" style={{ borderColor: getStatusColor() }}>
              <span className="time-value">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="timer-duration">
          {sessionType === 'work'
            ? `${workMinutes}m study / ${breakMinutes}m break`
            : `${breakMinutes}m break / ${workMinutes}m study`}
        </div>

        <div className="timer-controls">
          <button
            className={`control-btn ${isRunning ? 'pause' : 'play'}`}
            onClick={toggleTimer}
          >
            {isRunning ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
            {isRunning ? 'Pause' : 'Start'}
          </button>

          <button
            className="control-btn reset"
            onClick={resetSession}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            Reset
          </button>
        </div>

        <div className="camera-box" title="Camera (coming soon)">
          <div className="camera-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7l-3 0-2-3H8L6 7H3v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
          </div>
          <div className="camera-text">Camera off</div>
        </div>

        <div className="sessions-count">
          Sessions completed: {sessionsCompleted}
        </div>
      </div>

    </div>
  )
}
