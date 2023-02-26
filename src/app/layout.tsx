import { Space_Grotesk as FontSans } from 'next/font/google'

import { Container } from '@/components/Container'
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
    type: 'website',
    url: url,
    title: title,
    description: description,
    image: ogImage,
    'image:width': '1600',
    'image:height': '630',
  },
  twitter: {
    card: 'summary_large_image',
    url: url,
    title: title,
    description: description,
    image: ogImage,
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
      <body className="no-repeat w-full bg-[#161616] bg-[url(/bg.svg)] bg-cover bg-fixed text-white">
        <Container>{children}</Container>
      </body>
    </html>
  )
}

export default RootLayout
