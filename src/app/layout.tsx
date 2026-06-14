import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Claude Code Dashboard',
  description: 'Account & Usage Dashboard for Claude Code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
