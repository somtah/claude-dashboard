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
    if (!apiKey.trim()) {
      setError('Please enter your API key.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error ?? 'Invalid API key. Please check and try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '12px',
          padding: '2.5rem',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🔷</span>
            <span
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#ffffff',
                fontFamily: 'monospace',
              }}
            >
              CLAUDE CODE
            </span>
          </div>
          <p
            style={{
              color: '#888888',
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
            }}
          >
            Account &amp; Usage Dashboard
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: '#222222',
            marginBottom: '2rem',
          }}
        />

        {/* Form */}
        <form onSubmit={handleLogin}>
          <p
            style={{
              color: '#888888',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}
          >
            Enter your Anthropic API key to continue
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#0a0a0a',
                border: `1px solid ${error ? '#ef4444' : '#333333'}`,
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontFamily: 'monospace',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = '#f97316'
              }}
              onBlur={(e) => {
                if (!error) e.currentTarget.style.borderColor = '#333333'
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '0.625rem 0.875rem',
                marginBottom: '1rem',
                color: '#ef4444',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading
                ? '#333333'
                : 'linear-gradient(135deg, #f97316, #f59e0b)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        {/* Footer note */}
        <p
          style={{
            color: '#555555',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          Your API key is stored locally in a secure session cookie and never
          sent to any third-party servers.
        </p>
      </div>
    </div>
  )
}
