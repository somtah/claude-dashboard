'use client'

import type { WeeklyStats } from '@/lib/types'
import { Flame } from 'lucide-react'

interface TokenUsageWeekProps {
  data: WeeklyStats | null
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

export default function TokenUsageWeek({ data, loading }: TokenUsageWeekProps) {
  // Mini bar chart for daily breakdown
  const maxVal = data?.dailyBreakdown
    ? Math.max(...data.dailyBreakdown.map((d) => d.total), 1)
    : 1

  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid #222222',
        borderRadius: '10px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          This Week
        </div>
        {!loading && data && data.streakDays > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#f97316',
              fontWeight: 600,
            }}
          >
            <Flame size={13} />
            <span>{data.streakDays}d streak</span>
          </div>
        )}
      </div>

      {/* Big number */}
      <div>
        {loading ? (
          <div
            className="skeleton"
            style={{ height: '40px', width: '130px', borderRadius: '6px' }}
          />
        ) : (
          <div
            style={{
              fontSize: '2.25rem',
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
          tokens this week
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #1a1a1a',
        }}
      >
        {[
          { label: 'Cost', value: formatCost(data?.estimatedCost ?? 0) },
          { label: 'Sessions', value: String(data?.sessions ?? 0) },
          { label: 'Messages', value: formatNum(data?.messages ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div
              style={{
                fontSize: '0.5625rem',
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
                style={{ height: '14px', width: '50px', borderRadius: '3px' }}
              />
            ) : (
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#cccccc',
                  fontFamily: 'monospace',
                }}
              >
                {value}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      {!loading && data?.dailyBreakdown && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '36px',
            paddingTop: '0.25rem',
          }}
        >
          {data.dailyBreakdown.map((day, i) => {
            const heightPct = maxVal > 0 ? (day.total / maxVal) * 100 : 0
            const isToday = i === data.dailyBreakdown.length - 1
            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
                title={`${day.label}: ${formatNum(day.total)} tokens`}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(heightPct, day.total > 0 ? 8 : 3)}%`,
                    backgroundColor: isToday ? '#f97316' : '#333333',
                    borderRadius: '2px 2px 0 0',
                    minHeight: day.total > 0 ? '3px' : '2px',
                    transition: 'height 0.3s ease',
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
      {!loading && data?.dailyBreakdown && (
        <div style={{ display: 'flex', gap: '3px' }}>
          {data.dailyBreakdown.map((day, i) => (
            <div
              key={day.date}
              style={{
                flex: 1,
                fontSize: '0.5625rem',
                color: i === data.dailyBreakdown.length - 1 ? '#f97316' : '#444444',
                textAlign: 'center',
              }}
            >
              {day.label.slice(0, 2)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
