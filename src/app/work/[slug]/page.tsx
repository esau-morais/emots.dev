import { Metadata } from 'next'

import { SingleWork } from '@/components/SingleWork'
import { findSingleWorkBySlug } from '@/lib/fetch'

type Params = {
  params: { slug: string }
}

export const generateMetadata = async ({ params }: Params) => {
  const work = await findSingleWorkBySlug(params.slug)

  return {
    title: work.metadata.title,
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
