'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

import { Analytics } from '@vercel/analytics/react'

export const Container = ({ children }: { children: ReactNode }) => {
  return (
    <main className="mx-auto grid max-w-3xl grid-cols-6 gap-6 px-6 pb-40 pt-16">
      {children}

      <Analytics />

      <Toaster />
    </main>
  )
}
