'use client'

interface GaugeData {
  label: string
  percentage: number
  color: string
  used: string
  limit: string
}

const MOCK_GAUGES: GaugeData[] = [
  {
    label: 'Session',
    percentage: 6,
    color: '#f97316',
    used: '6%',
    limit: '100%',
  },
  {
    label: 'Weekly',
    percentage: 29,
    color: '#a855f7',
    used: '29%',
    limit: '100%',
  },
  {
    label: 'Weekly·Sonnet',
    percentage: 0,
    color: '#06b6d4',
    used: '0%',
    limit: '100%',
  },
]

interface CircularGaugeProps {
  label: string
  percentage: number
  color: string
  used: string
}

function CircularGauge({ label, percentage, color, used }: CircularGaugeProps) {
  const size = 96
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        flex: 1,
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e1e1e"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
          }}
        >
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}
          >
            {percentage}%
          </span>
          <span style={{ fontSize: '0.5625rem', color: '#555555' }}>used</span>
        </div>
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          color: '#888888',
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  )
}

export default function SubscriptionSection() {
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
          marginBottom: '1.25rem',
        }}
      >
        Subscription Usage
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
        }}
      >
        {MOCK_GAUGES.map((gauge) => (
          <CircularGauge
            key={gauge.label}
            label={gauge.label}
            percentage={gauge.percentage}
            color={gauge.color}
            used={gauge.used}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {MOCK_GAUGES.map((gauge) => (
          <div
            key={gauge.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4375rem',
              fontSize: '0.75rem',
              color: '#666666',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: gauge.color,
                flexShrink: 0,
              }}
            />
            <span>{gauge.label}</span>
            <span style={{ color: gauge.color, fontFamily: 'monospace', fontWeight: 600 }}>
              {gauge.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
