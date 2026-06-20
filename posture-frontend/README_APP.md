# Posturable - Posture & Study Tracking App

A modern React-based web application for tracking posture, managing study sessions with Pomodoro timers, and building healthy study habits through gamification and social features.

## Features

### 📱 Pages & Features

#### 1. **Home/Dashboard** (`/`)
- **Today's Posture Score**: Real-time posture tracking with visual score circle
- **Color-coded Status**: 
  - Red (0-40): Needs work
  - Orange (40-70): Good
  - Green (70-100): Excellent
- **Quick Stats**: Breaks taken and focus lapses
- **Daily Breakdown**: Tracks daily performance at a glance

#### 2. **Study Session** (`/study`)
- **Pomodoro Timer**: 25-minute work sessions + 5-minute breaks
- **Session Tracking**: Counts completed sessions
- **Real-time Timer Display**: Shows minutes and seconds
- **Study Tips**: Helpful reminders for maintaining good posture
- **Start/Pause/Reset Controls**: Full timer management

#### 3. **Statistics** (`/stats`)
- **Key Metrics** (Last 7 days):
  - Study Time (hours and minutes)
  - Average Posture Score (0-100)
  - Total Breaks Taken
  - Current Streak
- **Weekly Trends Chart**: Visual representation of data with tabs for:
  - Posture trends
  - Study time trends
  - Break frequency trends
- **Achievements System**: 8 unlockable badges:
  - 🔥 Week Warrior (7-day streak)
  - 📚 Study Master (100 hrs studied)
  - 🎯 Posture Pro (90+ avg score)
  - ☕ Break Taker (50 breaks taken)
  - 🌟 Month Master (30-day streak)
  - 💪 Consistent (Study 5 days/week)
  - 🚀 Early Bird (First session)
  - ✨ Perfect Week (Posture ≥85 all week)

#### 4. **Stretches** (`/stretches`)
- **Recommended Stretches**: 6 personalized stretch exercises
- **Exercise Details**:
  - Seated Spinal Twist (2 min)
  - Seated Forward Bend (2 min)
  - Neck Rolls (1 min)
  - Shoulder Shrugs (1 min)
  - Wrist Circles (1 min)
  - Eye Exercises (2 min)
- **Progress Tracking**: Visual completion counter (X/6)
- **Stretch Tips**: Best practices for effective stretching

#### 5. **Social** (`/social`)
- **Study Buddies**:
  - View friend status (Studying/Online/Offline)
  - See friend stats (streak, posture score, study time)
  - Join study sessions with friends
- **Study Rooms**:
  - Join or create study rooms
  - See how many people are currently studying
  - Find study partners for focused sessions
- **Leaderboard**:
  - Weekly study time rankings
  - Medal system (🥇🥈🥉)
  - Compete with friends

## Project Structure

```
posture-frontend/
├── src/
│   ├── App.jsx                 # Main app component with routing
│   ├── App.css                 # Global styles and layout
│   ├── index.css              # Global CSS variables and resets
│   ├── main.jsx               # Entry point
│   ├── pages/
│   │   ├── Home.jsx           # Dashboard page
│   │   ├── Study.jsx          # Pomodoro timer page
│   │   ├── Stats.jsx          # Statistics and achievements
│   │   ├── Stretches.jsx      # Stretch recommendations
│   │   └── Social.jsx         # Social features
│   └── styles/
│       └── pages.css          # Page-specific styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Technology Stack

- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: CSS3 (Flexbox, Grid, CSS Variables)
- **State Management**: React Hooks (useState, useEffect)
- **Package Manager**: npm

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd posture-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173/
```

## Development Commands

- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Build**: `npm run preview`

## Color Scheme

- **Primary Blue**: `#3b82f6` - Main actions, active states
- **Success Green**: `#22c55e` - Break time, positive indicators
- **Warning Orange**: `#f97316` - Caution states
- **Error Red**: `#ef4444` - Needs work indicator
- **Background**: `#ffffff` - Main background
- **Secondary BG**: `#f8f9fa` - Card backgrounds
- **Text**: `#1f2937` - Primary text
- **Light Text**: `#6b7280` - Secondary text

## Component Architecture

### State Management
Each page component uses React Hooks for state management:
- **Home**: postureScore state
- **Study**: timeLeft, isRunning, sessionType, sessionsCompleted
- **Stats**: selectedTab for chart filtering
- **Stretches**: completedStretches tracking
- **Social**: joinedRooms, joinedBuddies tracking

### Navigation
- Client-side routing via button click handlers
- Bottom navigation bar with 4 main sections
- Page transition animations with fade-in effects

## Responsive Design

The app is fully responsive with breakpoints at:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Key responsive features:
- Grid layouts that adapt to screen size
- Touch-friendly buttons and controls
- Optimized spacing for mobile devices

## Features Implementation

### Pomodoro Timer
- 25-minute work sessions
- 5-minute break intervals
- Automatic switching between work/break modes
- Sessions counter

### Posture Score Calculation
- Dynamic color coding based on score ranges
- Progress bar visualization
- Real-time status updates

### Achievement System
- 8 predefined achievements
- Emoji badges for visual appeal
- Linked to specific milestones

## Future Enhancements

- Backend API integration for data persistence
- User authentication
- Real posture detection via webcam
- Push notifications for break reminders
- Export statistics to PDF/CSV
- Mobile app native version
- Dark mode support
- Offline functionality with service workers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Posturable application.

## Notes

- The app currently uses mock data for demonstration
- Posture scores are initialized at 0 and can be updated through backend integration
- All achievements are visible but not yet locked/unlocked based on actual milestones
- Social features show mock user data and interactions
