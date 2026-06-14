'use client'

import { useState } from 'react'
import { isFileSystemAccessSupported, pickClaudeDirectory, loadDataFromDirectory } from '@/lib/client-parser'
import type { UsageData } from '@/lib/types'

interface Props {
  onDataLoaded: (data: UsageData) => void
  onDismiss: () => void
}

export default function ConnectDataModal({ onDataLoaded, onDismiss }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supported = isFileSystemAccessSupported()

  async function handleConnect() {
    setError('')
    setLoading(true)
    try {
      const dirHandle = await pickClaudeDirectory()
      const data = await loadDataFromDirectory(dirHandle)
      onDataLoaded(data)
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError('ไม่สามารถอ่านไฟล์ได้ ลองเลือก ~/.claude folder อีกครั้ง')
      }
    } finally {
      setLoading(false)
    }
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
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📂</div>

        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
          เชื่อมต่อข้อมูล Claude
        </h2>
        <p style={{ color: '#888', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          เลือกโฟลเดอร์{' '}
          <code style={{ color: '#f97316', fontFamily: 'monospace', fontSize: '0.875rem' }}>~/.claude</code>
          {' '}เพื่อโหลดข้อมูล token usage
          <br />
          <span style={{ color: '#555', fontSize: '0.75rem' }}>ไฟล์อ่านในเบราว์เซอร์โดยตรง ไม่มีการอัปโหลด</span>
        </p>

        {supported ? (
          <>
            <button
              onClick={handleConnect}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#333' : 'linear-gradient(135deg, #f97316, #f59e0b)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: '0.75rem',
              }}
            >
              {loading ? 'กำลังอ่านไฟล์...' : 'เลือก ~/.claude folder'}
            </button>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{error}</p>
            )}
          </>
        ) : (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            padding: '0.875rem',
            color: '#888',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            marginBottom: '0.75rem',
          }}>
            <strong style={{ color: '#fff' }}>Browser ไม่รองรับ</strong>
            <br />
            ใช้ Chrome หรือ Edge และรองรับ File System Access API
          </div>
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
          ข้ามไปก่อน
        </button>
      </div>
    </div>
  )
}
