import { useState } from 'react'
import '../styles/pages.css'

export default function Stats() {
  const [selectedTab, setSelectedTab] = useState('posture')

  const statsData = [
    { label: 'Study Time', value: '0h', unit: '0 min total', icon: '📚' },
    { label: 'Avg Posture', value: '0', unit: 'out of 100', icon: '🎯' },
    { label: 'Total Breaks', value: '0', unit: 'rest periods', icon: '☕' },
    { label: 'Streak', value: '0d', unit: 'current streak', icon: '🔥' },
  ]

  const achievements = [
    { emoji: '🔥', title: 'Week Warrior', desc: '7-day streak' },
    { emoji: '📚', title: 'Study Master', desc: '100 hrs studied' },
    { emoji: '🎯', title: 'Posture Pro', desc: '90+ avg score' },
    { emoji: '☕', title: 'Break Taker', desc: '50 breaks taken' },
    { emoji: '🌟', title: 'Month Master', desc: '30-day streak' },
    { emoji: '💪', title: 'Consistent', desc: 'Study 5 days/wk' },
    { emoji: '🚀', title: 'Early Bird', desc: 'First session' },
    { emoji: '✨', title: 'Perfect Week', desc: 'Posture ≥85 all week' },
  ]

  const weeklyData = {
    posture: [0, 0, 0, 0, 0, 0, 0],
    study: [0, 0, 0, 0, 0, 0, 0],
    breaks: [0, 0, 0, 0, 0, 0, 0],
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const maxValue = 100

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
              <span className="stat-name">{stat.label}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-unit">{stat.unit}</div>
          </div>
        ))}
      </div>

      <div className="trends-section">
        <h3 className="section-title">
          Weekly Trends
        </h3>
        
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
            {/* Grid lines */}
            <line x1="40" y1="160" x2="360" y2="160" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="120" x2="360" y2="120" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="80" x2="360" y2="80" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="40" x2="360" y2="40" stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Axes */}
            <line x1="40" y1="160" x2="360" y2="160" stroke="#000" strokeWidth="2" />
            <line x1="40" y1="20" x2="40" y2="160" stroke="#000" strokeWidth="2" />

            {/* Y-axis labels */}
            <text x="35" y="165" fontSize="12" textAnchor="end">0</text>
            <text x="35" y="125" fontSize="12" textAnchor="end">25</text>
            <text x="35" y="85" fontSize="12" textAnchor="end">50</text>
            <text x="35" y="45" fontSize="12" textAnchor="end">100</text>

            {/* Bars */}
            {weeklyData[selectedTab].map((value, idx) => (
              <g key={idx}>
                  <rect 
                    x={40 + idx * 45 + 5} 
                    y={160 - (value / maxValue) * 140} 
                    width="35" 
                    height={(value / maxValue) * 140} 
                    fill="var(--icon-color)" 
                    opacity="0.3"
                  />
                <text 
                  x={40 + idx * 45 + 22.5} 
                  y="175" 
                  fontSize="12" 
                  textAnchor="middle"
                >
                  {days[idx]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="achievements-section">
        <h3 className="section-title">
          Achievements
        </h3>
        
        <div className="achievements-grid">
          {achievements.map((achievement, idx) => (
            <div key={idx} className="achievement-card">
              <div className="achievement-emoji">{achievement.emoji}</div>
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-desc">{achievement.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
