import { BASE_URL } from '@/utils/consts'
import { getPageMetadata } from '@/utils/metadata'
import { Client } from '@notionhq/client'

import { env } from './env'
import type { Work, WorkMetadata } from './types/work'

const { NOTION_KEY, DATABASE_ID } = env

const notion = new Client({ auth: NOTION_KEY })

export const findAllWorks = async () => {
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
          property: 'ReleaseDate',
          direction: 'descending',
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

export const findSingleWorkBySlug = async (slug: string) => {
  const res = await fetch(`${BASE_URL}/api/work?slug=${slug}`)
  return (await res.json()) as Work
}
