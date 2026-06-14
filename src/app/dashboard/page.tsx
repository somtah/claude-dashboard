'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UsageData, AccountData, DailyUsage } from '@/lib/types'
import DashboardHeader from '@/components/DashboardHeader'
import AccountSection from '@/components/AccountSection'
import TokenUsageToday from '@/components/TokenUsageToday'
import TokenUsageTotal from '@/components/TokenUsageTotal'
import TokenUsageWeek from '@/components/TokenUsageWeek'
import UsageTrendChart from '@/components/UsageTrendChart'
import ModelsSection from '@/components/ModelsSection'
import SubscriptionSection from '@/components/SubscriptionSection'

export default function DashboardPage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usageRes, accountRes] = await Promise.all([
        fetch('/api/usage'),
        fetch('/api/account'),
      ])

      if (usageRes.ok) {
        const data: UsageData = await usageRes.json()
        setUsageData(data)
        setLastUpdated(data.lastUpdated ?? new Date().toISOString())
      }
      if (accountRes.ok) {
        const data: AccountData = await accountRes.json()
        setAccountData(data)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      <DashboardHeader
        lastUpdated={lastUpdated}
        onRefresh={fetchData}
        isRefreshing={loading}
      />

      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Account row */}
        <AccountSection data={accountData} loading={loading && !accountData} />

        {/* Token usage row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}
        >
          <TokenUsageToday
            data={usageData?.today ?? null}
            loading={loading && !usageData}
          />
          <TokenUsageTotal
            data={usageData?.total ?? null}
            loading={loading && !usageData}
          />
          <TokenUsageWeek
            data={usageData?.week ?? null}
            loading={loading && !usageData}
          />
        </div>

        {/* Charts row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          <UsageTrendChart
            data={(usageData?.week?.dailyBreakdown ?? null) as DailyUsage[] | null}
            loading={loading && !usageData}
          />
          <ModelsSection
            data={usageData?.models ?? null}
            loading={loading && !usageData}
          />
        </div>

        {/* Subscription row */}
        <SubscriptionSection />

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            color: '#444444',
            fontSize: '0.6875rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #1a1a1a',
          }}
        >
          Token usage from local Claude Code sessions · subscription quota is estimated · costs are approximate
        </div>
      </main>
    </div>
  )
}
