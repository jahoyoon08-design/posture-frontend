import { useState } from 'react'
import '../styles/pages.css'
import { loadDailyHistory } from '../utils/homeStats'
import { POSTURE_STATUS_DEDUCTIONS } from '../utils/posturePose'
import twistImg from '../assets/seated-spinal-twist.png'
import forwardBendImg from '../assets/seated-forward-bend.png'
import neckRollsImg from '../assets/neck-rolls.png'
import shoulderShrugsImg from '../assets/shoulder-shrugs.png'
import wristCirclesImg from '../assets/wrist-circles.png'
import eyeExercisesImg from '../assets/eye-exercises.png'

export default function Stretches() {
  const [postureIssueLosses] = useState(() => {
    const history = loadDailyHistory()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 6)
    const firstTrackedDate = fromDate.toISOString().slice(0, 10)

    return Object.entries(history)
      .filter(([date]) => date >= firstTrackedDate)
      .reduce((totals, [, entry]) => {
        Object.entries(entry.postureIssues || {}).forEach(([status, count]) => {
          const deduction = POSTURE_STATUS_DEDUCTIONS[status] || 0
          if (deduction > 0) totals[status] = (totals[status] || 0) + deduction * count
        })
        return totals
      }, {})
  })

  const stretches = [
    {
      id: 1,
      name: 'Seated Spinal Twist',
      postureIssues: ['Shoulders rounded'],
      description: 'Gentle twist to mobilize the spine',
      duration: '2 minutes',
      image: twistImg,
      details: [
        'Maintain a long spine and breathe deeply.',
        'Hold for 30 seconds on each side.',
        'Keep your shoulders relaxed and hips grounded.'
      ]
    },
    {
      id: 2,
      name: 'Seated Forward Bend',
      description: 'Stretch your back and hamstrings',
      duration: '2 minutes',
      image: forwardBendImg,
      details: [
        'Reach towards your toes while keeping the spine straight.',
        'Relax your neck and breathe into the stretch.',
        'Hold for one full minute and release slowly.'
      ]
    },
    {
      id: 3,
      name: 'Neck Rolls',
      postureIssues: [
        'Neck bent forward',
        'Neck bent left',
        'Neck bent right',
        'Neck bent left forward',
        'Neck bent right forward'
      ],
      description: 'Release tension from your neck',
      duration: '1 minute',
      image: neckRollsImg,
      details: [
        'Move slowly and avoid sudden jerks.',
        'Keep your shoulders down while rolling.',
        'Repeat 3 times in each direction.'
      ]
    },
    {
      id: 4,
      name: 'Shoulder Shrugs',
      postureIssues: ['Shoulders rounded'],
      description: 'Loosen up your shoulder muscles',
      duration: '1 minute',
      image: shoulderShrugsImg,
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
      image: wristCirclesImg,
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
      image: eyeExercisesImg,
      details: [
        'Look up and down slowly.',
        'Then shift gaze left and right.',
        'Finish by focusing on a distant object.'
      ]
    },
  ]

  const rankedStretches = stretches
    .map((stretch) => {
      const reasons = (stretch.postureIssues || [])
        .map((status) => ({ status, loss: postureIssueLosses[status] || 0 }))
        .filter((reason) => reason.loss > 0)
        .sort((a, b) => b.loss - a.loss)

      return {
        ...stretch,
        recommendationScore: reasons.reduce((total, reason) => total + reason.loss, 0),
        recommendationReason: reasons[0]?.status
      }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore || a.id - b.id)

  const firstRecommendedId = rankedStretches[0]?.recommendationScore > 0
    ? rankedStretches[0].id
    : null
  const [openedStretch, setOpenedStretch] = useState(firstRecommendedId ?? 1)

  const toggleStretch = (id) => {
    setOpenedStretch(prev => (prev === id ? null : id))
  }

  const formatDuration = (d) => {
    if (!d) return ''
    return d.replace(/\s*minutes?$/i, 'm')
  }

  return (
    <div className="page stretches-page">
      <div className="page-header">
        <h1>Posturable</h1>
      </div>

      <div className="stretches-section">
        <h3 className="section-title">RECOMMENDED FOR YOU</h3>
        {firstRecommendedId ? (
          <p className="stretch-description">
            Prioritized by the posture deductions you recorded this week.
          </p>
        ) : (
          <p className="stretch-description">
            Start posture tracking during a study session to get recommendations matched to your posture.
          </p>
        )}

        <div className="stretches-list">
          {rankedStretches.map(stretch => (
            <div key={stretch.id} className={`stretch-card ${stretch.recommendationScore > 0 ? 'recommended' : ''} ${openedStretch === stretch.id ? 'active' : ''}`}>
              <button
                type="button"
                className="stretch-summary"
                onClick={() => toggleStretch(stretch.id)}
              >
                <div className="stretch-info">
                  <h3 className="stretch-name">{stretch.name}</h3>
                  {stretch.recommendationScore > 0 && (
                    <span className="recommended-badge">
                      {stretch.recommendationReason
                        ? `For ${stretch.recommendationReason.toLowerCase()}`
                        : 'Recommended'}
                    </span>
                  )}
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
                  <div className="video-card">
                    {stretch.image ? (
                      <img src={stretch.image} alt={stretch.name} />
                    ) : (
                      <iframe
                        title={stretch.name}
                        src={`https://www.youtube.com/embed/${stretch.videoId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
