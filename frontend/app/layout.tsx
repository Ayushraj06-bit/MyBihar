import type { Metadata, Viewport } from 'next'
import { preload } from 'react-dom'
import { GoogleAnalytics } from '@next/third-parties/google'
import { AppProviders } from '@/components/providers/AppProviders'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'My Bihar',
    template: '%s — My Bihar',
  },
  description: 'A state, shot like a film. Ghats, ruins, litti and the long way home for Chhath.',
  icons: {
    icon: [{ url: '/micon.png', type: 'image/png' }],
    apple: '/micon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0d1012',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* Self-hosted, font-display: swap, and preloaded for the two Latin faces. design.md §14 */
  preload('/fonts/clear-sans-text.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' })
  preload('/fonts/clear-sans-display.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' })

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
      {/* loads after hydration and records client-side navigations too */}
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  )
}
