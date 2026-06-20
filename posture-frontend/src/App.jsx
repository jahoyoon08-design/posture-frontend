import { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Study from './pages/Study'
import Stats from './pages/Stats'
import Stretches from './pages/Stretches'
import Social from './pages/Social'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // You can add any global state management or effects here
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'study':
        return <Study />
      case 'stats':
        return <Stats />
      case 'stretches':
        return <Stretches />
      case 'social':
        return <Social />
      default:
        return <Home />
    }
  }

  return (
    <div className="app-container">
      <main className="app-content">
        {renderPage()}
      </main>
      
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
          title="Home"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"></path>
          </svg>
          <span>Home</span>
        </button>

        <button 
          className={`nav-item ${currentPage === 'study' ? 'active' : ''}`}
          onClick={() => setCurrentPage('study')}
          title="Study"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Study</span>
        </button>
        
        <button 
          className={`nav-item ${currentPage === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentPage('stats')}
          title="Stats"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <path d="M17 5H9.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H17"></path>
            <path d="M7 12H4.5a1.5 1.5 0 0 0-1.5 1.5v4a1.5 1.5 0 0 0 1.5 1.5H7"></path>
          </svg>
          <span>Stats</span>
        </button>
        
        <button 
          className={`nav-item ${currentPage === 'stretches' ? 'active' : ''}`}
          onClick={() => setCurrentPage('stretches')}
          title="Stretches"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12a9 9 0 0 1 9-9c4 0 7.3 2.6 8.5 6.1"></path>
            <path d="M8.5 12.5c1 1.2 2.5 2 4 2.5"></path>
          </svg>
          <span>Stretches</span>
        </button>
        
        <button 
          className={`nav-item ${currentPage === 'social' ? 'active' : ''}`}
          onClick={() => setCurrentPage('social')}
          title="Social"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Social</span>
        </button>
      </nav>
    </div>
  )
}

export default App
