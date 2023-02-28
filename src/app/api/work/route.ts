import { type NextRequest, NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { getPageMetadata } from '@/utils/metadata'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

const { NOTION_KEY, DATABASE_ID } = env

const notionClient = new Client({ auth: NOTION_KEY })
const notionToMarkdown = new NotionToMarkdown({ notionClient })

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url as string)
  const slug = searchParams.get('slug') as string

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

    return NextResponse.json(
      {
        metadata,
        markdown: mdString,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json(error, {
        status: 500,
      })
  }
}
