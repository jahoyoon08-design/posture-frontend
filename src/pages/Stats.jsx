import { useState } from 'react'
import '../styles/pages.css'
import ach1 from '../assets/ach1.png'
import ach2 from '../assets/ach2.png'
import ach3 from '../assets/ach3.png'
import ach4 from '../assets/ach4.png'
import ach5 from '../assets/ach5.png'
import ach6 from '../assets/ach6.png'
import ach7 from '../assets/ach7.png'
import ach8 from '../assets/ach8.png'
import { getLast7DaysSummary, loadDailyHistory } from '../utils/homeStats'

const assetModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
})

const normalizeFileKey = (value) =>
  value
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[\s_-]+/g, '')

const achievementImageLookup = Object.fromEntries(
  Object.entries(assetModules).map(([filePath, src]) => {
    const fileName = filePath.split('/').pop() || ''
    return [normalizeFileKey(fileName), src]
  })
)

const getAchievementImage = (title, fallback) => {
  const byTitle = achievementImageLookup[normalizeFileKey(title)]
  return byTitle || fallback || null
}

function AchievementIcon({ type }) {
  switch (type) {
    case 'flame':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3c1.8 2.2 3 4.6 3 7.2 0 2.4-1.2 4.2-3 5.2-1.8-1-3-2.8-3-5.2C9 7.6 10.2 5.2 12 3z"></path>
          <path d="M7 13c1.2 1.8 2.4 2.9 5 3.9 2.6-1 3.8-2.1 5-3.9"></path>
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z"></path>
        </svg>
      )
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v18H7.5A2.5 2.5 0 0 1 5 18.5v-13z"></path>
          <path d="M8 7h8"></path>
        </svg>
      )
    case 'target':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="8"></circle>
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 4v2"></path>
          <path d="M12 18v2"></path>
          <path d="M4 12h2"></path>
          <path d="M18 12h2"></path>
        </svg>
      )
    case 'medal':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="5"></circle>
          <path d="M8 13l-2 7 6-3 6 3-2-7"></path>
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 15.6 7.4 17.4l.9-5.2-3.8-3.7 5.2-.8L12 3z"></path>
        </svg>
      )
  }
}

