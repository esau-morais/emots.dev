import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { getPageMetadata } from '@/utils/metadata'

const { NOTION_KEY, DATABASE_ID } = env

export const GET = async () => {
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
    return NextResponse.json(
      allWorks.results.map(
        (singleWork: unknown) => ({
          ...getPageMetadata(singleWork),
        }),
        {
          status: 200,
        }
      )
    )
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json(error, {
        status: 500,
      })
  }
}
