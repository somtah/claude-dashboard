'use client'

import type { UsageData, TokenUsage, DailyUsage, ModelUsage } from './types'

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
}

interface RawEntry {
  line: SessionLine
  mtime: number
  filePath: string
}

async function collectJsonlEntries(
  dirHandle: FileSystemDirectoryHandle,
  entries: RawEntry[],
  pathPrefix = ''
): Promise<void> {
  for await (const [name, handle] of (dirHandle as any).entries()) {
    const fullPath = pathPrefix ? `${pathPrefix}/${name}` : name
    if (handle.kind === 'directory') {
      await collectJsonlEntries(handle as FileSystemDirectoryHandle, entries, fullPath)
    } else if (handle.kind === 'file' && name.endsWith('.jsonl')) {
      const file = await (handle as FileSystemFileHandle).getFile()
      const mtime = file.lastModified
      const text = await file.text()
      for (const rawLine of text.split('\n')) {
        const trimmed = rawLine.trim()
        if (!trimmed) continue
        try {
          const parsed = JSON.parse(trimmed)
          entries.push({ line: parsed, mtime, filePath: fullPath })
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().split('T')[0]
}

function daysAgo(n: number): number {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatModelName(model: string): string {
  if (model.includes('opus')) return 'Opus'
  if (model.includes('fable')) return 'Fable'
  if (model.includes('sonnet')) return 'Sonnet'
  if (model.includes('haiku')) return 'Haiku'
  return model.split('-').slice(0, 2).join('-')
}

function processEntries(allEntries: RawEntry[]): UsageData {
  const todayStart = daysAgo(0)
  const weekStart = daysAgo(6)
  const todayStr = formatDate(Date.now())

  const todayUsage: TokenUsage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  const totalUsage = { tokens: 0, sessions: 0, messages: 0, estimatedCost: 0 }
  const weekUsage = { tokens: 0, estimatedCost: 0, sessions: 0, messages: 0, streak: 0 }

  const dailyMap = new Map<string, DailyUsage>()
  for (let i = 6; i >= 0; i--) {
    const key = formatDate(daysAgo(i))
    dailyMap.set(key, { date: key, tokens: 0, sessions: 0, messages: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 })
  }

  const modelMap = new Map<string, number>()
  const totalSessionFiles = new Set<string>()
  const weekSessionFiles = new Set<string>()
  const activeDays = new Set<string>()

  for (const { line, mtime, filePath } of allEntries) {
    // Claude Code uses 'assistant' in newer versions, 'say' with role='assistant' in older
    const isAssistant =
      line.type === 'assistant' ||
      (line.type === 'say' && line.message?.role === 'assistant')
    if (!isAssistant) continue
    if (!line.message) continue
    if (!line.message.usage) continue

    // Use line timestamp if available, else fall back to file mtime
    const entryTime = (line as any).timestamp ? new Date((line as any).timestamp).getTime() : mtime

    const u = line.message.usage
    const input = u.input_tokens || 0
    const output = u.output_tokens || 0
    const cacheRead = u.cache_read_input_tokens || 0
    const cacheWrite = u.cache_creation_input_tokens || 0
    const total = input + output + cacheRead + cacheWrite
    const model = line.message.model || 'unknown'
    const dateStr = formatDate(entryTime)

    totalUsage.tokens += total
    totalUsage.messages++
    totalSessionFiles.add(filePath)
    modelMap.set(model, (modelMap.get(model) || 0) + total)

    if (entryTime >= todayStart) {
      todayUsage.input += input
      todayUsage.output += output
      todayUsage.cacheRead += cacheRead
      todayUsage.cacheWrite += cacheWrite
    }

    if (entryTime >= weekStart) {
      weekUsage.tokens += total
      weekUsage.messages++
      weekSessionFiles.add(filePath)
      activeDays.add(dateStr)
      const day = dailyMap.get(dateStr)
      if (day) {
        day.tokens += total
        day.messages++
        day.input += input
        day.output += output
        day.cacheRead += cacheRead
        day.cacheWrite += cacheWrite
      }
    }
  }

  // Count sessions (unique files with messages)
  totalUsage.sessions = totalSessionFiles.size
  weekUsage.sessions = weekSessionFiles.size

  // Count sessions per day
  const filesByDate = new Map<string, Set<string>>()
  for (const { filePath, mtime } of allEntries) {
    const d = formatDate(mtime)
    if (!filesByDate.has(d)) filesByDate.set(d, new Set())
    filesByDate.get(d)!.add(filePath)
  }
  for (const [d, files] of filesByDate.entries()) {
    const day = dailyMap.get(d)
    if (day) day.sessions = files.size
  }

  // Calculate streak
  const sortedActiveDays = Array.from(activeDays).sort().reverse()
  let streak = 0
  if (sortedActiveDays.length > 0) {
    const yStr = formatDate(daysAgo(1))
    if (sortedActiveDays[0] === todayStr || sortedActiveDays[0] === yStr) {
      streak = 1
      let prev = new Date(sortedActiveDays[0])
      for (let i = 1; i < sortedActiveDays.length; i++) {
        prev.setDate(prev.getDate() - 1)
        if (formatDate(prev.getTime()) === sortedActiveDays[i]) streak++
        else break
      }
    }
  }
  weekUsage.streak = streak

  totalUsage.estimatedCost = (totalUsage.tokens / 1_000_000) * 3
  weekUsage.estimatedCost = (weekUsage.tokens / 1_000_000) * 3

  const totalModelTokens = Array.from(modelMap.values()).reduce((a, b) => a + b, 0)
  const models: ModelUsage[] = Array.from(modelMap.entries())
    .map(([m, t]) => ({
      model: formatModelName(m),
      tokens: t,
      percentage: totalModelTokens > 0 ? Math.round((t / totalModelTokens) * 100) : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 5)

  return {
    today: todayUsage,
    total: totalUsage,
    thisWeek: {
      ...weekUsage,
      dailyBreakdown: Array.from(dailyMap.values()),
    },
    models,
    subscription: {
      sessionUsage: Math.min(Math.round((totalUsage.sessions / 100) * 100), 99),
      weeklyUsage: Math.min(Math.round((weekUsage.tokens / 1_000_000_000) * 100 * 3), 99),
      weeklySonnet: 0,
    },
  }
}

export async function loadDataFromDirectory(dirHandle: FileSystemDirectoryHandle): Promise<UsageData> {
  // Try to descend into 'projects' subdirectory if given ~/.claude/
  let projectsHandle: FileSystemDirectoryHandle = dirHandle
  try {
    projectsHandle = await (dirHandle as any).getDirectoryHandle('projects')
  } catch {
    // dirHandle might already be the projects dir
  }

  const entries: RawEntry[] = []
  await collectJsonlEntries(projectsHandle, entries)
  return processEntries(entries)
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

export async function pickClaudeDirectory(): Promise<FileSystemDirectoryHandle> {
  return (window as any).showDirectoryPicker({ mode: 'read', id: 'claude-data' })
}

async function readJsonFile(dirHandle: FileSystemDirectoryHandle, filename: string): Promise<any> {
  try {
    const fileHandle = await (dirHandle as any).getFileHandle(filename)
    const file = await fileHandle.getFile()
    const text = await file.text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function parseAccountFromDir(dirHandle: FileSystemDirectoryHandle): Promise<{ email: string; organization: string; plan: string }> {
  let email = 'Unknown'
  let organization = 'Unknown'
  let plan = 'Pro'

  // Try multiple files that might contain account info
  const filesToTry = ['config.json', 'settings.json', '.credentials.json', 'account.json']

  for (const filename of filesToTry) {
    const data = await readJsonFile(dirHandle, filename)
    if (!data) continue
    email = data.email || data.userEmail || data.user_email || data.primaryEmail || email
    organization = data.organizationName || data.organization || data.org || data.orgName || organization
    plan = data.planType || data.plan || data.subscriptionType || data.tier || plan
  }

  // Try nested: ~/.claude/account/profile.json or similar
  try {
    const accountDir = await (dirHandle as any).getDirectoryHandle('account')
    const profileData = await readJsonFile(accountDir, 'profile.json')
    if (profileData) {
      email = profileData.email || profileData.primaryEmail || email
      organization = profileData.organizationName || profileData.organization || organization
      plan = profileData.plan || profileData.planType || plan
    }
  } catch { /* no account dir */ }

  return { email, organization, plan }
}
