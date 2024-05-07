import Link from 'next/link'

import { findAllWorks } from '@/lib/fetch'

export const revalidate = 60

export const metadata = {
  title: 'Works',
}

const Works = async () => {
  const works = await findAllWorks()

  return (
    <table className="mx-auto w-full max-w-2xl text-sm">
      <thead>
        <tr className="transition-colors hover:bg-[#11111b] focus:bg-[#11111b] focus:outline-none">
          <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium" />
          <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
            Project
          </th>
          <th className="text-muted-foreground h-12 px-4 text-right align-middle font-medium">
            Year
          </th>
        </tr>
      </thead>
      <tbody className="[counter-reset:project]">
        {works?.map((work) => (
          <tr
            key={work.id}
            className="w-full border-l-2 border-transparent transition-colors hover:bg-[#11111b] focus:border-[#f5e0dc] focus:bg-[#11111b] focus:outline-none"
            tabIndex={0}
          >
            <td className="w-4 p-4 align-middle font-medium text-[#6c7086] before:![content:counter(project)] before:![counter-increment:project]" />
            <td className="p-4 align-middle font-medium">
              <Link
                className="underline underline-offset-4"
                href={`/work/${work.slug}`}
              >
                {work.title}
              </Link>
            </td>
            <td className="p-4 text-right align-middle font-medium">
              {new Date(work.createdAt).getFullYear()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Works
