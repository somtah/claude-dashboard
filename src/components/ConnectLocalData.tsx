'use client'

import { useState } from 'react'
import { isFileSystemAccessSupported, pickClaudeDirectory, loadDataFromDirectory } from '@/lib/client-parser'
import type { UsageData } from '@/lib/types'

interface Props {
  onDataLoaded: (data: UsageData, dirName: string) => void
}

export default function ConnectLocalData({ onDataLoaded }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supported = isFileSystemAccessSupported()

  async function handleConnect() {
    setError('')
    setLoading(true)
    try {
      const dirHandle = await pickClaudeDirectory()
      const data = await loadDataFromDirectory(dirHandle)
      onDataLoaded(data, dirHandle.name)
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // user cancelled
      } else {
        setError('Failed to read directory. Make sure you selected your ~/.claude folder.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px dashed #333333',
        borderRadius: '12px',
        padding: '2.5rem',
        textAlign: 'center',
        marginBottom: '1rem',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📂</div>
      <h3
        style={{
          color: '#ffffff',
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
        }}
      >
        Connect your Claude data
      </h3>
      <p style={{ color: '#888888', fontSize: '0.8125rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Select your <code style={{ color: '#f97316', fontFamily: 'monospace' }}>~/.claude</code> folder
        to load token usage from your local Claude Code sessions.
        <br />
        Files are read directly in your browser — no data is uploaded.
      </p>

      {supported ? (
        <>
          <button
            onClick={handleConnect}
            disabled={loading}
            style={{
              padding: '0.625rem 1.5rem',
              background: loading
                ? '#333333'
                : 'linear-gradient(135deg, #f97316, #f59e0b)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Reading files...' : 'Select ~/.claude folder'}
          </button>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.75rem' }}>
              {error}
            </p>
          )}

          <p style={{ color: '#444444', fontSize: '0.6875rem', marginTop: '1rem' }}>
            Works in Chrome and Edge. Safari/Firefox not yet supported.
          </p>
        </>
      ) : (
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            padding: '1rem',
            color: '#888888',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: '#ffffff' }}>Browser not supported.</strong>
          <br />
          Please use Chrome or Edge, or run the app locally with{' '}
          <code style={{ color: '#f97316', fontFamily: 'monospace' }}>npm run dev</code>{' '}
          for automatic data loading.
        </div>
      )}
    </div>
  )
}
