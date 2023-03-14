'use client'

import type { PropsWithChildren } from 'react'
import { Toaster } from 'react-hot-toast'

import { useMediaQuery } from '@/hooks/mediaQuery'
import { Analytics } from '@vercel/analytics/react'

export const Container = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <main className={className}>
      {children}

      <Analytics />

      <Toaster position={!isMobile ? 'top-right' : 'top-center'} />
    </main>
  )
}
