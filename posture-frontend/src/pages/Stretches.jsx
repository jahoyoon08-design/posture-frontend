import { useState } from 'react'
import '../styles/pages.css'

export default function Stretches() {
  const [openedStretch, setOpenedStretch] = useState(null)

  const stretches = [
    {
      id: 1,
      name: 'Seated Spinal Twist',
      recommended: true,
      description: 'Gentle twist to mobilize the spine',
      duration: '2 minutes',
      details: [
        'Maintain a long spine and breathe deeply.',
        'Hold for 30 seconds on each side.',
        'Keep your shoulders relaxed and hips grounded.'
      ]
    },
    {
      id: 2,
      recommended: true,
      name: 'Seated Forward Bend',
      description: 'Stretch your back and hamstrings',
      duration: '2 minutes',
      details: [
        'Reach towards your toes while keeping the spine straight.',
        'Relax your neck and breathe into the stretch.',
        'Hold for one full minute and release slowly.'
      ]
    },
    {
      id: 3,
      recommended: true,
      name: 'Neck Rolls',
      description: 'Release tension from your neck',
      duration: '1 minute',
      details: [
        'Move slowly and avoid sudden jerks.',
        'Keep your shoulders down while rolling.',
        'Repeat 3 times in each direction.'
      ]
    },
    {
      id: 4,
      name: 'Shoulder Shrugs',
      description: 'Loosen up your shoulder muscles',
      duration: '1 minute',
      details: [
        'Lift your shoulders towards your ears.',
        'Hold briefly and release down.',
        'Repeat this motion 10 times.'
      ]
    },
    {
      id: 5,
      name: 'Wrist Circles',
      description: 'Improve wrist flexibility',
      duration: '1 minute',
      details: [
        'Rotate wrists clockwise and counter-clockwise.',
        'Keep movements smooth and gentle.',
        'Do 10 rotations per direction.'
      ]
    },
    {
      id: 6,
      name: 'Eye Exercises',
      description: 'Reduce eye strain from screen time',
      duration: '2 minutes',
      details: [
        'Look up and down slowly.',
        'Then shift gaze left and right.',
        'Finish by focusing on a distant object.'
      ]
    },
  ]

  const toggleStretch = (id) => {
    setOpenedStretch(prev => (prev === id ? null : id))
  }

  const formatDuration = (d) => {
    if (!d) return ''
    // convert "2 minutes" or "1 minute" to "2m", "1m"
    return d.replace(/\s*minutes?$/i, 'm')
  }

  return (
    <div className="page stretches-page">
      <div className="page-header">
        <h1>Posturable</h1>
      </div>

      <div className="stretches-section">
        <h3 className="section-title">
          RECOMMENDED FOR YOU
        </h3>
        
        <div className="stretches-list">
          {stretches.map(stretch => (
            <div key={stretch.id} className={`stretch-card ${stretch.recommended ? 'recommended' : ''} ${openedStretch === stretch.id ? 'active' : ''}`}>
              <button
                type="button"
                className="stretch-summary"
                onClick={() => toggleStretch(stretch.id)}
              >
                <div className="stretch-info">
                  <h3 className="stretch-name">{stretch.name}</h3>
                  {stretch.recommended && <span className="recommended-badge">Recommended</span>}
                  <p className="stretch-description">{stretch.description}</p>
                </div>
                <div className="stretch-duration">
                  <span>{formatDuration(stretch.duration)}</span>
                </div>
              </button>
              {openedStretch === stretch.id && (
                <div className="stretch-details">
                  <ul>
                    {stretch.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
