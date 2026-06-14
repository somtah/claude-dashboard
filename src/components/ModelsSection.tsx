import { ModelUsage } from '@/lib/types'

interface Props {
  models?: ModelUsage[]
}

const MODEL_COLORS: Record<string, string> = {
  Opus: '#a855f7',
  Fable: '#ec4899',
  Sonnet: '#f97316',
  Haiku: '#06b6d4',
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function ModelsSection({ models }: Props) {
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
        Models (7d)
      </div>

      {(!models || models.length === 0) ? (
        <div style={{ color: '#444444', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          No model data available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {models.map((model) => {
            const color = MODEL_COLORS[model.model] || '#888888'
            return (
              <div key={model.model}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#cccccc' }}>{model.model}</span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#555555' }}>{formatTokens(model.tokens)}</span>
                    <span style={{ fontSize: '0.75rem', color, fontWeight: '600', minWidth: '35px', textAlign: 'right' }}>
                      {model.percentage}%
                    </span>
                  </div>
                </div>
                <div style={{
                  height: '6px',
                  background: '#1a1a1a',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${model.percentage}%`,
                    background: color,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
