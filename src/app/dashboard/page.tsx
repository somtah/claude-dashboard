'use client'

import { useState, useEffect, useCallback } from 'react'
import { UsageData, AccountInfo } from '@/lib/types'
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
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usageRes, accountRes] = await Promise.all([
        fetch('/api/usage'),
        fetch('/api/account'),
      ])

      if (usageRes.ok) setUsageData(await usageRes.json())
      if (accountRes.ok) setAccountInfo(await accountRes.json())
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: 'white',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
        <DashboardHeader lastUpdated={lastUpdated} onRefresh={fetchData} loading={loading} />

        {loading && !usageData ? (
          <LoadingSkeleton />
        ) : (
          <>
            <AccountSection account={accountInfo} />

            {/* Token Usage Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <TokenUsageToday data={usageData?.today} />
              <TokenUsageTotal data={usageData?.total} />
              <TokenUsageWeek data={usageData?.thisWeek} />
            </div>

            {/* Charts Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <UsageTrendChart data={usageData?.thisWeek.dailyBreakdown} />
              <ModelsSection models={usageData?.models} />
            </div>

            {/* Subscription Row */}
            <SubscriptionSection data={usageData?.subscription} />
          </>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#555555',
          fontSize: '0.75rem',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #222222',
        }}>
          Token usage from your local Claude Code sessions · subscription quota from claude.ai · costs are estimates
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ animation: 'pulse 2s infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      {[1,2,3].map(i => (
        <div key={i} style={{
          height: '120px',
          background: '#111111',
          borderRadius: '12px',
          marginBottom: '1rem',
          border: '1px solid #222222',
        }} />
      ))}
    </div>
  )
}
