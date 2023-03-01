'use client'

import Image from 'next/image'

import { findSingleWorkBySlug } from '@/lib/fetch'
import { Work } from '@/lib/types/work'
import { cn } from '@/utils/classNames'
import { shimmer, toBase64 } from '@/utils/shimmer'
import { useQuery } from '@tanstack/react-query'

export const SingleWork = ({ slug }: { slug: string }) => {
  const { data: work, isLoading } = useQuery<Work>({
    queryKey: ['work', slug],
    queryFn: () => findSingleWorkBySlug(slug),
  })
  if (isLoading || !work) return <p>Loading...</p>

  return (
    <>
      <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl">
        <Image
          className={cn(
            'object-cover',
            'transition-all duration-500 hover:scale-105 active:scale-100'
          )}
          src="/gradient.jpg"
          alt={work.metadata.title}
          fill
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(
            shimmer(128, 96)
          )}`}
        />
        <h1 className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xl font-bold">
          {work?.metadata.title}
        </h1>
      </div>
    </>
  )
}
