'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { UsageData, AccountInfo } from '@/lib/types'
import { saveHandle, loadHandle, verifyPermission } from '@/lib/handle-store'
import { getStoredORKey, fetchOpenRouterUsage } from '@/lib/openrouter'
import DashboardHeader from '@/components/DashboardHeader'
import AccountSection from '@/components/AccountSection'
import TokenUsageToday from '@/components/TokenUsageToday'
import TokenUsageTotal from '@/components/TokenUsageTotal'
import TokenUsageWeek from '@/components/TokenUsageWeek'
import UsageTrendChart from '@/components/UsageTrendChart'
import ModelsSection from '@/components/ModelsSection'
import SubscriptionSection from '@/components/SubscriptionSection'
import ConnectDataModal from '@/components/ConnectDataModal'
import ConnectOpenRouter from '@/components/ConnectOpenRouter'

type Provider = 'claude' | 'openrouter'

const CACHE_KEY = 'claude_usage_cache'
const OR_CACHE_KEY = 'or_usage_cache'
const CACHE_TTL = 60 * 60 * 1000

function isEmptyUsage(data: UsageData | null): boolean {
  if (!data) return true
  return data.total.tokens === 0 && data.total.sessions === 0
}

function getCachedData(key = CACHE_KEY): { data: UsageData; ts: number } | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_TTL) { localStorage.removeItem(key); return null }
    return parsed
  } catch { return null }
}

function setCachedData(data: UsageData, key = CACHE_KEY) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch { /* ignore */ }
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [provider, setProvider] = useState<Provider>('claude')
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showClaudeModal, setShowClaudeModal] = useState(false)
  const [showORModal, setShowORModal] = useState(false)
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const refreshFromHandle = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setLoading(true)
    try {
      const { loadDataFromDirectory, parseAccountFromDir } = await import('@/lib/client-parser')
      const [data, account] = await Promise.all([
        loadDataFromDirectory(handle),
        parseAccountFromDir(handle),
      ])
      setUsageData(data)
      setAccountInfo(account)
      setLastUpdated(new Date())
      setCachedData(data)
    } catch (err) {
      console.error('Claude refresh failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchServerData = useCallback(async () => {
    setLoading(true)
    try {
      const [usageRes, accountRes] = await Promise.all([fetch('/api/usage'), fetch('/api/account')])
      if (usageRes.ok) {
        const data: UsageData = await usageRes.json()
        setUsageData(data)
        if (!isEmptyUsage(data)) setCachedData(data)
        else setShowClaudeModal(true)
      }
      if (accountRes.ok) setAccountInfo(await accountRes.json())
      setLastUpdated(new Date())
    } catch {
      setShowClaudeModal(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadOpenRouterData = useCallback(async () => {
    const key = getStoredORKey()
    if (!key) { setShowORModal(true); setLoading(false); return }
    const cached = getCachedData(OR_CACHE_KEY)
    if (cached) {
      setUsageData(cached.data)
      setAccountInfo({ email: 'OpenRouter', organization: '', plan: 'API' })
      setLastUpdated(new Date(cached.ts))
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchOpenRouterUsage(key)
      setUsageData(data)
      setAccountInfo({ email: 'OpenRouter', organization: '', plan: 'API' })
      setCachedData(data, OR_CACHE_KEY)
      setLastUpdated(new Date())
    } catch {
      setShowORModal(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      const orKey = getStoredORKey()
      if (orKey) {
        setProvider('openrouter')
        await loadOpenRouterData()
        return
      }
      const cached = getCachedData()
      if (cached) {
        setUsageData(cached.data)
        setLastUpdated(new Date(cached.ts))
        setLoading(false)
        fetch('/api/account').then(r => r.ok ? r.json() : null).then(d => d && setAccountInfo(d))
      }
      const savedHandle = await loadHandle()
      if (savedHandle && await verifyPermission(savedHandle)) {
        dirHandleRef.current = savedHandle
        if (!cached) await refreshFromHandle(savedHandle)
        return
      }
      if (!cached) await fetchServerData()
    }
    init()
  }, [fetchServerData, refreshFromHandle, loadOpenRouterData])

  useEffect(() => {
    const interval = setInterval(() => {
      if (provider === 'claude' && dirHandleRef.current) {
        refreshFromHandle(dirHandleRef.current)
      } else if (provider === 'openrouter') {
        const key = getStoredORKey()
        if (key) fetchOpenRouterUsage(key).then(data => {
          setUsageData(data); setCachedData(data, OR_CACHE_KEY); setLastUpdated(new Date())
        }).catch(() => {})
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [provider, refreshFromHandle])

  async function handleProviderChange(p: Provider) {
    setProvider(p)
    setUsageData(null)
    setAccountInfo(null)
    if (p === 'openrouter') {
      await loadOpenRouterData()
    } else {
      const cached = getCachedData()
      if (cached) { setUsageData(cached.data); setLastUpdated(new Date(cached.ts)); setLoading(false); return }
      if (dirHandleRef.current) await refreshFromHandle(dirHandleRef.current)
      else await fetchServerData()
    }
  }

  function handleClaudeDataLoaded(data: UsageData, dirHandle: FileSystemDirectoryHandle) {
    dirHandleRef.current = dirHandle
    saveHandle(dirHandle).catch(() => {})
    setUsageData(data); setLastUpdated(new Date()); setCachedData(data); setShowClaudeModal(false)
  }

  function handleORConnected() { setShowORModal(false); loadOpenRouterData() }

  async function handleRefresh() {
    if (provider === 'openrouter') {
      const key = getStoredORKey()
      if (!key) { setShowORModal(true); return }
      setLoading(true)
      try {
        const data = await fetchOpenRouterUsage(key)
        setUsageData(data); setCachedData(data, OR_CACHE_KEY); setLastUpdated(new Date())
      } finally { setLoading(false) }
    } else {
      if (dirHandleRef.current) await refreshFromHandle(dirHandleRef.current)
      else { localStorage.removeItem(CACHE_KEY); await fetchServerData() }
    }
  }

  // Prevent hydration mismatch — don't render browser-API-dependent UI on server
  if (!mounted) return <LoadingSkeleton />

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
      {showClaudeModal && (
        <ConnectDataModal onDataLoaded={handleClaudeDataLoaded} onDismiss={() => setShowClaudeModal(false)} />
      )}
      {showORModal && (
        <ConnectOpenRouter onConnected={handleORConnected} onDismiss={() => setShowORModal(false)} />
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
        <DashboardHeader
          lastUpdated={lastUpdated} onRefresh={handleRefresh} loading={loading}
          provider={provider} onProviderChange={handleProviderChange}
        />

        {loading && !usageData ? <LoadingSkeleton /> : (
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
            {provider === 'claude' && <SubscriptionSection data={usageData?.subscription} />}
          </>
        )}

        <div style={{
          textAlign: 'center', color: '#555555', fontSize: '0.75rem',
          marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #222222',
        }}>
          {provider === 'openrouter'
            ? 'Usage data from OpenRouter API · costs are estimates'
            : 'Token usage from your local Claude Code sessions · costs are estimates'}
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
          height: '120px', background: '#111111', borderRadius: '12px',
          marginBottom: '1rem', border: '1px solid #222222',
        }} />
      ))}
    </div>
  )
}
