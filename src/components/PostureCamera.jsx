import { useEffect, useRef, useState } from 'react'

const statusMessages = ['Camera ready', 'Good posture', 'Shoulders rounded', 'Neck bent forward']

export default function PostureCamera() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [status, setStatus] = useState('Camera ready')
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (!isCameraActive) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setStatus(prevStatus => {
        const currentIndex = statusMessages.indexOf(prevStatus)
        const nextIndex = (currentIndex + 1) % statusMessages.length
        return statusMessages[nextIndex]
      })
    }, 2500)

    return () => window.clearInterval(intervalId)
  }, [isCameraActive])

  useEffect(() => {
    if (!isCameraActive) {
      return undefined
    }

    const drawGuide = () => {
      const video = videoRef.current
      const canvas = canvasRef.current

      if (!video || !canvas) {
        return
      }

      const context = canvas.getContext('2d')
      const width = video.videoWidth || 320
      const height = video.videoHeight || 240

      if (width === 0 || height === 0) {
        return
      }

      canvas.width = width
      canvas.height = height
      context.clearRect(0, 0, width, height)
      context.drawImage(video, 0, 0, width, height)

      context.strokeStyle = 'rgba(255, 255, 255, 0.95)'
      context.lineWidth = 3
      context.strokeRect(32, 28, width - 64, height - 56)

      context.setLineDash([8, 6])
      context.strokeRect(48, 44, width - 96, height - 88)
      context.setLineDash([])

      context.fillStyle = 'rgba(0, 0, 0, 0.58)'
      context.fillRect(0, height - 44, width, 44)
      context.fillStyle = '#ffffff'
      context.font = '600 16px Inter, sans-serif'
      context.fillText(status, 16, height - 16)
    }

    drawGuide()
    const frameId = window.requestAnimationFrame(drawGuide)

    return () => window.cancelAnimationFrame(frameId)
  }, [isCameraActive, status])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    setIsCameraActive(false)
    setStatus('Camera ready')
    setError('')
  }

  const startCamera = async () => {
    if (streamRef.current) {
      return
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsCameraActive(true)
      setError('')
      setStatus('Camera ready')
    } catch (cameraError) {
      console.error(cameraError)
      setError('Camera access was denied. Please allow camera permissions and try again.')
      setStatus('Camera ready')
    }
  }

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      borderRadius: '20px',
      background: '#ffffff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '18px', margin: 0 }}>Live posture check</h3>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          padding: '6px 10px',
          borderRadius: '999px',
          background: isCameraActive ? '#111111' : '#f3f4f6',
          color: isCameraActive ? '#ffffff' : '#111111'
        }}>
          {isCameraActive ? 'Live' : 'Offline'}
        </span>
      </div>

      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#111111' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '240px', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '240px', display: isCameraActive ? 'block' : 'none' }}
        />

        {!isCameraActive && (
          <div style={{
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f9fafb',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #111111 0%, #374151 100%)'
          }}>
            Camera is off
          </div>
        )}
      </div>

      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>{status}</p>
        {error ? <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p> : null}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
        <button type="button" onClick={startCamera} style={{ flex: 1, border: 'none', borderRadius: '999px', padding: '10px 14px', background: '#111111', color: '#ffffff', cursor: 'pointer' }}>
          Start Camera
        </button>
        <button type="button" onClick={stopCamera} style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '999px', padding: '10px 14px', background: '#ffffff', color: '#111111', cursor: 'pointer' }}>
          Stop Camera
        </button>
      </div>
    </div>
  )
}
