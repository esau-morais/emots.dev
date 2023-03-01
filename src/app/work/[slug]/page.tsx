import { Metadata } from 'next'
import Image from 'next/image'

import { env } from '@/lib/env'
import { cn } from '@/utils/classNames'
import { BASE_URL } from '@/utils/consts'
import { getPageMetadata } from '@/utils/metadata'
import { shimmer, toBase64 } from '@/utils/shimmer'

type Params = {
  params: { slug: string }
}
const { NOTION_KEY, DATABASE_ID } = env

const findSingleWorkBySlug = async (slug: string) => {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            property: 'Slug',
            formula: {
              string: {
                equals: slug,
              },
            },
          },
        }),
      }
    )

    const page = (await response.json()) as any
    const metadata = getPageMetadata(page.results[0])

    return metadata
  } catch (error) {
    if (error instanceof Error) console.error(error)
  }
}

export const generateMetadata = async ({ params }: Params) => {
  const work = await findSingleWorkBySlug(params.slug)
  const image = `${BASE_URL}/api/og?title=${work?.title}`

  return {
    title: work?.title,
    openGraph: { images: [image] },
    twitter: { images: [image] },
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
          src="/gradient.jpg"
          alt={work?.title ?? 'Work'}
          fill
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(
            shimmer(128, 96)
          )}`}
        />
        <h1 className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xl font-bold">
          {work?.title}
        </h1>
      </div>
    </div>
  )
}

export default SingleWorkPage
