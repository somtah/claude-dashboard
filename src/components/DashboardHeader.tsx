'use client'

import { RefreshCw } from 'lucide-react'

type Provider = 'claude' | 'openrouter'

interface Props {
  lastUpdated: Date
  onRefresh: () => void
  loading: boolean
  provider: Provider
  onProviderChange: (p: Provider) => void
}

export default function DashboardHeader({ lastUpdated, onRefresh, loading, provider, onProviderChange }: Props) {
  const timeStr = lastUpdated.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const title = provider === 'openrouter' ? '🔶 OPENROUTER' : '🔷 CLAUDE CODE'
  const subtitle = 'Account & Usage Dashboard'

  return (
    <div className="dashboard-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            letterSpacing: '0.08em',
            marginBottom: '0.125rem',
          }}>
            {title}
          </div>
          <div style={{ color: '#888888', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {subtitle}
          </div>
        </div>

        {/* Provider switcher pills */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            onClick={() => onProviderChange('claude')}
            style={{
              padding: '0.25rem 0.625rem',
              borderRadius: '6px',
              border: provider === 'claude' ? '1px solid #f97316' : '1px solid #333',
              background: provider === 'claude' ? 'rgba(249,115,22,0.12)' : 'transparent',
              color: provider === 'claude' ? '#f97316' : '#555',
              fontSize: '0.6875rem',
              fontWeight: provider === 'claude' ? 600 : 400,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
          >
            🔷 Claude
          </button>
          <button
            onClick={() => onProviderChange('openrouter')}
            style={{
              padding: '0.25rem 0.625rem',
              borderRadius: '6px',
              border: provider === 'openrouter' ? '1px solid #6366f1' : '1px solid #333',
              background: provider === 'openrouter' ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: provider === 'openrouter' ? '#6366f1' : '#555',
              fontSize: '0.6875rem',
              fontWeight: provider === 'openrouter' ? 600 : 400,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
          >
            🔶 OpenRouter
          </button>
        </div>
      </div>

      <div className="header-actions">
        <div style={{ color: '#555555', fontSize: '0.75rem' }}>
          Updated {timeStr}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            background: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            color: loading ? '#555555' : '#888888',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={14} style={{
            animation: loading ? 'spin 1s linear infinite' : 'none',
          }} />
          Refresh
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </button>
      </div>
    </div>
  )
}
