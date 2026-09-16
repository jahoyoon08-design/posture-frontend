// Shared MediaPipe Pose loading + rule-based posture analysis, used by both
// the Study page and the Social study room so posture is scored identically.

// Posture score starts at 100 and loses points depending on the detected status.
export const POSTURE_STATUS_DEDUCTIONS = {
  'Good posture': 0,
  'Neck bent forward': 30,
  'Neck bent left': 20,
  'Neck bent right': 20,
  'Neck bent left forward': 50,
  'Neck bent right forward': 50,
  'Shoulders rounded': 20
}

// Rule-based posture analysis run entirely client-side on MediaPipe landmarks.
// Landmark indices follow the MediaPipe Pose model: 0 nose, 11/12 shoulders, 23/24 hips.
export const analyzePosture = (landmarks) => {
  const nose = landmarks[0]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftHip = landmarks[23]
  const rightHip = landmarks[24]

  if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return null
  }

  const shoulderMid = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  }
  const hipMid = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  }

  // Neck bend: angle between the nose and shoulder midpoint, relative to vertical
  const shoulderWidth = Math.max(Math.abs(rightShoulder.x - leftShoulder.x), 0.0001)
  const neckDeltaXSigned = nose.x - shoulderMid.x
  const neckDeltaX = Math.abs(neckDeltaXSigned)
  const neckDeltaY = Math.abs(nose.y - shoulderMid.y)
  const neckAngle = (Math.atan2(neckDeltaX, neckDeltaY) * 180) / Math.PI
  // How much of the neck bend is sideways vs. forward, normalized by shoulder width
  const lateralRatio = neckDeltaXSigned / shoulderWidth

  // Shoulder rounding / slouch: deviation of the shoulder midpoint from the hip midpoint
  const spineDeltaX = Math.abs(shoulderMid.x - hipMid.x)
  const spineDeltaY = Math.abs(shoulderMid.y - hipMid.y)
  const spineDeviation = (Math.atan2(spineDeltaX, spineDeltaY) * 180) / Math.PI

  if (neckAngle > 20) {
    const lateralAbs = Math.abs(lateralRatio)
    const isLeft = lateralRatio > 0
    if (lateralAbs > 0.45) {
      return isLeft ? 'Neck bent left' : 'Neck bent right'
    }
    if (lateralAbs > 0.2) {
      return isLeft ? 'Neck bent left forward' : 'Neck bent right forward'
    }
    return 'Neck bent forward'
  }
  if (spineDeviation > 15) {
    return 'Shoulders rounded'
  }
  return 'Good posture'
}

// @mediapipe/pose is a legacy UMD-style script that attaches itself to
// `window.Pose` as a side effect; it does not expose real ESM/CJS exports,
// so it must be loaded via a <script> tag rather than a bundler import.
export const loadMediapipePose = () => {
  if (window.Pose) {
    return Promise.resolve(window.Pose)
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-mediapipe-pose]')

    const handleLoad = () => {
      if (window.Pose) resolve(window.Pose)
      else reject(new Error('MediaPipe Pose script loaded but window.Pose is missing'))
    }

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load MediaPipe Pose script')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
    script.crossOrigin = 'anonymous'
    script.dataset.mediapipePose = 'true'
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', () => reject(new Error('Failed to load MediaPipe Pose script')), { once: true })
    document.body.appendChild(script)
  })
}
