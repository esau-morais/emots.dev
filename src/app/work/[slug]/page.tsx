import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { env } from '@/lib/env'
import { Work } from '@/lib/types/work'
import { cn } from '@/utils/classNames'
import { BASE_URL } from '@/utils/consts'
import { getPageMetadata } from '@/utils/metadata'
import { shimmer, toBase64 } from '@/utils/shimmer'
import { Client } from '@notionhq/client'
import { IconArrowBackUp } from '@tabler/icons-react'
import { NotionToMarkdown } from 'notion-to-md'
import remarkGfm from 'remark-gfm'

type Params = {
  params: { slug: string }
}
const { NOTION_KEY, DATABASE_ID } = env

const notionClient = new Client({ auth: NOTION_KEY })
const notionToMarkdown = new NotionToMarkdown({ notionClient })

const findSingleWorkBySlug = async (slug: string) => {
  try {
    const response = await notionClient.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Slug',
        formula: {
          string: {
            equals: slug,
          },
        },
      },
    })

    const page = response.results[0]
    const metadata = getPageMetadata(page)
    const mdblocks = await notionToMarkdown.pageToMarkdown(page.id)
    const mdString = notionToMarkdown.toMarkdownString(mdblocks)

    return {
      metadata,
      markdown: mdString,
    } as Work
  } catch (error) {
    if (error instanceof Error) console.error(error)
  }
}

export const generateMetadata = async ({ params }: Params) => {
  const work = await findSingleWorkBySlug(params.slug)
  const image = `${BASE_URL}/api/og?title=${work?.metadata.title}`

  return {
    title: work?.metadata.title,
    openGraph: { images: [image] },
    twitter: { images: [image] },
  } as Metadata
}

const SingleWorkPage = async ({ params: { slug } }: Params) => {
  const work = await findSingleWorkBySlug(slug)

  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-16">
      <Link className="mb-2 inline-flex items-center" href="/works">
        <IconArrowBackUp />
        <span>Works</span>
      </Link>
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

      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="mt-8 mb-2 text-xl font-bold">{children}</h2>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-rosewater bg-base p-4 font-medium italic leading-relaxed text-white">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="ml-4 list-['▲'] flex-wrap space-y-1">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="pl-4 marker:text-xs">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          a: ({ children, ...props }) => (
            <a
              className="underline decoration-blue decoration-wavy underline-offset-4"
              {...props}
            >
              {children}
            </a>
          ),
          p: ({ children, node }) => {
            if ((node.children[0] as any).tagName === 'img') {
              const image = node.children[0] as any

              return (
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl">
                  <Image
                    src={image.properties.src}
                    className={cn(
                      'object-cover',
                      'transition-all duration-500 hover:scale-105 active:scale-100'
                    )}
                    alt={work?.metadata.title ?? 'Work'}
                    loading="lazy"
                    fill
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(
                      shimmer(128, 96)
                    )}`}
                  />
                </div>
              )
            }
            return <p className="mt-4">{children}</p>
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {work?.markdown ?? ''}
      </ReactMarkdown>
    </div>
  )
}

export default SingleWorkPage
