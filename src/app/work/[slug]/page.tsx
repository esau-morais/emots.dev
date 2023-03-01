import { Metadata } from 'next'

import { SingleWork } from '@/components/SingleWork'
import { findSingleWorkBySlug } from '@/lib/fetch'
import { BASE_URL } from '@/utils/consts'

type Params = {
  params: { slug: string }
}

export const generateMetadata = async ({ params }: Params) => {
  const work = await findSingleWorkBySlug(params.slug)
  const image = `${BASE_URL}/api/og?title=${work.metadata.title}`

  return {
    title: work.metadata.title,
    openGraph: { images: [image] },
    twitter: { images: [image] },
  } as Metadata
}

const SingleWorkPage = ({ params: { slug } }: Params) => {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-16">
      <SingleWork slug={slug} />
    </div>
  )
}

export default SingleWorkPage
