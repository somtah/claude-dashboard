export type Lang = 'en' | 'th'

export const THB_RATE = 33

export function formatCost(usdAmount: number, lang: Lang): string {
  if (lang === 'th') {
    return `~฿${Math.round(usdAmount * THB_RATE).toLocaleString()}`
  }
  return `~$${usdAmount.toFixed(2)}`
}

export interface Translations {
  subtitle: string; updated: string; refresh: string
  account: string; connected: string; email: string
  today: string; input: string; output: string; cacheRead: string; cacheWrite: string
  total: string; totalTokens: string; costEquiv: string; sessions: string; messages: string
  thisWeek: string; estimated: string; streak: string; days: string
  usageTrend: string; tokensPerDay: string; tokens: string
  models: string; noModelData: string
  subscriptionUsage: string; session: string; weekly: string; weeklySonnet: string
  footerClaude: string; footerOR: string
}

export const translations: Record<Lang, Translations> = {
  en: {
    subtitle: 'Account & Usage Dashboard',
    updated: 'Updated',
    refresh: 'Refresh',
    account: 'ACCOUNT',
    connected: 'Connected',
    email: 'EMAIL',
    today: 'Today',
    input: 'Input',
    output: 'Output',
    cacheRead: 'Cache Read',
    cacheWrite: 'Cache Write',
    total: 'Total',
    totalTokens: 'total tokens',
    costEquiv: 'USD equiv',
    sessions: 'Sessions',
    messages: 'Messages',
    thisWeek: 'This Week',
    estimated: 'estimated',
    streak: 'Streak',
    days: 'Days',
    usageTrend: 'Usage Trend (7d)',
    tokensPerDay: 'Tokens/Day',
    tokens: 'Tokens',
    models: 'Models (7d)',
    noModelData: 'No model data available',
    subscriptionUsage: 'Subscription Usage',
    session: 'Session',
    weekly: 'Weekly',
    weeklySonnet: 'Weekly Sonnet',
    footerClaude: 'Token usage from your local Claude Code sessions · costs are estimates',
    footerOR: 'Usage data from OpenRouter API · costs are estimates',
  },
  th: {
    subtitle: 'แดชบอร์ดบัญชีและการใช้งาน',
    updated: 'อัปเดตเมื่อ',
    refresh: 'รีเฟรช',
    account: 'บัญชี',
    connected: 'เชื่อมต่อแล้ว',
    email: 'อีเมล',
    today: 'วันนี้',
    input: 'อินพุต',
    output: 'เอาต์พุต',
    cacheRead: 'อ่านแคช',
    cacheWrite: 'เขียนแคช',
    total: 'รวมทั้งหมด',
    totalTokens: 'โทเค็นทั้งหมด',
    costEquiv: 'เทียบราคา',
    sessions: 'เซสชัน',
    messages: 'ข้อความ',
    thisWeek: 'สัปดาห์นี้',
    estimated: 'ประมาณ',
    streak: 'ต่อเนื่อง',
    days: 'วัน',
    usageTrend: 'แนวโน้มการใช้งาน (7 วัน)',
    tokensPerDay: 'โทเค็น/วัน',
    tokens: 'โทเค็น',
    models: 'โมเดล (7 วัน)',
    noModelData: 'ไม่มีข้อมูลโมเดล',
    subscriptionUsage: 'การใช้งานแพ็กเกจ',
    session: 'เซสชัน',
    weekly: 'รายสัปดาห์',
    weeklySonnet: 'Sonnet รายสัปดาห์',
    footerClaude: 'ข้อมูลโทเค็นจากเซสชัน Claude Code ในเครื่องของคุณ · ค่าใช้จ่ายเป็นการประมาณ',
    footerOR: 'ข้อมูลการใช้งานจาก OpenRouter API · ค่าใช้จ่ายเป็นการประมาณ',
  },
}
