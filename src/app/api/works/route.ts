import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { getPageMetadata } from '@/utils/metadata'
import { Client } from '@notionhq/client'

const { NOTION_KEY, DATABASE_ID } = env
const notion = new Client({ auth: NOTION_KEY })

export const GET = async () => {
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
    return NextResponse.json(
      allWorks.map(
        (singleWork) => ({
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

