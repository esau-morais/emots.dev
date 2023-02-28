'use client'

import ReactMarkdown from 'react-markdown'
import { SpecialComponents } from 'react-markdown/lib/ast-to-react'
import { NormalComponents } from 'react-markdown/lib/complex-types'

import remarkGfm from 'remark-gfm'

const components:
  | Partial<Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents>
  | undefined = {
  h1: ({ children }) => <h1 className="text-2xl font-bold">{children}</h1>,
}

export const MarkdownWork = ({ markdown }: { markdown: string }) => {
  return (
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {markdown}
    </ReactMarkdown>
  )
}