export default function Stats() {
  const [selectedTab, setSelectedTab] = useState('posture')
  const [last7Days] = useState(() => getLast7DaysSummary())

  const formatStudyTime = (minutes) => {
    if (!minutes) return '0m'
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  const totalStudyMinutes = last7Days.reduce((sum, day) => sum + day.studyMinutes, 0)
  const totalBreaksTaken = last7Days.reduce((sum, day) => sum + day.breaksTaken, 0)
  const postureDays = last7Days.filter(day => day.postureAvg > 0)
  const averagePosture = postureDays.length
    ? Math.round(postureDays.reduce((sum, day) => sum + day.postureAvg, 0) / postureDays.length)
    : 0
  let streak = 0

  for (const day of [...last7Days].reverse()) {
    if (day.studyMinutes === 0) break
    streak += 1
  }

  const allHistory = loadDailyHistory()
  const allHistoryEntries = Object.entries(allHistory)
    .map(([day, value]) => ({
      date: day,
      studyMinutes: value?.studyMinutes || 0,
      breaksTaken: value?.breaksTaken || 0,
      postureAvg: Array.isArray(value?.postureSamples) && value.postureSamples.length > 0
        ? Math.round(value.postureSamples.reduce((sum, score) => sum + score, 0) / value.postureSamples.length)
        : 0
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  let longStreak = 0
  for (const entry of [...allHistoryEntries].reverse()) {
    if (entry.studyMinutes === 0) break
    longStreak += 1
  }

  const studyDays = last7Days.filter(day => day.studyMinutes > 0).length
  const hasAnySession = last7Days.some(day => day.studyMinutes > 0)
  const isPerfectWeek = last7Days.length === 7 && last7Days.every(day => day.postureAvg >= 85)

  let posturePro14DayStreak = 0
  for (const entry of [...allHistoryEntries].reverse()) {
    if (entry.postureAvg < 80) break
    posturePro14DayStreak += 1
  }
  const isPosturePro = posturePro14DayStreak >= 14

  const statsData = [
    { label: 'Study Time', value: formatStudyTime(totalStudyMinutes), unit: 'last 7 days', icon: 'book' },
    { label: 'Avg Posture', value: String(averagePosture), unit: averagePosture > 0 ? 'out of 100 · last 7 days' : 'no sessions yet', icon: 'target' },
    { label: 'Total Breaks', value: String(totalBreaksTaken), unit: 'last 7 days', icon: 'spark' },
    { label: 'Streak', value: `${streak}d`, unit: 'last 7 days', icon: 'flame' },
  ]

  const achievements = [
    { img: getAchievementImage('Week Warrior', ach1), title: 'Week Warrior', desc: '6-day streak', unlocked: streak >= 6 },
    { img: getAchievementImage('Study Master', ach2), title: 'Study Master', desc: '90+ minutes studied', unlocked: totalStudyMinutes >= 90 },
    { img: getAchievementImage('Month Master', ach3), title: 'Month Master', desc: '30-day streak', unlocked: longStreak >= 30 },
    { img: getAchievementImage('Posture Pro', ach4), title: 'Posture Pro', desc: '80+ score for 14 days straight', unlocked: isPosturePro },
    { img: getAchievementImage('Break Taker', ach5), title: 'Break Taker', desc: '12 breaks taken', unlocked: totalBreaksTaken >= 12 },
    { img: getAchievementImage('Consistent', ach6), title: 'Consistent', desc: 'Study 5 days/wk', unlocked: studyDays >= 5 },
    { img: getAchievementImage('Early Bird', ach7), title: 'Early Bird', desc: 'First session', unlocked: hasAnySession },
    { img: getAchievementImage('Perfect Week', ach8), title: 'Perfect Week', desc: 'Posture ≥85 all week', unlocked: isPerfectWeek },
  ]

  const weeklyData = {
    posture: last7Days.map(day => day.postureAvg),
    study: last7Days.map(day => day.studyMinutes),
    breaks: last7Days.map(day => day.breaksTaken),
  }

  const days = last7Days.map(day => day.dayLabel)
  const maxValue = selectedTab === 'breaks'
    ? Math.max(3, ...weeklyData.breaks)
    : selectedTab === 'study'
      ? Math.max(60, ...weeklyData.study)
      : 100
  const points = weeklyData[selectedTab]
    .map((value, idx) => {
      const x = 40 + idx * 45 + 22.5
      const y = 160 - (value / maxValue) * 140
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="page stats-page">
      <div className="page-header">
        <div>
          <h1>Posturable</h1>
          <p className="page-title">Stats</p>
        </div>
        <p className="stats-period">Last 7 days</p>
      </div>

      <div className="stats-grid">
        {statsData.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <span className="stat-icon"><AchievementIcon type={stat.icon} /></span>
              <span className="stat-name">{stat.label}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-unit">{stat.unit}</div>
          </div>
        ))}
      </div>

      <div className="trends-section">
        <h3 className="section-title">Weekly Trends</h3>

        <div className="tabs">
          <button
            className={`tab ${selectedTab === 'posture' ? 'active' : ''}`}
            onClick={() => setSelectedTab('posture')}
          >
            Posture
          </button>
          <button
            className={`tab ${selectedTab === 'study' ? 'active' : ''}`}
            onClick={() => setSelectedTab('study')}
          >
            Study
          </button>
          <button
            className={`tab ${selectedTab === 'breaks' ? 'active' : ''}`}
            onClick={() => setSelectedTab('breaks')}
          >
            Breaks
          </button>
        </div>

        <div className="chart-container">
          <svg viewBox="0 0 400 200" className="chart">
            <line x1="40" y1="160" x2="360" y2="160" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="120" x2="360" y2="120" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="80" x2="360" y2="80" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="40" x2="360" y2="40" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="160" x2="360" y2="160" stroke="#000" strokeWidth="2" />
            <line x1="40" y1="20" x2="40" y2="160" stroke="#000" strokeWidth="2" />

            <text x="35" y="165" fontSize="12" textAnchor="end">0</text>
            <text x="35" y="125" fontSize="12" textAnchor="end">25</text>
            <text x="35" y="85" fontSize="12" textAnchor="end">50</text>
            <text x="35" y="45" fontSize="12" textAnchor="end">100</text>

            <polyline
              points={points}
              fill="none"
              stroke="#111827"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {weeklyData[selectedTab].map((value, idx) => {
              const x = 40 + idx * 45 + 22.5
              const y = 160 - (value / maxValue) * 140

              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="4.5" fill="#111827" />
                  <text x={x} y="175" fontSize="12" textAnchor="middle">
                    {days[idx]}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div className="achievements-section">
        <h3 className="section-title">Achievements</h3>

        <div className="achievements-grid">
          {achievements.map((achievement, idx) => {
            const isUnlocked = achievement.unlocked

            return (
              <div
                key={idx}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                title={isUnlocked ? `${achievement.title}: ${achievement.desc}` : `How to unlock: ${achievement.desc}`}
              >
                <div className="achievement-emoji">
                  {achievement.img ? (
                    <img src={achievement.img} alt={achievement.title} className="achievement-img" />
                  ) : (
                    <AchievementIcon type={achievement.type} />
                  )}
                </div>
                <div className="achievement-title">{achievement.title}</div>
                <div className="achievement-desc">{isUnlocked ? achievement.desc : `Unlock: ${achievement.desc}`}</div>
                <span className="achievement-status">{isUnlocked ? 'Unlocked' : 'Locked'}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
