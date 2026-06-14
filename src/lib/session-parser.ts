import fs from 'fs'
import path from 'path'
import os from 'os'
import type {
  JsonlMessage,
  ClaudeConfig,
  AccountData,
  UsageData,
  TodayStats,
  TotalStats,
  WeeklyStats,
  DailyUsage,
  ModelUsage,
} from './types'

const CLAUDE_DIR = path.join(os.homedir(), '.claude')
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects')
const CONFIG_FILE = path.join(CLAUDE_DIR, 'config.json')

// Cost per million tokens (approximate)
const COST_PER_M_INPUT = 3.0
const COST_PER_M_OUTPUT = 15.0
const COST_PER_M_CACHE_READ = 0.3
const COST_PER_M_CACHE_WRITE = 3.75

function computeCost(
  input: number,
  output: number,
  cacheRead: number,
  cacheWrite: number
): number {
  return (
    (input / 1_000_000) * COST_PER_M_INPUT +
    (output / 1_000_000) * COST_PER_M_OUTPUT +
    (cacheRead / 1_000_000) * COST_PER_M_CACHE_READ +
    (cacheWrite / 1_000_000) * COST_PER_M_CACHE_WRITE
  )
}

// Recursively find all .jsonl files under a directory
function findJsonlFiles(dir: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findJsonlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
      results.push(fullPath)
    }
  }
  return results
}

interface ParsedEntry {
  date: string // YYYY-MM-DD
  model: string
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  isUserMessage: boolean
}

// Parse all JSONL files and return structured entries
function parseAllEntries(): ParsedEntry[] {
  const files = findJsonlFiles(PROJECTS_DIR)
  const entries: ParsedEntry[] = []

  for (const file of files) {
    let content: string
    try {
      content = fs.readFileSync(file, 'utf-8')
    } catch {
      continue
    }

    const lines = content.split('\n')
    // Use file modification time as a fallback date source
    let fileMtime: Date
    try {
      fileMtime = fs.statSync(file).mtime
    } catch {
      fileMtime = new Date()
    }

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      let parsed: JsonlMessage
      try {
        parsed = JSON.parse(trimmed)
      } catch {
        continue
      }

      // We're only interested in assistant messages with usage data
      if (parsed.type !== 'say') continue
      if (!parsed.message) continue

      const msg = parsed.message
      const role = msg.role

      // Track user messages to count them
      if (role === 'user') {
        const dateStr = parsed.timestamp
          ? new Date(parsed.timestamp).toISOString().split('T')[0]
          : fileMtime.toISOString().split('T')[0]
        entries.push({
          date: dateStr,
          model: '',
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          isUserMessage: true,
        })
        continue
      }

      if (role !== 'assistant') continue
      if (!msg.usage) continue

      const usage = msg.usage
      const input = usage.input_tokens ?? 0
      const output = usage.output_tokens ?? 0
      const cacheRead = usage.cache_read_input_tokens ?? 0
      const cacheWrite = usage.cache_creation_input_tokens ?? 0

      // Determine date from timestamp in the record or from file mtime
      const dateStr = parsed.timestamp
        ? new Date(parsed.timestamp).toISOString().split('T')[0]
        : fileMtime.toISOString().split('T')[0]

      entries.push({
        date: dateStr,
        model: msg.model ?? 'unknown',
        input,
        output,
        cacheRead,
        cacheWrite,
        isUserMessage: false,
      })
    }
  }

  return entries
}

function getDateString(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

export function readAccountData(): AccountData {
  let config: ClaudeConfig = {}
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
    config = JSON.parse(raw)
  } catch {
    // Config file not found or invalid — use defaults
  }

  const email =
    config.oauthAccount?.emailAddress ??
    config.userEmail ??
    'Unknown'

  const organization =
    config.oauthAccount?.organizationName ??
    config.organizationName ??
    'Unknown'

  const plan = config.planType ?? 'Pro'

  return {
    email,
    organization,
    plan,
    apiKeyPreview: '',
  }
}

