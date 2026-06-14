'use client'

import type { TotalStats } from '@/lib/types'

interface TokenUsageTotalProps {
  data: TotalStats | null
  loading: boolean
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function formatCost(n: number): string {
  return '$' + n.toFixed(2)
}

function Stat({
  label,
  value,
  loading,
  small,
}: {
  label: string
  value: string
  loading: boolean
  small?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div
        style={{
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: '#555555',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {loading ? (
        <div
          className="skeleton"
          style={{
            height: small ? '16px' : '20px',
            width: '60px',
            borderRadius: '3px',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: small ? '0.875rem' : '1rem',
            fontWeight: 600,
            color: '#cccccc',
            fontFamily: 'monospace',
          }}
        >
          {value}
        </div>
      )}
    </div>
  )
}

export default function TokenUsageTotal({ data, loading }: TokenUsageTotalProps) {
  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid #222222',
        borderRadius: '10px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Card header */}
      <div
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: '#555555',
          textTransform: 'uppercase',
        }}
      >
        Total (All Time)
      </div>

      {/* Big token count */}
      <div>
        {loading ? (
          <div
            className="skeleton"
            style={{ height: '40px', width: '120px', borderRadius: '6px' }}
          />
        ) : (
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}
          >
            {formatNum(data?.totalTokens ?? 0)}
          </div>
        )}
        <div
          style={{
            fontSize: '0.6875rem',
            color: '#555555',
            marginTop: '0.25rem',
          }}
        >
          total tokens
        </div>
      </div>

      {/* Meta stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.875rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #1a1a1a',
        }}
      >
        <Stat
          label="API Equiv"
          value={formatCost(data?.estimatedCost ?? 0)}
          loading={loading}
          small
        />
        <Stat
          label="Sessions"
          value={String(data?.sessions ?? 0)}
          loading={loading}
          small
        />
        <Stat
          label="Messages"
          value={formatNum(data?.messages ?? 0)}
          loading={loading}
          small
        />
      </div>
    </div>
  )
}
