import { NextApiResponse } from 'next'
import { NextRequest } from 'next/server'

import { env } from '@/lib/env'
import { getPageMetadata } from '@/utils/metadata'

const { NOTION_KEY, DATABASE_ID } = env

const handler = async (_: NextRequest, res: NextApiResponse) => {
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
    return res.status(200).json(
      allWorks.results.map((singleWork: unknown) => ({
        ...getPageMetadata(singleWork),
      }))
    )
  } catch (error) {
    if (error instanceof Error) return res.status(500).json(error)
  }
}

export default handler
