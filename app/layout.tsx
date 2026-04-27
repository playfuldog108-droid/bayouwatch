import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400','500','700'],
  variable: '--font-mono',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'BayouWatch — Houston Flood Alert System',
  description: 'Real-time flood monitoring for Houston',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}
