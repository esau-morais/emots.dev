import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { env } from '@/lib/env'
import { WorkMetadata } from '@/lib/types/work'
import { cn } from '@/utils/classNames'
import { getPageMetadata } from '@/utils/metadata'
import { shimmer, toBase64 } from '@/utils/shimmer'
import { IconArrowUpRight } from '@tabler/icons-react'

const { NOTION_KEY, DATABASE_ID } = env

const findAllWorks = async () => {
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
            property: 'Status',
            select: {
              equals: 'Published',
            },
          },
        }),
      }
    )

    const allWorks = (await response.json()) as any
    return allWorks.results.map((singleWork: unknown) => ({
      ...getPageMetadata(singleWork),
    })) as WorkMetadata[]
  } catch (error) {
    if (error instanceof Error) console.error(error)
  }
}

export const metadata = {
  title: 'Works',
}

const Works = async () => {
  const works = await findAllWorks()

  return (
    <Container>
      {works?.map((work) => (
        <Link
          className={cn(
            'col-span-6 flex flex-col items-center space-y-1 overflow-hidden rounded-2xl border border-neutral-200/10 bg-[#1A1A1A]/90 p-2 backdrop-blur-md md:h-52 md:odd:col-span-2 md:even:col-span-4 md:first-of-type:col-span-6'
          )}
          key={work.id}
          href={`/work/${work.slug}`}
        >
          <div className="relative aspect-video h-full w-full overflow-hidden rounded-t-2xl">
            <Image
              className={cn(
                'object-cover',
                'transition-all duration-500 hover:scale-105 active:scale-100'
              )}
              src="/gradient.jpg"
              alt={work.title}
              loading="lazy"
              fill
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(
                shimmer(128, 96)
              )}`}
            />
            <h1 className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xl font-bold">
              {work.title}
            </h1>
          </div>
          <button
            type="button"
            className={cn(
              'inline-flex w-full items-center justify-center space-x-2 rounded-b-2xl p-2',
              'bg-[#161616]/80 backdrop-blur-md transition-colors hover:bg-neutral-800'
            )}
          >
            <span>View</span>
            <IconArrowUpRight width={16} height={16} />
          </button>
        </Link>
      ))}
    </Container>
  )
}

export default Works
