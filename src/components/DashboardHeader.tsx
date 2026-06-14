'use client'

import { RefreshCw, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DashboardHeaderProps {
  lastUpdated: string
  onRefresh: () => void
  isRefreshing: boolean
}

export default function DashboardHeader({
  lastUpdated,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch {
      setLoggingOut(false)
    }
  }

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--'

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <header
      style={{
        borderBottom: '1px solid #222222',
        backgroundColor: '#0a0a0a',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.375rem' }}>🔷</span>
          <div>
            <div
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#ffffff',
                fontFamily: 'monospace',
                lineHeight: 1.2,
              }}
            >
              CLAUDE CODE
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: '#888888',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
              }}
            >
              Account &amp; Usage Dashboard
            </div>
          </div>
        </div>

        {/* Right: timestamp + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {lastUpdated && (
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#f97316',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {formattedTime}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#555555' }}>
                {formattedDate}
              </div>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4375rem 0.875rem',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '6px',
              color: '#cccccc',
              fontSize: '0.8125rem',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.borderColor = '#f97316'
                e.currentTarget.style.color = '#f97316'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333333'
              e.currentTarget.style.color = '#cccccc'
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4375rem 0.875rem',
              backgroundColor: 'transparent',
              border: '1px solid #333333',
              borderRadius: '6px',
              color: '#888888',
              fontSize: '0.8125rem',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              opacity: loggingOut ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!loggingOut) {
                e.currentTarget.style.borderColor = '#ef4444'
                e.currentTarget.style.color = '#ef4444'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333333'
              e.currentTarget.style.color = '#888888'
            }}
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  )
}
