import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'DUAL - Break Echo Chambers',
  description: 'A social debate platform that displays every post as a split-screen narrative',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="dark">{children}</body>
    </html>
  )
}

