'use client'

import { ArrowDownLeft, ArrowUpRight, Database, HardDrive } from 'lucide-react'
import type { TodayStats } from '@/lib/types'

interface TokenUsageTodayProps {
  data: TodayStats | null
  loading: boolean
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function SkeletonBox() {
  return (
    <div
      className="skeleton"
      style={{ height: '48px', borderRadius: '6px', width: '100%' }}
    />
  )
}

interface StatRowProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  loading: boolean
}

function StatRow({ icon, label, value, color, loading }: StatRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color, display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
        <span style={{ fontSize: '0.8125rem', color: '#888888' }}>{label}</span>
      </div>
      {loading ? (
        <div
          className="skeleton"
          style={{ height: '14px', width: '50px', borderRadius: '3px' }}
        />
      ) : (
        <span
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: '#ffffff',
            fontFamily: 'monospace',
          }}
        >
          {value}
        </span>
      )}
    </div>
  )
}

export default function TokenUsageToday({ data, loading }: TokenUsageTodayProps) {
  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid #222222',
        borderRadius: '10px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.875rem',
        }}
      >
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#555555',
            textTransform: 'uppercase',
          }}
        >
          Today
        </div>
        {!loading && data && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#f97316',
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            {formatNum(data.total)} total
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <StatRow
          icon={<ArrowDownLeft size={13} />}
          label="Input"
          value={formatNum(data?.input ?? 0)}
          color="#06b6d4"
          loading={loading}
        />
        <StatRow
          icon={<ArrowUpRight size={13} />}
          label="Output"
          value={formatNum(data?.output ?? 0)}
          color="#22c55e"
          loading={loading}
        />
        <StatRow
          icon={<Database size={13} />}
          label="Cache Read"
          value={formatNum(data?.cacheRead ?? 0)}
          color="#a855f7"
          loading={loading}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HardDrive size={13} />
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#888888' }}>
              Cache Write
            </span>
          </div>
          {loading ? (
            <div
              className="skeleton"
              style={{ height: '14px', width: '50px', borderRadius: '3px' }}
            />
          ) : (
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: 'monospace',
              }}
            >
              {formatNum(data?.cacheWrite ?? 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
