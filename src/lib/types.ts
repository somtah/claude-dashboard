export interface TokenUsage {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface DailyUsage {
  date: string
  tokens: number
  sessions: number
  messages: number
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface ModelUsage {
  model: string
  tokens: number
  percentage: number
}

export interface UsageData {
  today: TokenUsage
  total: {
    tokens: number
    sessions: number
    messages: number
    estimatedCost: number
  }
  thisWeek: {
    tokens: number
    estimatedCost: number
    sessions: number
    messages: number
    streak: number
    dailyBreakdown: DailyUsage[]
  }
  models: ModelUsage[]
  subscription: {
    sessionUsage: number
    weeklyUsage: number
    weeklySonnet: number
  }
}

export interface AccountInfo {
  email: string
  organization: string
  plan: string
}
