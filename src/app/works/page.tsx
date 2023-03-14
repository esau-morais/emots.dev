import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { env } from '@/lib/env'
import type { WorkMetadata } from '@/lib/types/work'
import { cn } from '@/utils/classNames'
import { url } from '@/utils/consts'
import { getPageMetadata } from '@/utils/metadata'
import { toBase64, shimmer } from '@/utils/shimmer'
import { Client } from '@notionhq/client'
import { IconArrowUpRight } from '@tabler/icons-react'

const { NOTION_KEY, DATABASE_ID } = env

const notion = new Client({ auth: NOTION_KEY })

const findAllWorks = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Published',
        },
      },
      sorts: [
        {
          property: 'Title',
          direction: 'ascending',
        },
      ],
    })

    const allWorks = response.results
    return allWorks.map((singleWork: unknown) => ({
      ...getPageMetadata(singleWork),
    })) as WorkMetadata[]
  } catch (error) {
    if (error instanceof Error) console.error(error)
  }
}

export const revalidate = 60

export const metadata = {
  title: 'Works',
  openGraph: {
    url: `${url}/works`,
  },
}

const Works = async () => {
  const works = await findAllWorks()

  return (
    <Container>
      {works?.map((work) => (
        <Link
          className={cn(
            'col-span-6 flex flex-col items-center space-y-1 overflow-hidden rounded-2xl border border-neutral-200/10 bg-[#1A1A1A]/90 p-2 backdrop-blur-md md:h-52 md:odd:col-span-3 md:even:col-span-3 md:first-of-type:col-span-6'
          )}
          key={work.id}
          href={`/work/${work.slug}`}
        >
          <div className="relative aspect-video h-full w-full overflow-hidden rounded-t-2xl bg-[#1A1A1A]/90 backdrop-blur-md">
            {work.cover ? (
              <Image
                className={cn(
                  'object-cover',
                  'transition-all duration-500 hover:scale-105 active:scale-100'
                )}
                src={work.cover}
                alt={work.title}
                loading="lazy"
                fill
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(
                  shimmer(128, 96)
                )}`}
              />
            ) : (
              <h1 className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xl font-bold">
                {work.title}
              </h1>
            )}
          </div>

          <button
            type="button"
            className={cn(
              'inline-flex w-full items-center justify-center space-x-2 rounded-b-2xl p-2',
              'bg-[#161616]/80 backdrop-blur-md transition-colors hover:bg-neutral-800'
            )}
          >
            <span>View {work.type === 'Project' ? 'Project' : 'Design'}</span>
            <IconArrowUpRight width={16} height={16} />
          </button>
        </Link>
      ))}
    </Container>
  )
}

export default Works
