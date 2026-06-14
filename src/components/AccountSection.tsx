import { AccountInfo } from '@/lib/types'
import { useLang } from '@/context/LangContext'

interface Props {
  account: AccountInfo | null
}

export default function AccountSection({ account }: Props) {
  const { tr } = useLang()
  const email = account?.email
  const showEmail = email && email !== 'Unknown'
  const plan = account?.plan || 'Pro'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: showEmail ? '1fr auto' : '1fr',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'stretch',
      }}
    >
      {/* Plan badge — always shown */}
      <div style={{
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)',
          flexShrink: 0,
        }} />
        <div>
          <div style={{ color: '#555', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {tr.account}
          </div>
          <span style={{ fontSize: '0.875rem', color: '#cccccc' }}>
            {showEmail ? email : tr.connected} · <span style={{ color: '#f97316' }}>{plan}</span>
          </span>
        </div>
      </div>

      {/* Email card — only shown when available */}
      {showEmail && (
        <div style={{
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          minWidth: '200px',
        }}>
          <div style={{ color: '#555', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
            {tr.email}
          </div>
          <span style={{ fontSize: '0.875rem', color: '#cccccc', wordBreak: 'break-all' }}>{email}</span>
        </div>
      )}
    </div>
  )
}
