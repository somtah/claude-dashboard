'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UsageData, AccountInfo } from '@/lib/types'
import DashboardHeader from '@/components/DashboardHeader'
import AccountSection from '@/components/AccountSection'
import TokenUsageToday from '@/components/TokenUsageToday'
import TokenUsageTotal from '@/components/TokenUsageTotal'
import TokenUsageWeek from '@/components/TokenUsageWeek'
import UsageTrendChart from '@/components/UsageTrendChart'
import ModelsSection from '@/components/ModelsSection'
import SubscriptionSection from '@/components/SubscriptionSection'
import ConnectDataModal from '@/components/ConnectDataModal'

const CACHE_KEY = 'claude_usage_cache'
const CACHE_TTL = 5 * 60 * 1000

function isEmptyUsage(data: UsageData | null): boolean {
  if (!data) return true
  return data.total.tokens === 0 && data.total.sessions === 0
}

function getCachedData(): { data: UsageData; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function setCachedData(data: UsageData) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* ignore */ }
}

export default function DashboardPage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showModal, setShowModal] = useState(false)

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
        if (!isEmptyUsage(data)) {
          setCachedData(data)
        } else {
          // No server data → show modal automatically
          setShowModal(true)
        }
      }
      if (accountRes.ok) setAccountInfo(await accountRes.json())
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = getCachedData()
    if (cached) {
      setUsageData(cached.data)
      setLastUpdated(new Date(cached.ts))
      setLoading(false)
      fetch('/api/account').then(r => r.ok ? r.json() : null).then(d => d && setAccountInfo(d))
      return
    }
    fetchData()
  }, [fetchData])

  function handleDataLoaded(data: UsageData) {
    setUsageData(data)
    setLastUpdated(new Date())
    setCachedData(data)
    setShowModal(false)
  }

  async function handleRefresh() {
    sessionStorage.removeItem(CACHE_KEY)
    setShowModal(false)
    await fetchData()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
      {/* Modal pops up automatically when no data */}
      {showModal && (
        <ConnectDataModal
          onDataLoaded={handleDataLoaded}
          onDismiss={() => setShowModal(false)}
        />
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
        <DashboardHeader lastUpdated={lastUpdated} onRefresh={handleRefresh} loading={loading} />

        {loading && !usageData ? (
          <LoadingSkeleton />
        ) : (
          <>
            <AccountSection account={accountInfo} />

            <div className="grid-3">
              <TokenUsageToday data={usageData?.today} />
              <TokenUsageTotal data={usageData?.total} />
              <TokenUsageWeek data={usageData?.thisWeek} />
            </div>

            <div className="grid-2">
              <UsageTrendChart data={usageData?.thisWeek?.dailyBreakdown} />
              <ModelsSection models={usageData?.models} />
            </div>

            <SubscriptionSection data={usageData?.subscription} />
          </>
        )}

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
      {[1, 2, 3].map(i => (
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
