'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DailyUsage {
  date: string
  tokens: number
}

interface Props {
  data?: DailyUsage[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function UsageTrendChart({ data }: Props) {
  const chartData = (data || []).map(d => ({
    date: formatDate(d.date),
    tokens: d.tokens,
  }))

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #222222',
      borderRadius: '12px',
      padding: '1.25rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{
          color: '#555555',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Usage Trend (7d)
        </div>
        <div style={{ color: '#f97316', fontSize: '0.65rem' }}>Tokens/Day</div>
      </div>

      <div style={{ height: '160px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#555555', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#555555', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatTokens}
              width={45}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.75rem',
              }}
              formatter={(value: number) => [formatTokens(value), 'Tokens']}
              labelStyle={{ color: '#888888' }}
            />
            <Area
              type="monotone"
              dataKey="tokens"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#tokenGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
