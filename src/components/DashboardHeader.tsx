'use client'

import { RefreshCw, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  lastUpdated: Date
  onRefresh: () => void
  loading: boolean
}

export default function DashboardHeader({ lastUpdated, onRefresh, loading }: Props) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const timeStr = lastUpdated.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="dashboard-header">
      <div>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          letterSpacing: '0.08em',
          marginBottom: '0.125rem',
        }}>
          🔷 CLAUDE CODE
        </div>
        <div style={{ color: '#888888', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Account & Usage Dashboard
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
        <button
          onClick={handleLogout}
          style={{
            background: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            color: '#888888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  )
}
