import { useState, useEffect, useRef } from 'react'
import '../styles/pages.css'
import { updateHomeStats, addDailyActivity, addDailyPostureSample, awardXp, XP_PER_STUDY_SESSION, XP_PER_STUDY_MINUTE, XP_PER_BREAK } from '../utils/homeStats'
import { POSTURE_STATUS_DEDUCTIONS, analyzePosture, loadMediapipePose } from '../utils/posturePose'

// Shared with Home.jsx so "Today's Posture Score" reflects the latest tracked value.
export const POSTURE_SCORE_STORAGE_KEY = 'posturable-posture-score'

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
        updateHomeStats(stats => {
          const today = new Date().toISOString().slice(0, 10)
          const isNewDay = stats.lastActiveDate !== today
          return {
            ...stats,
            studyMinutes: stats.studyMinutes + workMinutes,
            streak: isNewDay ? stats.streak + 1 : stats.streak,
            lastActiveDate: today
          }
        })
        addDailyActivity({ studyMinutes: workMinutes })
        awardXp(XP_PER_STUDY_SESSION + workMinutes * XP_PER_STUDY_MINUTE)
      } else {
        setSessionType('work')
        setTimeLeft(workMinutes * 60)
        updateHomeStats(stats => ({ ...stats, breaksTaken: stats.breaksTaken + 1 }))
        addDailyActivity({ breaksTaken: 1 })
        awardXp(XP_PER_BREAK)
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, sessionType, workMinutes, breakMinutes])

  // Only keep timeLeft in sync with the duration sliders before a session has
  // started, so pausing an in-progress session doesn't reset the countdown.
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!isRunning && !hasStartedRef.current) {
      setTimeLeft(totalSeconds)
    }
  }, [totalSeconds, isRunning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    const startingUp = !isRunning
    if (startingUp && !tracking) {
      const wantsCamera = window.confirm('Turn on the camera to track your posture during this session?')
      if (wantsCamera) {
        startCamera()
      }
    }
    if (startingUp) hasStartedRef.current = true
    setIsRunning(prev => !prev)
  }

  const resetSession = () => {
    hasStartedRef.current = false
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

  // Refs and state for posture tracking
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const cameraRef = useRef(null)
  const poseRef = useRef(null)
  const lastStatusUpdateRef = useRef(0)
  const scoreSamplesRef = useRef([])
  const scoreHistoryRef = useRef([])
  const wasGoodPostureRef = useRef(true)
  const [postureStatus, setPostureStatus] = useState('Camera ready')
  const [tracking, setTracking] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [blurCamera, setBlurCamera] = useState(false)
  const [postureScore, setPostureScore] = useState(() => {
    const saved = Number(window.localStorage.getItem(POSTURE_SCORE_STORAGE_KEY))
    return Number.isFinite(saved) && saved > 0 ? saved : 100
  })

  // Every 2 seconds, take the posture scores sampled during that window, add their
  // average to the running history for this session, and display the average of
  // the whole history so the score reflects the entire session, not just the last 2s.
  useEffect(() => {
    if (!tracking) return undefined

    const interval = setInterval(() => {
      const samples = scoreSamplesRef.current
      if (samples.length === 0) return
      const windowAverage = samples.reduce((sum, s) => sum + s, 0) / samples.length
      scoreSamplesRef.current = []

      scoreHistoryRef.current.push(windowAverage)
      const history = scoreHistoryRef.current
      const overallAverage = Math.round(history.reduce((sum, s) => sum + s, 0) / history.length)

      setPostureScore(overallAverage)
      window.localStorage.setItem(POSTURE_SCORE_STORAGE_KEY, String(overallAverage))
      addDailyPostureSample(Math.round(windowAverage))
    }, 2000)

    return () => clearInterval(interval)
  }, [tracking])

  // Rule-based posture analysis and MediaPipe loading now live in ../utils/posturePose.

  const onResults = (results) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // draw the camera image (landmark dots are intentionally not drawn, kept invisible)
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    const lm = results.poseLandmarks || []

    if (lm.length) {
      const status = analyzePosture(lm)
      const now = Date.now()
      // Only read a new status once per second: update the displayed status and
      // record one score sample for that reading (so a 2s window has ~2 samples to average).
      if (status && now - lastStatusUpdateRef.current >= 1000) {
        lastStatusUpdateRef.current = now
        setPostureStatus(status)
        const deduction = POSTURE_STATUS_DEDUCTIONS[status] ?? 0
        scoreSamplesRef.current.push(100 - deduction)

        // Count a "rep" each time posture is corrected from bad back to good,
        // rather than on every good sample while it stays good.
        const isGoodPosture = status === 'Good posture'
        if (isGoodPosture && !wasGoodPostureRef.current) {
          updateHomeStats(stats => ({ ...stats, reps: stats.reps + 1 }))
        }
        wasGoodPostureRef.current = isGoodPosture
      }
    }
  }

  // @mediapipe/pose loading now lives in ../utils/posturePose.

  const startCamera = async () => {
    if (tracking) return

    stopCamera({ preserveError: true })
    setCameraError('')
    lastStatusUpdateRef.current = 0
    scoreSamplesRef.current = []
    scoreHistoryRef.current = []
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
      poseRef.current = pose

      // Use native getUserMedia and a RAF loop instead of @mediapipe/camera_utils
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      const video = videoRef.current
      video.srcObject = stream
      await video.play()

      const hasLiveVideoTrack = () =>
        stream.getVideoTracks().some((track) => track.readyState === 'live')

      const handleCameraStop = () => {
        if (!hasLiveVideoTrack()) {
          pauseTimerForCameraIssue('Camera disconnected. Study timer paused.')
        }
      }

      stream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', handleCameraStop)
      })

      let stopped = false
      cameraRef.current = {
        stream,
        stop: () => {
          stopped = true
          stream.getVideoTracks().forEach((track) => {
            track.removeEventListener('ended', handleCameraStop)
            track.stop()
          })
        }
      }

      const frameLoop = async () => {
        if (stopped || !poseRef.current || !video.srcObject || !hasLiveVideoTrack()) {
          if (!stopped) {
            pauseTimerForCameraIssue('Camera disconnected. Study timer paused.')
          }
          return
        }
        try {
          await poseRef.current.send({ image: video })
        } catch (e) {
          // ignore per-frame errors
        }
        requestAnimationFrame(frameLoop)
      }
      requestAnimationFrame(frameLoop)
      setTracking(true)
      setPostureStatus('Good posture')
    } catch (err) {
      console.error('Failed to start camera', err)
      setCameraError('Could not start the camera. Please allow camera access and try again.')
      setTracking(false)
      setPostureStatus('Camera ready')
    }
  }

  const stopCamera = (options = {}) => {
    const { preserveError = false } = options

    try {
      if (cameraRef.current && cameraRef.current.stop) cameraRef.current.stop()
      if (cameraRef.current && cameraRef.current.stream) cameraRef.current.stream.getTracks().forEach((track) => {
        track.onended = null
        track.stop()
      })
    } catch (e) {}
    cameraRef.current = null
    if (poseRef.current && poseRef.current.close) poseRef.current.close()
    poseRef.current = null
    setTracking(false)
    setPostureStatus('Camera ready')
    if (!preserveError) setCameraError('')
    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.srcObject = null
        videoRef.current.load()
      } catch (e) {}
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const pauseTimerForCameraIssue = (message) => {
    setIsRunning(false)
    setCameraError(message)
    setPostureStatus('Camera unavailable')
    stopCamera({ preserveError: true })
  }

  useEffect(() => {
    if (!tracking) return

    const video = videoRef.current
    if (!video) return

    const handleVideoEnd = () => {
      pauseTimerForCameraIssue('Camera disconnected. Study timer paused.')
      setPostureStatus('Camera unavailable')
    }

    video.addEventListener('ended', handleVideoEnd)
    return () => video.removeEventListener('ended', handleVideoEnd)
  }, [tracking, isRunning])

  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page study-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
          <p className="page-title">Study</p>
        </div>
      </div>

      <p className="study-instructions">
        Tap the <strong>gear icon</strong> to set your study and break times with the sliders, then press <strong>Start</strong> to begin. Turn on the camera when prompted so your posture can be tracked during the session.
      </p>

      <div className="timer-container">
        <div className="status-row">
          {isRunning && (
            <div className="status-text" style={{ color: getStatusColor() }}>
              In Progress
            </div>
          )}

          {!isRunning && (
            <button
              type="button"
              className={`settings-toggle ${showSettings ? 'open' : ''}`}
              onClick={toggleSettings}
              title="Timer settings"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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

        <div className="camera-box" title="Posture tracking">
          <div className={`camera-area ${!tracking || blurCamera ? 'blurred' : ''}`}>
            <video ref={videoRef} className="camera-video" playsInline></video>
            <canvas ref={canvasRef} className="camera-canvas"></canvas>
            {tracking && (
              <button
                id="blur-camera"
                className={`blur-toggle-btn ${blurCamera ? 'active' : ''}`}
                onClick={() => setBlurCamera(prev => !prev)}
              >
                {blurCamera ? 'Unblur' : 'Blur'}
              </button>
            )}
          </div>

          {cameraError && <div className="camera-error">{cameraError}</div>}

          <div className="camera-controls">
            <button
              id="start-camera"
              className="control-btn"
              onClick={() => startCamera()}
              disabled={tracking}
            >
              Start Camera
            </button>
            <button
              id="stop-camera"
              className="control-btn reset"
              onClick={() => stopCamera()}
              disabled={!tracking}
            >
              Stop Camera
            </button>
          </div>

          <div className="camera-text">Posture tracker (using MediaPipe)</div>
          <div className="pose-result">Posture status: <strong>{postureStatus}</strong></div>
        </div>

        <div className="sessions-count">
          Sessions completed: {sessionsCompleted}
        </div>

        <div className="posture-score-footer">
          Today's Posture Score: <strong>{postureScore}</strong>/100
        </div>
      </div>

    </div>
  )
}
