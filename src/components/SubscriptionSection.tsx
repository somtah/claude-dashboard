interface Props {
  data?: {
    sessionUsage: number
    weeklyUsage: number
    weeklySonnet: number
  }
}

export default function SubscriptionSection({ data }: Props) {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid #222222',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        color: '#555555',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '1.5rem',
      }}>
        Subscription Usage
      </div>

      <div className="subscription-grid">
        <CircularGauge
          label="Session"
          percentage={data?.sessionUsage || 0}
          color="#06b6d4"
        />
        <CircularGauge
          label="Weekly"
          percentage={data?.weeklyUsage || 0}
          color="#f97316"
        />
        <CircularGauge
          label="Weekly Sonnet"
          percentage={data?.weeklySonnet || 0}
          color="#a855f7"
        />
      </div>
    </div>
  )
}

function CircularGauge({ label, percentage, color }: {
  label: string
  percentage: number
  color: string
}) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        style={{ maxWidth: '120px', maxHeight: '120px', display: 'block' }}
      >
        {/* Background track */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1a1a1a" strokeWidth="8" />
        {/* Progress arc — rotated around its own center */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Centered text inside SVG — always perfectly centered */}
        <text
          x="60" y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="18"
          fontWeight="700"
          fontFamily="inherit"
        >
          {percentage}%
        </text>
      </svg>
      <div style={{ color: '#888888', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', textAlign: 'center' }}>{label}</div>
    </div>
  )
}
