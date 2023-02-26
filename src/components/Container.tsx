'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

import { useMediaQuery } from '@/hooks/mediaQuery'
import { Analytics } from '@vercel/analytics/react'

export const Container = ({ children }: { children: ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <main className="relative mx-auto grid max-w-3xl grid-cols-6 gap-6 px-6 pb-20 pt-16">
      {children}

      <Analytics />

      <Toaster position={!isMobile ? 'top-right' : 'top-center'} />
    </main>
  )
}