export function readUsageData(): UsageData {
  const entries = parseAllEntries()

  const now = new Date()
  const todayStr = getDateString(now)

  // Build last 7 days array
  const last7Days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    last7Days.push(getDateString(d))
  }

  const weekStart = last7Days[0]

  // Aggregate by date
  interface DateAgg {
    input: number
    output: number
    cacheRead: number
    cacheWrite: number
    messages: number
    userMessages: number
  }
  const byDate = new Map<string, DateAgg>()
  // Track sessions per date by counting distinct file-timestamps (approximate: count as a session per unique project file per date)
  // Simple approach: count distinct "conversation resets" — we'll just track message count as a proxy
  // and use a heuristic for sessions

  for (const entry of entries) {
    if (!byDate.has(entry.date)) {
      byDate.set(entry.date, {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        messages: 0,
        userMessages: 0,
      })
    }
    const agg = byDate.get(entry.date)!
    if (entry.isUserMessage) {
      agg.userMessages++
    } else {
      agg.input += entry.input
      agg.output += entry.output
      agg.cacheRead += entry.cacheRead
      agg.cacheWrite += entry.cacheWrite
      agg.messages++
    }
  }

  // TODAY stats
  const todayAgg = byDate.get(todayStr) ?? {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    messages: 0,
    userMessages: 0,
  }

  const today: TodayStats = {
    input: todayAgg.input,
    output: todayAgg.output,
    cacheRead: todayAgg.cacheRead,
    cacheWrite: todayAgg.cacheWrite,
    total: todayAgg.input + todayAgg.output + todayAgg.cacheRead + todayAgg.cacheWrite,
  }

  // TOTAL stats (all time)
  let totalInput = 0
  let totalOutput = 0
  let totalCacheRead = 0
  let totalCacheWrite = 0
  let totalMessages = 0
  let totalSessions = 0

  for (const [, agg] of byDate) {
    totalInput += agg.input
    totalOutput += agg.output
    totalCacheRead += agg.cacheRead
    totalCacheWrite += agg.cacheWrite
    totalMessages += agg.messages
    // Rough session heuristic: 1 session per 30 messages
    if (agg.messages > 0) totalSessions++
  }

  const totalTokens = totalInput + totalOutput + totalCacheRead + totalCacheWrite
  const totalCost = computeCost(totalInput, totalOutput, totalCacheRead, totalCacheWrite)

  const total: TotalStats = {
    totalTokens,
    estimatedCost: totalCost,
    sessions: Math.max(1, totalSessions),
    messages: totalMessages,
  }

  // WEEKLY stats
  const dailyBreakdown: DailyUsage[] = last7Days.map((dateStr) => {
    const agg = byDate.get(dateStr) ?? {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      messages: 0,
      userMessages: 0,
    }
    const dayTotal = agg.input + agg.output + agg.cacheRead + agg.cacheWrite
    return {
      date: dateStr,
      label: getDayLabel(dateStr),
      input: agg.input,
      output: agg.output,
      cacheRead: agg.cacheRead,
      cacheWrite: agg.cacheWrite,
      total: dayTotal,
      sessions: agg.messages > 0 ? 1 : 0,
      messages: agg.messages,
    }
  })

  let weekInput = 0
  let weekOutput = 0
  let weekCacheRead = 0
  let weekCacheWrite = 0
  let weekMessages = 0
  let weekSessions = 0
  let streakDays = 0

  for (const day of dailyBreakdown) {
    weekInput += day.input
    weekOutput += day.output
    weekCacheRead += day.cacheRead
    weekCacheWrite += day.cacheWrite
    weekMessages += day.messages
    weekSessions += day.sessions
  }

  // Calculate streak (consecutive days with usage ending today)
  for (let i = dailyBreakdown.length - 1; i >= 0; i--) {
    if (dailyBreakdown[i].messages > 0) {
      streakDays++
    } else {
      break
    }
  }

  const weekTokens = weekInput + weekOutput + weekCacheRead + weekCacheWrite
  const weekCost = computeCost(weekInput, weekOutput, weekCacheRead, weekCacheWrite)

  const week: WeeklyStats = {
    totalTokens: weekTokens,
    estimatedCost: weekCost,
    sessions: Math.max(weekSessions, 1),
    messages: weekMessages,
    streakDays,
    dailyBreakdown,
  }

  // MODEL breakdown (last 7 days)
  const modelTotals = new Map<string, number>()
  for (const entry of entries) {
    if (entry.isUserMessage) continue
    if (entry.date < weekStart) continue
    const tokens = entry.input + entry.output + entry.cacheRead + entry.cacheWrite
    modelTotals.set(entry.model, (modelTotals.get(entry.model) ?? 0) + tokens)
  }

  const MODEL_COLORS: Record<string, string> = {
    'claude-opus-4-5': '#a855f7',
    'claude-opus-4': '#a855f7',
    'claude-opus-3-5': '#a855f7',
    'claude-opus-3': '#a855f7',
    'claude-fable': '#ec4899',
    'claude-sonnet-4-5': '#f97316',
    'claude-sonnet-4': '#f97316',
    'claude-sonnet-3-5': '#f97316',
    'claude-sonnet-3': '#f97316',
    'claude-haiku-3-5': '#06b6d4',
    'claude-haiku-3': '#06b6d4',
  }

  const MODEL_DISPLAY: Record<string, string> = {
    'claude-opus-4-5': 'Opus',
    'claude-opus-4': 'Opus',
    'claude-opus-3-5': 'Opus',
    'claude-opus-3': 'Opus',
    'claude-fable': 'Fable',
    'claude-sonnet-4-5': 'Sonnet',
    'claude-sonnet-4': 'Sonnet',
    'claude-sonnet-3-5': 'Sonnet',
    'claude-sonnet-3': 'Sonnet',
    'claude-haiku-3-5': 'Haiku',
    'claude-haiku-3': 'Haiku',
  }

  const weekTotalTokens = weekTokens || 1
  const models: ModelUsage[] = Array.from(modelTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([model, tokens]) => ({
      model,
      displayName: MODEL_DISPLAY[model] ?? model,
      tokens,
      percentage: Math.round((tokens / weekTotalTokens) * 100),
      color: MODEL_COLORS[model] ?? '#888888',
    }))

  return {
    today,
    total,
    week,
    models,
    lastUpdated: new Date().toISOString(),
  }
}
