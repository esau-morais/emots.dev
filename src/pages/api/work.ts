import { NextApiResponse } from 'next'
import { NextRequest } from 'next/server'

import { env } from '@/lib/env'
import { getPageMetadata } from '@/utils/metadata'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

const { NOTION_KEY, DATABASE_ID } = env

const notionClient = new Client({ auth: NOTION_KEY })
const notionToMarkdown = new NotionToMarkdown({ notionClient })

const handler = async (req: NextRequest, res: NextApiResponse) => {
  const { searchParams } = req.nextUrl
  const slug = searchParams.get('slug') as string

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
    console.log({ page })
    const metadata = getPageMetadata(page.results[0])
    const mdblocks = await notionToMarkdown.pageToMarkdown(page.results[0].id)
    const mdString = notionToMarkdown.toMarkdownString(mdblocks)

    return res.status(200).json({
      metadata,
      markdown: mdString,
    })
  } catch (error) {
    if (error instanceof Error) return res.status(500).json(error)
  }
}

export default handler
