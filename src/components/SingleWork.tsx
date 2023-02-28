'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { findSingleWorkBySlug } from '@/lib/fetch'
import { Work } from '@/lib/types/work'
import { cn } from '@/utils/classNames'
import { shimmer, toBase64 } from '@/utils/shimmer'
import { useQuery } from '@tanstack/react-query'

import { MarkdownWork } from './MarkdownWork'

export const SingleWork = ({ slug }: { slug: string }) => {
  const { data: work } = useQuery<Work>({
    queryKey: ['work', slug],
    queryFn: () => findSingleWorkBySlug(slug),
  })
  console.log({ work })

  return (
    <>
      <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl">
        <Image
          className={cn(
            'object-cover',
            'transition-all duration-500 hover:scale-105 active:scale-100'
          )}
          src="/gradient.jpg"
          alt={work?.metadata.title ?? 'Work'}
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

      <MarkdownWork markdown={work?.markdown} />
    </>
  )
}