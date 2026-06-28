import { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Study from './pages/Study'
import Stats from './pages/Stats'
import Stretches from './pages/Stretches'
import Social from './pages/Social'
import { MdHome, MdMenuBook, MdBarChart, MdFitnessCenter, MdPeople } from 'react-icons/md'

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
          <MdHome className="nav-icon" size={24} aria-hidden="true" />
          <span>Home</span>
        </button>

        <button 
          className={`nav-item ${currentPage === 'study' ? 'active' : ''}`}
          onClick={() => setCurrentPage('study')}
          title="Study"
        >
          <MdMenuBook className="nav-icon" size={24} aria-hidden="true" />
          <span>Study</span>
        </button>
        
        <button 
          className={`nav-item ${currentPage === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentPage('stats')}
          title="Stats"
        >
          <MdBarChart className="nav-icon" size={24} aria-hidden="true" />
          <span>Stats</span>
        </button>
        
        <button 
          className={`nav-item ${currentPage === 'stretches' ? 'active' : ''}`}
          onClick={() => setCurrentPage('stretches')}
          title="Stretches"
        >
          <MdFitnessCenter className="nav-icon" size={24} aria-hidden="true" />
          <span>Stretches</span>
        </button>
        
        <button 
          className={`nav-item ${currentPage === 'social' ? 'active' : ''}`}
          onClick={() => setCurrentPage('social')}
          title="Social"
        >
          <MdPeople className="nav-icon" size={24} aria-hidden="true" />
          <span>Social</span>
        </button>
      </nav>
    </div>
  )
}

export default App
