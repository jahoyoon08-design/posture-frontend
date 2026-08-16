// Shared weekly home-page stats (streak, study time, breaks, focus lapses).
// Persisted in localStorage and reset automatically at the start of each new
// week (Monday), so both brand-new users and existing users always see
// values scoped to "this week".
export const HOME_STATS_STORAGE_KEY = 'posturable-home-stats'

const DEFAULT_STATS = {
  streak: 0,
  studyMinutes: 0,
  breaksTaken: 0,
  focusLapses: 0,
  lastActiveDate: null
}

// Returns the ISO date (YYYY-MM-DD) of the Monday that starts the current week.
export function getWeekStartISO(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

// Loads this week's stats, resetting them if a new week has started (or if
// this is the first time stats have ever been recorded for this browser).
export function loadHomeStats() {
  const currentWeekStart = getWeekStartISO()
  let stats = null

  try {
    stats = JSON.parse(window.localStorage.getItem(HOME_STATS_STORAGE_KEY))
  } catch {
    stats = null
  }

  if (!stats || typeof stats !== 'object' || stats.weekStart !== currentWeekStart) {
    stats = { ...DEFAULT_STATS, weekStart: currentWeekStart }
    window.localStorage.setItem(HOME_STATS_STORAGE_KEY, JSON.stringify(stats))
  }

  return stats
}

export function saveHomeStats(stats) {
  window.localStorage.setItem(HOME_STATS_STORAGE_KEY, JSON.stringify(stats))
}

// Reads the current stats (applying the weekly-reset rule above), applies
// `updater` to them, persists the result, and returns it.
export function updateHomeStats(updater) {
  const next = updater(loadHomeStats())
  saveHomeStats(next)
  return next
}

// Clears all stored stats, used when a brand-new account is created.
export function resetHomeStats() {
  window.localStorage.removeItem(HOME_STATS_STORAGE_KEY)
}

// Level / XP progress. Unlike the weekly stats above, this does not reset on
// a weekly basis - it only resets when a brand-new account is created.
export const LEVEL_PROGRESS_STORAGE_KEY = 'posturable-level-progress'

const LEVEL_NAMES = ['Newcomer', 'Focus Starter', 'Habit Builder', 'Focus Builder', 'Focus Pro', 'Posture Master']

const DEFAULT_LEVEL_PROGRESS = {
  level: 1,
  xp: 0
}

export function getLevelName(level) {
  return LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1] || LEVEL_NAMES[LEVEL_NAMES.length - 1]
}

export function loadLevelProgress() {
  let progress = null

  try {
    progress = JSON.parse(window.localStorage.getItem(LEVEL_PROGRESS_STORAGE_KEY))
  } catch {
    progress = null
  }

  if (!progress || typeof progress !== 'object' || !Number.isFinite(progress.level) || !Number.isFinite(progress.xp)) {
    progress = { ...DEFAULT_LEVEL_PROGRESS }
    window.localStorage.setItem(LEVEL_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  }

  return progress
}

export function saveLevelProgress(progress) {
  window.localStorage.setItem(LEVEL_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

export function updateLevelProgress(updater) {
  const next = updater(loadLevelProgress())
  saveLevelProgress(next)
  return next
}

// Clears stored level/XP progress, used when a brand-new account is created.
export function resetLevelProgress() {
  window.localStorage.removeItem(LEVEL_PROGRESS_STORAGE_KEY)
}

// Per-day history (study minutes, breaks, posture samples) so the Stats page
// weekly trend chart reflects real activity instead of fixed demo numbers.
export const DAILY_HISTORY_STORAGE_KEY = 'posturable-daily-history'

const todayISO = () => new Date().toISOString().slice(0, 10)

function getOldestTrackedDateISO() {
  const date = new Date()
  date.setDate(date.getDate() - 29)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

function pruneDailyHistory(history) {
  const oldestTrackedDate = getOldestTrackedDateISO()

  return Object.fromEntries(
    Object.entries(history).filter(([dateKey]) => dateKey >= oldestTrackedDate)
  )
}

export function loadDailyHistory() {
  let history = null

  try {
    history = JSON.parse(window.localStorage.getItem(DAILY_HISTORY_STORAGE_KEY))
  } catch {
    history = null
  }

  const normalizedHistory = history && typeof history === 'object' ? pruneDailyHistory(history) : {}

  window.localStorage.setItem(DAILY_HISTORY_STORAGE_KEY, JSON.stringify(normalizedHistory))

  return normalizedHistory
}

export function saveDailyHistory(history) {
  window.localStorage.setItem(DAILY_HISTORY_STORAGE_KEY, JSON.stringify(pruneDailyHistory(history)))
}

// Adds today's study minutes and/or breaks taken to the daily history.
export function addDailyActivity({ studyMinutes = 0, breaksTaken = 0 } = {}) {
  const history = loadDailyHistory()
  const date = todayISO()
  const entry = history[date] || { studyMinutes: 0, breaksTaken: 0, postureSamples: [] }

  history[date] = {
    ...entry,
    studyMinutes: entry.studyMinutes + studyMinutes,
    breaksTaken: entry.breaksTaken + breaksTaken
  }
  saveDailyHistory(history)
}

// Records a posture score sample for today, used to compute the day's average.
export function addDailyPostureSample(score) {
  const history = loadDailyHistory()
  const date = todayISO()
  const entry = history[date] || { studyMinutes: 0, breaksTaken: 0, postureSamples: [] }

  history[date] = {
    ...entry,
    postureSamples: [...(entry.postureSamples || []), score]
  }
  saveDailyHistory(history)
}

// Returns the last 7 days (oldest first), defaulting to 0s for days with no recorded activity.
export function getLast7DaysSummary() {
  const history = loadDailyHistory()
  const days = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().slice(0, 10)
    const entry = history[dateKey]
    const postureSamples = entry?.postureSamples || []
    const postureAvg = postureSamples.length
      ? Math.round(postureSamples.reduce((sum, s) => sum + s, 0) / postureSamples.length)
      : 0

    days.push({
      date: dateKey,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      studyMinutes: entry?.studyMinutes || 0,
      breaksTaken: entry?.breaksTaken || 0,
      postureAvg
    })
  }

  return days
}

export function resetDailyHistory() {
  window.localStorage.removeItem(DAILY_HISTORY_STORAGE_KEY)
}
