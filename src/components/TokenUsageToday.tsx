import { TokenUsage } from '@/lib/types'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
  data?: TokenUsage
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function TokenUsageToday({ data }: Props) {
  const input = data?.input || 0
  const output = data?.output || 0
  const cacheRead = data?.cacheRead || 0
  const cacheWrite = data?.cacheWrite || 0

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
        marginBottom: '1rem',
      }}>
        Today
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <UsageItem icon={<ArrowDown size={12} />} label="Input" value={formatTokens(input)} color="#06b6d4" />
        <UsageItem icon={<ArrowUp size={12} />} label="Output" value={formatTokens(output)} color="#a855f7" />
        <UsageItem icon={<ArrowDown size={12} />} label="Cache Read" value={formatTokens(cacheRead)} color="#22c55e" />
        <UsageItem icon={<ArrowUp size={12} />} label="Cache Write" value={formatTokens(cacheWrite)} color="#f97316" />
      </div>
    </div>
  )
}

function UsageItem({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div style={{
      background: '#0a0a0a',
      borderRadius: '8px',
      padding: '0.625rem 0.75rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        color: color,
        marginBottom: '0.25rem',
      }}>
        {icon}
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white' }}>
        {value}
      </div>
    </div>
  )
}
