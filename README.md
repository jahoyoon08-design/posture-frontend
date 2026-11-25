# Posturable

Posturable is a web app that helps students build healthier study habits. It uses your webcam to watch your posture while you study, scores it in real time, reminds you to take breaks, and suggests stretches. Streaks, achievements, and friends make it easier to stick with good habits.

This repository contains the **frontend** (React + Vite). The backend API lives in a separate repository:

👉 **Backend:** [jahoyoon08-design/posture-backend](https://github.com/jahoyoon08-design/posture-backend.git)

## Demo

▶️ **[Watch the video demo](https://drive.google.com/file/d/1eAH02hW1gbYMwdOInZlDEsFXe5QuMdv1/view?usp=sharing)**

## What it does

- **Real-time posture detection.** During a study session, the app runs MediaPipe Pose in the browser to find your nose, shoulders, and hips. It flags problems such as a neck bent forward or to the side, or rounded shoulders, and turns them into a live posture score from 0 to 100. Video is processed on your device and never uploaded.
- **Pomodoro study sessions.** A 25/5-minute focus and break timer that counts completed sessions and breaks taken.
- **Dashboard.** Shows today's posture score, breaks, and focus lapses at a glance.
- **Stats and achievements.** Study time, average posture, breaks, and streaks over the last 7 days, plus unlockable badges such as Week Warrior, Posture Pro, and Perfect Week.
- **Guided stretches.** Short desk-friendly routines (neck rolls, shoulder shrugs, spinal twist, wrist circles, eye exercises, and more) with progress tracking.
- **Social.** Add friends, see their streaks and levels, compete on a weekly leaderboard, and study together in shared study rooms.
- **Accounts.** Register, log in, and edit your profile. Account, user, and friend data is stored by the backend.

## Tech stack

- React 19 with React Router, built with Vite (React Compiler enabled)
- MediaPipe Pose / TensorFlow.js for in-browser pose detection
- Deployed on Netlify, with `/api/*` requests proxied to the hosted backend
- Cloudflare Web Analytics

## Getting started

### Prerequisites

- Node.js 18 or newer
- A running instance of the [backend](https://github.com/jahoyoon08-design/posture-backend.git) (defaults to `http://localhost:3001`)

### Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 and allow camera access when prompted.

In development, Vite proxies `/api` requests to `http://localhost:3001` (see [vite.config.js](vite.config.js)). To point the app at a different backend, set `VITE_API_URL`:

```bash
VITE_API_URL=https://your-backend.example.com/api npm run dev
```

### Scripts

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload |
| `npm run build`   | Build for production into `dist/`    |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Run ESLint                           |

## Project structure

```
src/
├── App.jsx              # Routing, auth state, layout
├── pages/               # Home, Study, Stats, Stretches, Social, Settings
├── components/          # Shared UI (e.g. PostureCamera)
├── utils/
│   ├── api.js           # Backend API client
│   ├── posturePose.js   # MediaPipe loading + posture scoring rules
│   └── homeStats.js     # Daily dashboard stats
└── styles/              # Page styles
```

## Deployment

The app is set up for Netlify ([netlify.toml](netlify.toml)). API calls to `/api/*` are forwarded to the hosted backend, and all other routes fall back to `index.html` so client-side routing works.
