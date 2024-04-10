import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { findAllWorks } from '@/lib/fetch'
import { cn } from '@/utils/classNames'
import { getFiletypeFromString } from '@/utils/filetype'
import { shimmer, toBase64 } from '@/utils/shimmer'
import { IconArrowUpRight } from '@tabler/icons-react'

export const revalidate = 60

export const metadata = {
  title: 'Works',
}

const Works = async () => {
  const works = await findAllWorks()

  return (
    <Container className="mx-auto columns-1 px-6 pb-20 pt-16 md:columns-3">
      {works?.map((work) => (
        <Link
          className={cn(
            'mb-4 flex flex-col items-center space-y-1 overflow-hidden rounded-2xl border border-neutral-200/10 bg-[#1A1A1A]/90 p-2 backdrop-blur-md',
            work.cover
              ? getFiletypeFromString(work.cover) === 'gif'
                ? 'aspect-video'
                : 'aspect-[1.62315/1]'
              : 'aspect-video'
          )}
          key={work.id}
          href={`/work/${work.slug}`}
        >
          <div
            className={cn(
              'group relative h-full w-full overflow-hidden bg-[#1A1A1A]/90 backdrop-blur-md',
              work.cover
                ? getFiletypeFromString(work.cover) === 'gif' ||
                  work.type === 'Design'
                  ? 'aspect-video rounded-2xl'
                  : 'aspect-[1.62315/1] rounded-t-2xl'
                : 'aspect-video'
            )}
          >
            {work.cover ? (
              <>
                <Image
                  className={cn(
                    'object-cover group-hover:opacity-50',
                    'transition-all duration-500 hover:scale-105 active:scale-100'
                  )}
                  src={work.cover}
                  alt={work.title}
                  loading="lazy"
                  fill
                  sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(
                    shimmer(128, 96)
                  )}`}
                  unoptimized={getFiletypeFromString(work.cover) === 'gif'}
                />
                <h1 className="absolute bottom-1 left-2 line-clamp-1 font-semibold text-base text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {work.title}
                </h1>
              </>
            ) : (
              <h1 className="absolute inset-x-0 top-1/2 line-clamp-2 -translate-y-1/2 text-center text-xl font-bold">
                {work.title}
              </h1>
            )}
          </div>

          {(work.cover && getFiletypeFromString(work.cover) === 'gif') ||
          work.type === 'Design' ? null : (
            <div
              className={cn(
                'inline-flex w-full items-center justify-center space-x-2 rounded-b-2xl p-2',
                'bg-[#161616]/80 backdrop-blur-md transition-colors hover:bg-neutral-800'
              )}
            >
              <span>View Project</span>
              <IconArrowUpRight width={16} height={16} />
            </div>
          )}
        </Link>
      ))}
    </Container>
  )
}

export default Works
