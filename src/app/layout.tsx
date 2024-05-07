import type { ReactNode } from 'react'

import { description, ogImage, title, url } from '@/utils/consts'

import './globals.css'

import { GeistMono } from 'geist/font/mono'
import { Header } from '@/components/header'

export const metadata = {
  title: {
    default: title,
    template: '%s | Esaú Morais',
  },
  description,
  openGraph: {
    locale: 'en-UK',
    type: 'website',
    url: url,
    title: title,
    description: description,
    images: { url: ogImage, width: 1600, height: 630 },
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: {
      url: ogImage,
      width: 1600,
      height: 630,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    shortcut: '/favicon.ico',
  },
}

const NAV_ITEMS = [
  {
    path: 'https://linkedin.com/in/emmorais',
    label: 'in',
  },
  {
    path: 'https://x.com/_3morais',
    label: '𝕏',
  },
] as const

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" className={GeistMono.variable} suppressHydrationWarning>
      <head />
      <body className="relative min-h-dvh w-full bg-[#181825] text-[#cdd6f4]">
        <Header />

        <main className="my-20 min-h-[calc(100dvh-80px-160px)]">
          {children}
        </main>

        <footer className="fixed inset-x-0 bottom-0 flex h-10 divide-x border-t border-[#313244] bg-[#1e1e2e]/80 backdrop-blur-sm">
          <span className="flex cursor-default items-center border-[#313244] bg-[#11111b] px-4 text-[#cdd6f4] last:!border-r">
            Socials
          </span>
          {NAV_ITEMS.map((item, idx) => (
            <a
              key={idx}
              className="flex items-center border-[#313244] px-4 text-[#cdd6f4] last:!border-r hover:bg-[#11111b] focus:bg-[#11111b] focus:outline-none"
              href={item.path}
            >
              {item.label}
            </a>
          ))}
        </footer>
      </body>
    </html>
  )
}

export default RootLayout
