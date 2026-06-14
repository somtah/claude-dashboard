'use client'

import { useState } from 'react'
import { fetchOpenRouterKeyInfo, saveORKey } from '@/lib/openrouter'

interface Props {
  onConnected: () => void
  onDismiss: () => void
}

export default function ConnectOpenRouter({ onConnected, onDismiss }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyInfo, setKeyInfo] = useState<{ label: string; usage: number; limit: number | null; is_free_tier: boolean } | null>(null)

  async function handleConnect() {
    if (!apiKey.trim()) {
      setError('กรุณากรอก API key')
      return
    }
    setError('')
    setLoading(true)
    try {
      const info = await fetchOpenRouterKeyInfo(apiKey.trim())
      setKeyInfo(info)
      saveORKey(apiKey.trim())
      // Brief pause to show the verified info before closing
      setTimeout(() => {
        onConnected()
      }, 800)
    } catch (err: any) {
      setError(err?.message ?? 'ไม่สามารถเชื่อมต่อได้ ตรวจสอบ API key อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleConnect()
  }

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Modal card */}
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔶</div>

        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
          Connect OpenRouter
        </h2>
        <p style={{ color: '#888', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          ใส่ OpenRouter API key เพื่อดู usage และค่าใช้จ่าย
          <br />
          <span style={{ color: '#555', fontSize: '0.75rem' }}>
            สร้าง key ได้ที่{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6366f1', textDecoration: 'none' }}
            >
              openrouter.ai/keys
            </a>
          </span>
        </p>

        {keyInfo ? (
          <div
            style={{
              backgroundColor: '#0f1a0f',
              border: '1px solid #1a3a1a',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'left',
            }}
          >
            <div style={{ color: '#4ade80', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              ✓ เชื่อมต่อสำเร็จ
            </div>
            {keyInfo.label && (
              <div style={{ color: '#888', fontSize: '0.8rem' }}>
                Key: <span style={{ color: '#fff' }}>{keyInfo.label}</span>
              </div>
            )}
            <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              ใช้ไปแล้ว:{' '}
              <span style={{ color: '#f97316' }}>
                ${keyInfo.usage.toFixed(4)}
              </span>
              {keyInfo.limit != null && (
                <span style={{ color: '#555' }}> / ${keyInfo.limit.toFixed(2)}</span>
              )}
            </div>
            {keyInfo.is_free_tier && (
              <div style={{ color: '#6366f1', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Free tier
              </div>
            )}
          </div>
        ) : (
          <>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="sk-or-v1-..."
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                outline: 'none',
                marginBottom: '0.75rem',
                boxSizing: 'border-box',
                opacity: loading ? 0.7 : 1,
              }}
            />

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.75rem', textAlign: 'left' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleConnect}
              disabled={loading || !apiKey.trim()}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading || !apiKey.trim()
                  ? '#333'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: loading || !apiKey.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !apiKey.trim() ? 0.7 : 1,
                marginBottom: '0.75rem',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'กำลังตรวจสอบ...' : 'Connect'}
            </button>
          </>
        )}

        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#555',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          ยกเลิก
        </button>
      </div>
    </div>
  )
}
