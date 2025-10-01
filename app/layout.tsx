import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebUSB POS Printer',
  description: 'Print receipts directly to thermal printers using WebUSB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
