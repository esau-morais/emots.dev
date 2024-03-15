import { Space_Grotesk as FontSans } from 'next/font/google'

import { Container } from '@/components/Container'
import { BottomBar } from '@/components/NavigationMenu'
import { cn } from '@/utils/classNames'
import { description, url, title, ogImage } from '@/utils/consts'

import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-space_grotesk',
  display: 'swap',
})

export const metadata = {
  title,
  description,
  openGraph: {
    locale: 'en-UK',
    type: 'website',
    url: url,
    title: title,
    description: description,
    images: {
      url: ogImage,
      width: 1600,
      height: 630,
    },
  },
  twitter: {
    card: 'summary_large_image',
    url: url,
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
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="en"
      className={cn('font-sans', fontSans.variable)}
      suppressHydrationWarning
    >
      <head />
      <body className="no-repeat relative w-full bg-[#161616] bg-[url(/bg.svg)] bg-cover bg-fixed text-white">
        <Container>{children}</Container>

        <BottomBar />
      </body>
    </html>
  )
}

export default RootLayout
