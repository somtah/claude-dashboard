import { AccountInfo } from '@/lib/types'

interface Props {
  account: AccountInfo | null
}

export default function AccountSection({ account }: Props) {
  return (
    <div className="account-grid">
      <InfoCard label="EMAIL" value={account?.email || 'Unknown'} />
      <InfoCard label="ORGANIZATION" value={account?.organization || 'Unknown'} />
      <InfoCard label="PLAN" value={account?.plan || 'Pro'} isActive />
    </div>
  )
}

function InfoCard({ label, value, isActive }: { label: string; value: string; isActive?: boolean }) {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid #222222',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
    }}>
      <div style={{
        color: '#555555',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.375rem',
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {isActive && (
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 6px rgba(34,197,94,0.6)',
            flexShrink: 0,
          }} />
        )}
        <span style={{ fontSize: '0.875rem', color: '#cccccc' }}>{value}</span>
      </div>
    </div>
  )
}
