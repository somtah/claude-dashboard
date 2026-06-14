'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyUsage } from '@/lib/types'

interface UsageTrendChartProps {
  data: DailyUsage[] | null
  loading: boolean
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

interface TooltipPayload {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '6px',
        padding: '0.625rem 0.875rem',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: '#888888',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: '#f97316',
          fontFamily: 'monospace',
        }}
      >
        {formatNum(payload[0].value)}
        <span style={{ fontSize: '0.6875rem', color: '#666666', marginLeft: '3px' }}>
          tokens
        </span>
      </div>
    </div>
  )
}

export default function UsageTrendChart({ data, loading }: UsageTrendChartProps) {
  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid #222222',
        borderRadius: '10px',
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
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
          Usage Trend (7d)
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.6875rem',
            color: '#666666',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '2px',
              backgroundColor: '#f97316',
              borderRadius: '1px',
            }}
          />
          Total tokens/day
        </div>
      </div>

      {loading ? (
        <div
          className="skeleton"
          style={{ height: '180px', borderRadius: '6px' }}
        />
      ) : !data || data.every((d) => d.total === 0) ? (
        <div
          style={{
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#444444',
            fontSize: '0.875rem',
          }}
        >
          No usage data for the past 7 days
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e1e1e"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#555555' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatNum}
              tick={{ fontSize: 10, fill: '#444444' }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333333' }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#tokenGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#f97316', stroke: '#0a0a0a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
