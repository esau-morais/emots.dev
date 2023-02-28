import { Metadata } from 'next'
import Image from 'next/image'

import { MarkdownWork } from '@/components/MarkdownWork'
import { Work } from '@/lib/types/work'
import { cn } from '@/utils/classNames'
import { BASE_URL } from '@/utils/consts'
import { shimmer, toBase64 } from '@/utils/shimmer'

const findSingleWorkBySlug = async (slug: string) => {
  const res = await fetch(`${BASE_URL}/api/work?slug=${slug}`)
  return (await res.json()) as Work
}

export const revalidate = 60

type Params = {
  params: { slug: string }
}

export const generateMetadata = async ({ params }: Params) => {
  const work = await findSingleWorkBySlug(params.slug)

  return {
    title: work.metadata.title,
  } as Metadata
}

const SingleWorkPage = async ({ params: { slug } }: Params) => {
  const work = await findSingleWorkBySlug(slug)

  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl">
        <Image
          className={cn(
            'object-cover',
            'transition-all duration-500 hover:scale-105 active:scale-100'
          )}
          src={work.metadata.cover}
          alt={work.metadata.title}
          fill
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(
            shimmer(128, 96)
          )}`}
        />
      </div>

      <MarkdownWork markdown={work.markdown} />
    </div>
  )
}

export default SingleWorkPage
