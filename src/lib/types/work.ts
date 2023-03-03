export type WorkMetadata = {
  id: string
  cover: string
  title: string
  slug: string
  type: 'Project' | 'Design'
}

export type Work = {
  metadata: WorkMetadata
  markdown: string
}
