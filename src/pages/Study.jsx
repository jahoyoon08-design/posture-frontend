import { useState, useEffect, useRef } from 'react'
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
    if (!isRunning && (timeLeft === totalSeconds || timeLeft > totalSeconds || timeLeft === 0)) {
      setTimeLeft(totalSeconds)
    }
  }, [totalSeconds, isRunning, timeLeft])

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

  // Refs and state for posture tracking
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const cameraRef = useRef(null)
  const poseRef = useRef(null)
  const [detectedPose, setDetectedPose] = useState(null)
  const [tracking, setTracking] = useState(false)

  const sendLandmarks = async (landmarks) => {
    try {
      const res = await fetch('/api/pose/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks })
      })
      if (res.ok) {
        const json = await res.json()
        if (json && json.pose) setDetectedPose(json.pose)
      }
    } catch (err) {
      // backend may not be available; ignore silently
      // console.debug('predict error', err)
    }
  }

  const onResults = (results) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // draw the camera image
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    // draw pose landmarks
    const lm = results.poseLandmarks || []
    ctx.fillStyle = 'rgba(0,0,0,0.9)'
    for (let i = 0; i < lm.length; i++) {
      const x = lm[i].x * canvas.width
      const y = lm[i].y * canvas.height
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    }
    ctx.restore()

    if (lm.length) {
      const simplified = lm.map(p => ({ x: p.x, y: p.y, z: p.z, visibility: p.visibility }))
      sendLandmarks(simplified)
    }
  }

  const startCamera = async () => {
    if (tracking) return
    try {
      const { Pose } = await import('@mediapipe/pose')

      const pose = new Pose.Pose({
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

      let stopped = false
      cameraRef.current = { stream, stop: () => { stopped = true; stream.getTracks().forEach(t => t.stop()) } }

      const frameLoop = async () => {
        if (stopped || !poseRef.current) return
        try {
          await poseRef.current.send({ image: video })
        } catch (e) {
          // ignore per-frame errors
        }
        requestAnimationFrame(frameLoop)
      }
      requestAnimationFrame(frameLoop)
      setTracking(true)
    } catch (err) {
      console.error('Failed to start camera', err)
    }
  }

  const stopCamera = () => {
    try {
      if (cameraRef.current && cameraRef.current.stop) cameraRef.current.stop()
      if (cameraRef.current && cameraRef.current.stream) cameraRef.current.stream.getTracks().forEach(t => t.stop())
    } catch (e) {}
    cameraRef.current = null
    if (poseRef.current && poseRef.current.close) poseRef.current.close()
    poseRef.current = null
    setTracking(false)
    setDetectedPose(null)
    if (videoRef.current) {
      try { videoRef.current.pause(); videoRef.current.srcObject = null } catch (e) {}
    }
  }

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

        <div className="camera-box" title="Posture tracking">
          <div className="camera-controls">
            <button id="start-camera" className="control-btn" onClick={() => startCamera()}>Start Camera</button>
            <button id="stop-camera" className="control-btn reset" onClick={() => stopCamera()}>Stop Camera</button>
            <div className="pose-result">Detected pose: <strong>{detectedPose || '—'}</strong></div>
          </div>

          <div className="camera-area">
            <video ref={videoRef} className="camera-video" playsInline></video>
            <canvas ref={canvasRef} className="camera-canvas"></canvas>
          </div>
          <div className="camera-text">Posture tracker (using MediaPipe)</div>
        </div>

        <div className="sessions-count">
          Sessions completed: {sessionsCompleted}
        </div>
      </div>

    </div>
  )
}
