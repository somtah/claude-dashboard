'use client'

import type { ModelUsage } from '@/lib/types'

interface ModelsSectionProps {
  data: ModelUsage[] | null
  loading: boolean
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function ModelsSection({ data, loading }: ModelsSectionProps) {
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
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: '#555555',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        Models (7d)
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div className="skeleton" style={{ height: '12px', width: '80px', borderRadius: '3px' }} />
              <div className="skeleton" style={{ height: '6px', borderRadius: '3px' }} />
            </div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div
          style={{
            color: '#444444',
            fontSize: '0.8125rem',
            textAlign: 'center',
            padding: '1.5rem 0',
          }}
        >
          No model data for the past 7 days
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {data.map((model) => (
            <div key={model.model} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: model.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: '#cccccc',
                      fontWeight: 500,
                    }}
                  >
                    {model.displayName}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#888888',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatNum(model.tokens)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: model.color,
                      fontFamily: 'monospace',
                      minWidth: '32px',
                      textAlign: 'right',
                    }}
                  >
                    {model.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '5px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${model.percentage}%`,
                    backgroundColor: model.color,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
