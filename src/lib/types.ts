// Token usage for a specific time period
export interface TokenUsage {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  total: number
}

// Daily usage data point for charts
export interface DailyUsage {
  date: string       // ISO date string YYYY-MM-DD
  label: string      // Display label like "Mon", "Tue"
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  total: number
  sessions: number
  messages: number
}

// Model usage breakdown
export interface ModelUsage {
  model: string
  displayName: string
  tokens: number
  percentage: number
  color: string
}

// Weekly summary stats
export interface WeeklyStats {
  totalTokens: number
  estimatedCost: number
  sessions: number
  messages: number
  streakDays: number
  dailyBreakdown: DailyUsage[]
}

// Today's token usage summary
export interface TodayStats {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  total: number
}

// Lifetime / total usage summary
export interface TotalStats {
  totalTokens: number
  estimatedCost: number
  sessions: number
  messages: number
}

// Full usage response from /api/usage
export interface UsageData {
  today: TodayStats
  total: TotalStats
  week: WeeklyStats
  models: ModelUsage[]
  lastUpdated: string
}

// Account information from /api/account
export interface AccountData {
  email: string
  organization: string
  plan: string
  apiKeyPreview: string
}

// Subscription gauge data
export interface SubscriptionGauge {
  label: string
  used: number
  limit: number
  percentage: number
  color: string
}

// Parsed JSONL message entry
export interface JsonlMessage {
  type: string
  message?: {
    role?: string
    model?: string
    usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
  }
  timestamp?: string
}

// Claude config.json structure
export interface ClaudeConfig {
  primaryApiKey?: string
  hasCompletedOnboarding?: boolean
  userEmail?: string
  organizationName?: string
  organizationId?: string
  planType?: string
  oauthAccount?: {
    emailAddress?: string
    organizationName?: string
  }
}
