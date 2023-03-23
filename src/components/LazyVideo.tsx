'use client'

import { useRef } from 'react'

import { useIntersectionObserver } from '@/hooks/intersectionObserver'
import { cn } from '@/utils/classNames'

export const LazyVideo = ({ src }: { src: string }) => {
  const videoRef = useRef(null)
  const entry = useIntersectionObserver(videoRef, {})
  const isVisible = !!entry?.isIntersecting

  return (
    <video
      ref={videoRef}
      className={cn(
        'mt-4 aspect-video w-full rounded-2xl',
        !isVisible ? 'animate-pulse border-neutral-600/80 blur-md' : null
      )}
      src={src}
      autoPlay
      loop
    />
  )
}
