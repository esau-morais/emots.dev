import { BASE_URL } from '@/utils/consts'

import type { Work } from './types/work'

export const findSingleWorkBySlug = async (slug: string) => {
  const res = await fetch(`${BASE_URL}/api/work?slug=${slug}`)
  return (await res.json()) as Work
}
