import fs from 'fs'
import path from 'path'
import os from 'os'
import { UsageData, TokenUsage, DailyUsage, ModelUsage } from './types'

interface SessionLine {
  type: string
  message?: {
    role: string
    model?: string
    usage?: {
      input_tokens: number
      output_tokens: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
  }
  timestamp?: string
  uuid?: string
  sessionId?: string
}

function getClaudeDir(): string {
  return path.join(os.homedir(), '.claude')
}

function findJsonlFiles(dir: string): string[] {
  const files: string[] = []

  try {
    if (!fs.existsSync(dir)) return files

    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...findJsonlFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
        files.push(fullPath)
      }
    }
  } catch {
    // ignore permission errors
  }

  return files
}

function parseJsonlFile(filePath: string): { lines: SessionLine[], mtime: Date } {
  const lines: SessionLine[] = []
  let mtime = new Date()

  try {
    const stat = fs.statSync(filePath)
    mtime = stat.mtime

    const content = fs.readFileSync(filePath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        const parsed = JSON.parse(trimmed)
        lines.push(parsed)
      } catch {
        // skip malformed lines
      }
    }
  } catch {
    // ignore file read errors
  }

  return { lines, mtime }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDateDaysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

export function parseUsageData(): UsageData {
  const claudeDir = getClaudeDir()
  const projectsDir = path.join(claudeDir, 'projects')
  const jsonlFiles = findJsonlFiles(projectsDir)

  const today = formatDate(new Date())
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekStart = getDateDaysAgo(6)

  const todayUsage: TokenUsage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  const totalUsage = { tokens: 0, sessions: 0, messages: 0, estimatedCost: 0 }
  const weekUsage = { tokens: 0, estimatedCost: 0, sessions: 0, messages: 0, streak: 0 }

  // daily breakdown for the last 7 days
  const dailyMap = new Map<string, DailyUsage>()
  for (let i = 6; i >= 0; i--) {
    const d = getDateDaysAgo(i)
    const key = formatDate(d)
    dailyMap.set(key, {
      date: key,
      tokens: 0,
      sessions: 0,
      messages: 0,
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
    })
  }

  const modelMap = new Map<string, number>()
  const sessionDates = new Set<string>()
  const weekSessionDates = new Set<string>()
  const activeDays = new Set<string>()

  for (const filePath of jsonlFiles) {
    const { lines, mtime } = parseJsonlFile(filePath)
    if (lines.length === 0) continue

    // Use file modification time as session date proxy
    const fileDate = formatDate(mtime)
    const isToday = mtime >= todayStart
    const isThisWeek = mtime >= weekStart

    let fileHasMessages = false

    for (const line of lines) {
      const isAssistant =
        line.type === 'assistant' ||
        (line.type === 'say' && line.message?.role === 'assistant')
      if (!isAssistant) continue
      if (!line.message) continue
      if (!line.message.usage) continue

      const usage = line.message.usage
      const input = usage.input_tokens || 0
      const output = usage.output_tokens || 0
      const cacheRead = usage.cache_read_input_tokens || 0
      const cacheWrite = usage.cache_creation_input_tokens || 0
      const total = input + output + cacheRead + cacheWrite

      const model = line.message.model || 'unknown'

      // Total
      totalUsage.tokens += total
      totalUsage.messages++
      fileHasMessages = true

      // Model tracking
      modelMap.set(model, (modelMap.get(model) || 0) + total)

      // Today
      if (isToday) {
        todayUsage.input += input
        todayUsage.output += output
        todayUsage.cacheRead += cacheRead
        todayUsage.cacheWrite += cacheWrite
      }

      // This week
      if (isThisWeek) {
        weekUsage.tokens += total
        weekUsage.messages++
        weekSessionDates.add(filePath)
        activeDays.add(fileDate)

        if (dailyMap.has(fileDate)) {
          const day = dailyMap.get(fileDate)!
          day.tokens += total
          day.messages++
          day.input += input
          day.output += output
          day.cacheRead += cacheRead
          day.cacheWrite += cacheWrite
        }
      }
    }

    if (fileHasMessages) {
      sessionDates.add(filePath)
      if (isThisWeek && dailyMap.has(fileDate)) {
        const day = dailyMap.get(fileDate)!
        day.sessions++
      }
    }
  }

  totalUsage.sessions = sessionDates.size
  weekUsage.sessions = weekSessionDates.size

  // Calculate streak: consecutive days with activity ending today or yesterday
  const sortedActiveDays = Array.from(activeDays).sort().reverse()
  let streak = 0
  if (sortedActiveDays.length > 0) {
    const todayStr = formatDate(new Date())
    const yesterdayStr = formatDate(getDateDaysAgo(1))

    // Start streak from today or yesterday
    let checkDate = sortedActiveDays[0] === todayStr || sortedActiveDays[0] === yesterdayStr
      ? sortedActiveDays[0]
      : null

    if (checkDate) {
      streak = 1
      let prevDate = new Date(checkDate)
      for (let i = 1; i < sortedActiveDays.length; i++) {
        prevDate.setDate(prevDate.getDate() - 1)
        if (formatDate(prevDate) === sortedActiveDays[i]) {
          streak++
        } else {
          break
        }
      }
    }
  }
  weekUsage.streak = streak

  // Cost estimates (rough approximation)
  // claude-opus-4: $15/$75 per 1M tokens input/output
  // claude-sonnet: $3/$15 per 1M tokens
  // Using blended estimate of ~$3 per 1M tokens
  totalUsage.estimatedCost = (totalUsage.tokens / 1_000_000) * 3
  weekUsage.estimatedCost = (weekUsage.tokens / 1_000_000) * 3

  // Models
  const totalModelTokens = Array.from(modelMap.values()).reduce((a, b) => a + b, 0)
  const models: ModelUsage[] = Array.from(modelMap.entries())
    .map(([model, tokens]) => ({
      model: formatModelName(model),
      tokens,
      percentage: totalModelTokens > 0 ? Math.round((tokens / totalModelTokens) * 100) : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 5)

  // Subscription mock data (can't easily get real values from local files)
  const subscription = {
    sessionUsage: Math.min(Math.round((totalUsage.sessions / 100) * 100), 99),
    weeklyUsage: Math.min(Math.round((weekUsage.tokens / 1_000_000_000) * 100 * 3), 99),
    weeklySonnet: 0,
  }

  return {
    today: todayUsage,
    total: totalUsage,
    thisWeek: {
      ...weekUsage,
      dailyBreakdown: Array.from(dailyMap.values()),
    },
    models,
    subscription,
  }
}

function formatModelName(model: string): string {
  if (model.includes('opus')) return 'Opus'
  if (model.includes('fable')) return 'Fable'
  if (model.includes('sonnet')) return 'Sonnet'
  if (model.includes('haiku')) return 'Haiku'
  return model.split('-').slice(0, 2).join('-')
}

export function parseAccountInfo() {
  const claudeDir = getClaudeDir()

  let email = 'Unknown'
  let organization = 'Unknown'
  let plan = 'Pro'

  // Try config.json
  const configPath = path.join(claudeDir, 'config.json')
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      email = config.email || config.userEmail || email
      organization = config.organizationName || config.organization || organization
      plan = config.planType || config.plan || plan
    }
  } catch { /* ignore */ }

  // Try credentials file
  const credPath = path.join(claudeDir, 'credentials')
  try {
    if (fs.existsSync(credPath)) {
      const creds = fs.readFileSync(credPath, 'utf-8')
      const emailMatch = creds.match(/email["\s:=]+([^\s"',\n]+)/i)
      if (emailMatch) email = emailMatch[1]
    }
  } catch { /* ignore */ }

  // Try .credentials.json
  const credJsonPath = path.join(claudeDir, '.credentials.json')
  try {
    if (fs.existsSync(credJsonPath)) {
      const creds = JSON.parse(fs.readFileSync(credJsonPath, 'utf-8'))
      email = creds.email || creds.user_email || email
      organization = creds.organization || creds.org || organization
      plan = creds.plan || creds.subscription || plan
    }
  } catch { /* ignore */ }

  // Try settings.json
  const settingsPath = path.join(claudeDir, 'settings.json')
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
      email = settings.email || settings.userEmail || email
      organization = settings.organizationName || settings.organization || organization
      plan = settings.planType || settings.plan || plan
    }
  } catch { /* ignore */ }

  return { email, organization, plan }
}
