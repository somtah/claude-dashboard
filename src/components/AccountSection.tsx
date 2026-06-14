'use client'

import type { AccountData } from '@/lib/types'

interface AccountSectionProps {
  data: AccountData | null
  loading: boolean
}

function SkeletonLine({ width = '60%' }: { width?: string }) {
  return (
    <div
      className="skeleton"
      style={{ height: '16px', width, borderRadius: '4px' }}
    />
  )
}

function Field({
  label,
  value,
  loading,
}: {
  label: string
  value: string
  loading: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3125rem',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: '#555555',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {loading ? (
        <SkeletonLine width="80%" />
      ) : (
        <div
          style={{
            fontSize: '0.875rem',
            color: '#ffffff',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={value}
        >
          {value || '—'}
        </div>
      )}
    </div>
  )
}

export default function AccountSection({ data, loading }: AccountSectionProps) {
  const plan = data?.plan ?? 'Pro'
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid #222222',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
      }}
    >
      {/* Section title */}
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
        Account
      </div>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <Field
          label="Email"
          value={data?.email ?? ''}
          loading={loading}
        />
        <Field
          label="Organization"
          value={data?.organization ?? ''}
          loading={loading}
        />

        {/* Plan field with green dot */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3125rem',
            minWidth: '80px',
          }}
        >
          <div
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#555555',
              textTransform: 'uppercase',
            }}
          >
            Plan
          </div>
          {loading ? (
            <SkeletonLine width="60px" />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4375rem',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  flexShrink: 0,
                  boxShadow: '0 0 6px #22c55e88',
                }}
              />
              <span
                style={{
                  fontSize: '0.875rem',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                }}
              >
                {planLabel}
              </span>
            </div>
          )}
        </div>

        {/* API key preview */}
        {(data?.apiKeyPreview || loading) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3125rem',
              minWidth: '140px',
            }}
          >
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#555555',
                textTransform: 'uppercase',
              }}
            >
              API Key
            </div>
            {loading ? (
              <SkeletonLine width="120px" />
            ) : (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#888888',
                  fontFamily: 'monospace',
                }}
              >
                {data?.apiKeyPreview}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
