interface Props {
  data?: {
    tokens: number
    sessions: number
    messages: number
    estimatedCost: number
  }
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function TokenUsageTotal({ data }: Props) {
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
        Total
      </div>

      <div style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        lineHeight: '1',
        marginBottom: '0.25rem',
        background: 'linear-gradient(135deg, #f97316, #f59e0b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {formatTokens(data?.tokens || 0)}
      </div>
      <div style={{ color: '#555555', fontSize: '0.75rem', marginBottom: '1rem' }}>
        total tokens
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <StatItem label="API equiv" value={`~$${(data?.estimatedCost || 0).toFixed(2)}`} />
        <StatItem label="Sessions" value={(data?.sessions || 0).toString()} />
        <StatItem label="Messages" value={formatTokens(data?.messages || 0)} />
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#0a0a0a',
      borderRadius: '8px',
      padding: '0.5rem',
      textAlign: 'center',
    }}>
      <div style={{ color: '#555555', fontSize: '0.6rem', marginBottom: '0.125rem' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{value}</div>
    </div>
  )
}
