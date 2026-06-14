'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid API key')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Background glow effect */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '16px',
        padding: '2.5rem',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
          }}>
            🔷 CLAUDE CODE
          </div>
          <div style={{
            color: '#888888',
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
          }}>
            Account & Usage Dashboard
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#222222', marginBottom: '2rem' }} />

        <p style={{
          color: '#888888',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Enter your Anthropic API key to continue
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#888888',
              fontSize: '0.75rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #333333',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'monospace',
              }}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#333333'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading || !apiKey.trim()
                ? '#333333'
                : 'linear-gradient(135deg, #f97316, #f59e0b)',
              border: 'none',
              borderRadius: '8px',
              color: loading || !apiKey.trim() ? '#888888' : 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: loading || !apiKey.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <p style={{
          color: '#555555',
          fontSize: '0.75rem',
          textAlign: 'center',
          marginTop: '1.5rem',
          lineHeight: '1.6',
        }}>
          Your API key is stored locally in a secure session cookie and never sent to any third-party servers.
        </p>
      </div>
    </div>
  )
}
