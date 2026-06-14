import { useLang } from '@/context/LangContext'

interface Props {
  data?: {
    tokens: number
    estimatedCost: number
    sessions: number
    messages: number
    streak: number
    dailyBreakdown: Array<{ date: string; tokens: number }>
  }
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function TokenUsageWeek({ data }: Props) {
  const { tr, fmt } = useLang()
  const maxTokens = Math.max(...(data?.dailyBreakdown?.map(d => d.tokens) || [1]))

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #222222',
      borderRadius: '12px',
      padding: '1.25rem',
    }}>
      <div style={{
        color: '#555555',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}>
        {tr.thisWeek}
      </div>

      <div style={{
        fontSize: '1.75rem',
        fontWeight: '700',
        lineHeight: '1',
        marginBottom: '0.125rem',
        color: '#f97316',
      }}>
        {formatTokens(data?.tokens || 0)}
      </div>
      <div style={{ color: '#555555', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
        {fmt(data?.estimatedCost || 0)} {tr.estimated}
      </div>

      <div className="week-stats-grid">
        <StatItem label={tr.sessions} value={(data?.sessions || 0).toString()} />
        <StatItem label={tr.messages} value={formatTokens(data?.messages || 0)} />
        <StatItem label={tr.streak} value={`${data?.streak || 0}d`} color="#f59e0b" />
        <StatItem label={tr.days} value="7" />
      </div>

      {/* Mini bar chart */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '3px',
        height: '40px',
      }}>
        {(data?.dailyBreakdown || []).map((day, i) => {
          const height = maxTokens > 0 ? (day.tokens / maxTokens) * 40 : 2
          return (
            <div
              key={i}
              title={`${day.date}: ${formatTokens(day.tokens)}`}
              style={{
                flex: 1,
                height: `${Math.max(height, 2)}px`,
                background: day.tokens > 0
                  ? 'linear-gradient(180deg, #f97316, #f59e0b)'
                  : '#222222',
                borderRadius: '2px',
                transition: 'height 0.3s',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: '#0a0a0a',
      borderRadius: '8px',
      padding: '0.5rem',
      textAlign: 'center',
    }}>
      <div style={{ color: '#555555', fontSize: '0.6rem', marginBottom: '0.125rem' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: color || 'white' }}>{value}</div>
    </div>
  )
}
