import type { UsageData, DailyUsage, ModelUsage } from '@/lib/types'

const OR_KEY = 'or_api_key'
const OR_BASE = 'https://openrouter.ai/api/v1'

export function getStoredORKey(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(OR_KEY)
  } catch {
    return null
  }
}

export function saveORKey(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(OR_KEY, key)
  } catch { /* ignore */ }
}

export function clearORKey(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(OR_KEY)
  } catch { /* ignore */ }
}

export interface ORKeyInfo {
  label: string
  usage: number
  limit: number | null
  is_free_tier: boolean
}

export async function fetchOpenRouterKeyInfo(apiKey: string): Promise<ORKeyInfo> {
  const res = await fetch(`${OR_BASE}/auth/key`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter auth failed (${res.status}): ${text}`)
  }
  const json = await res.json()
  const d = json.data ?? json
  return {
    label: d.label ?? '',
    usage: d.usage ?? 0,
    limit: d.limit ?? null,
    is_free_tier: d.is_free_tier ?? false,
  }
}

interface ORGeneration {
  id: string
  model: string
  tokens_prompt: number
  tokens_completion: number
  created_at: string
  usage: number // cost in USD
}

async function fetchGenerations(apiKey: string): Promise<ORGeneration[]> {
  try {
    const res = await fetch(`${OR_BASE}/generation?limit=1000`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) return []
    const json = await res.json()
    if (!json.data || !Array.isArray(json.data)) return []
    return json.data as ORGeneration[]
  } catch {
    return []
  }
}

export async function fetchOpenRouterUsage(apiKey: string): Promise<UsageData> {
  const [keyInfo, generations] = await Promise.all([
    fetchOpenRouterKeyInfo(apiKey),
    fetchGenerations(apiKey),
  ])

  // Build daily breakdown from generations
  const dailyMap: Record<string, DailyUsage> = {}
  const modelMap: Record<string, number> = {}
  let totalTokens = 0

  for (const gen of generations) {
    const tokens = (gen.tokens_prompt ?? 0) + (gen.tokens_completion ?? 0)
    totalTokens += tokens

    // Daily breakdown
    const date = gen.created_at ? gen.created_at.slice(0, 10) : ''
    if (date) {
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          tokens: 0,
          sessions: 0,
          messages: 0,
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
        }
      }
      dailyMap[date].tokens += tokens
      dailyMap[date].messages += 1
      dailyMap[date].input += gen.tokens_prompt ?? 0
      dailyMap[date].output += gen.tokens_completion ?? 0
    }

    // Model usage
    const model = gen.model ?? 'unknown'
    modelMap[model] = (modelMap[model] ?? 0) + tokens
  }

  // Sort daily breakdown by date descending, take last 7 days
  const allDays = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date))
  const last7Days = allDays.slice(-7)

  // Today's usage
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEntry = dailyMap[todayStr]

  // This week totals
  const weekTokens = last7Days.reduce((s, d) => s + d.tokens, 0)
  const weekMessages = last7Days.reduce((s, d) => s + d.messages, 0)

  // Model percentages
  const models: ModelUsage[] = Object.entries(modelMap)
    .map(([model, tokens]) => ({
      model,
      tokens,
      percentage: totalTokens > 0 ? Math.round((tokens / totalTokens) * 100) : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens)

  return {
    today: {
      input: todayEntry?.input ?? 0,
      output: todayEntry?.output ?? 0,
      cacheRead: 0,
      cacheWrite: 0,
    },
    total: {
      tokens: totalTokens,
      sessions: 0,
      messages: generations.length,
      estimatedCost: keyInfo.usage,
    },
    thisWeek: {
      tokens: weekTokens,
      estimatedCost: 0,
      sessions: 0,
      messages: weekMessages,
      streak: 0,
      dailyBreakdown: last7Days,
    },
    models,
    subscription: {
      sessionUsage: 0,
      weeklyUsage: 0,
      weeklySonnet: 0,
    },
  }
}
